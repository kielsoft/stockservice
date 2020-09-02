require("dotenv").config();
import config from "./config";
import { hostname } from 'os';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    await app.listen(config.appPort, () => {
        console.log(`started http://${hostname()}:${config.appPort}`)
    });
}
bootstrap();

