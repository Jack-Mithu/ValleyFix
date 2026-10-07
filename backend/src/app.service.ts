import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'valleyFix backend is running!';
  }

  // ...existing methods...
}