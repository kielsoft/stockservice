import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as path from 'path';
import config from '../config';
import * as entities from './entities';
import * as services from './services';
import * as resolvers from './resolvers';

@Module({
    imports: [
        HttpModule,
        TypeOrmModule.forRoot({
            type: 'mariadb',
            host: config.mysql.host,
            port: config.mysql.port,
            username: config.mysql.username,
            password: config.mysql.password,
            database: config.mysql.database,
            entities: [path.join(__dirname,  '/entities/**/**.entity{.ts,.js}')],
            namingStrategy: new SnakeNamingStrategy(),
            synchronize: true,
            debug: false,
            logging: false,
        }),
        TypeOrmModule.forFeature([...(<any>Object).keys(entities).map(k => entities[k])]),
    ],
    providers: [
        ...(<any>Object).keys(resolvers).map(k => resolvers[k]),
        ...(<any>Object).keys(services).map(k => services[k]),
    ]
    //   controllers: [...(<any>Object).keys(controllers).map(k => controllers[k])],
})
export class StockModule {}
