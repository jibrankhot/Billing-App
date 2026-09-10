const app = require('./app');
const { port, nodeEnv } = require('./config/env');

const server = app.listen(port, () => {
    console.log('');
    console.log('========================================');
    console.log('          STOCKLY API SERVER');
    console.log('========================================');
    console.log(`Environment : ${nodeEnv}`);
    console.log(`Port        : ${port}`);
    console.log(`API         : http://localhost:${port}`);
    console.log(`Health      : http://localhost:${port}/api/health`);
    console.log('========================================');
    console.log('');
});

const shutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down...`);

    server.close(() => {
        console.log('Stockly API server stopped.');
        process.exit(0);
    });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));