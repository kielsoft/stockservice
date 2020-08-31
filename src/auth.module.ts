import { Module, Injectable, ExecutionContext, createParamDecorator } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard, PassportModule, PassportStrategy } from '@nestjs/passport';
import config from "./config";
import { GqlExecutionContext } from '@nestjs/graphql';

export interface IJwtPayload {
    id: number,
    role_id: number
    role_name: string,
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    getRequest(context: ExecutionContext) {
        const ctx = GqlExecutionContext.create(context);
        return ctx.getContext().req;
    }
}

@Injectable()
class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: true,
            secretOrKey: config.auth.jwt_secret,
        });
    }

    async validate(payload: IJwtPayload) {
        // do something with payload, if any.
        return payload;
    }
}

export const CurrentUser = createParamDecorator(
    (data: unknown, context: ExecutionContext): IJwtPayload => {
      const ctx = GqlExecutionContext.create(context);
      return ctx.getContext().req.user;
    },
);

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
            secret: config.auth.jwt_secret,
            signOptions: {
                expiresIn: "12h",
            },
        }),
    ],
    providers: [ JwtStrategy ],
})
export class AuthModule { }