require("dotenv").config();

import { NestFactory } from '@nestjs/core';
import { Logger } from "@nestjs/common";

import config from "./config";
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    await app.listen(config.appPort, () => {
        (new Logger()).log(`${config.appName} is started on PORT ${config.appPort}....`)
    });
}
bootstrap();

