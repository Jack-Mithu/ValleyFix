import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Put @UseGuards(JwtAuthGuard) on any route that requires a logged-in user.
// It runs JwtStrategy and responds 401 if the token is missing or invalid.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
