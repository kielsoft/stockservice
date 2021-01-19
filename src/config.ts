export default {
    environment: process.env.APP_ENV,
    appName: 'stockservice',
    appPort: Number(process.env.APP_PORT || 60001),
    mysql: {
        host: process.env.DATABASE_HOST || '127.0.0.1',
        port: Number(process.env.DATABASE_PORT || 3306),
        username: process.env.DATABASE_USERNAME || 'root',
        password: process.env.DATABASE_PASSWORD || 'root',
        database: process.env.DATABASE_NAME || 'codemode_stockservice',
    },
    auth: {
        jwt_secret: process.env.JWT_SECRET_KEY || 'jwt_secret',
        token_header_key: process.env.TOKEN_HEADER_KEY || 'x-user-token'
    },
    commom: {
        avoid_no_product_or_qty_error: (typeof process.env.AVAOID_NO_PRODUCT_OR_QTY_ERROR !== 'undefined')? !!Number(process.env.AVAOID_NO_PRODUCT_OR_QTY_ERROR) : true
    }
}