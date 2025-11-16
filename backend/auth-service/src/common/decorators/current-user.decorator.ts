import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from 'src/api/auth/types/jwt-payload.type';

export const CurrentUserId = createParamDecorator(
  (data: undefined, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;
    return user.sub;
  },
);
