const dotenv = require('dotenv');

dotenv.config();

const requiredEnvVariables = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'JWT_SECRET'
];

for (const variable of requiredEnvVariables) {
    if (!process.env[variable]) {
        throw new Error(`Missing required environment variable: ${variable}`);
    }
}

module.exports = {
    port: Number(process.env.PORT) || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    jwtSecret: process.env.JWT_SECRET,
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4200'
};