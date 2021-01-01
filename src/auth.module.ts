import { Module, Injectable, ExecutionContext, createParamDecorator } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard, PassportModule, PassportStrategy } from '@nestjs/passport';
import config from "./config";
import { GqlExecutionContext } from '@nestjs/graphql';

export interface IJwtUserData {
    user_id: string,
    contact_name: string,
    branch_id: string,
    email: string,
}

export interface IJwtPayload {
    data: IJwtUserData
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
            jwtFromRequest: ExtractJwt.fromHeader(config.auth.token_header_key),
            ignoreExpiration: true,
            secretOrKey: config.auth.jwt_secret,
        });
    }

    async validate(payload: IJwtPayload) {
        // do something with payload, if any.
        return payload.data;
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