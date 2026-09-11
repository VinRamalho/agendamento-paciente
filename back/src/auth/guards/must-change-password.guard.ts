import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { User } from '../../users/entities/user.entity';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthService } from '../auth.service';

@Injectable()
export class MustChangePasswordGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: User }>();
    if (!request.user) {
      return true;
    }

    this.authService.assertCanAccessApp(
      request.user,
      request.path ?? request.url,
    );
    return true;
  }
}
