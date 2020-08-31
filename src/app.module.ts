import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import * as path from 'path';
import { StockModule } from './stock/stock.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth.module';

@Module({
  imports: [
    AuthModule,
    GraphQLModule.forRoot({
        autoSchemaFile: path.join(process.cwd(), 'gql/schema.gql'),
        context: ({ req }) => ({ req }),
    }),
    StockModule,
  ],
  controllers: [ AppController ],
})
export class AppModule { }
