const errorMiddleware = (err, req, res, next) => {
    console.error('========================================');
    console.error('API ERROR');
    console.error('Message:', err?.message || err);
    console.error('Code:', err?.code || 'N/A');
    console.error('Details:', err?.details || 'N/A');
    console.error('Hint:', err?.hint || 'N/A');
    console.error('Stack:', err?.stack || 'N/A');
    console.error('========================================');

    const statusCode = err?.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        message: err?.message || 'Internal server error',
        code: err?.code || undefined,
        details: err?.details || undefined,
        hint: err?.hint || undefined
    });
};

module.exports = errorMiddleware;