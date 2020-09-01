export default {
    environment: process.env.NODE_ENV,
    appName: 'stockservice',
    mysql: {
        host: process.env.DATABASE_HOST || '127.0.0.1',
        port: Number(process.env.DATABASE_PORT || 3306),
        username: process.env.DATABASE_USERNAME || 'root',
        password: process.env.DATABASE_PASSWORD || 'root',
        database: process.env.DATABASE_NAME || 'codemode_stockservice',
    },
    auth: {
        jwt_secret: process.env.JWT_SECRET_KEY || 'jwt_secret'
    }
}