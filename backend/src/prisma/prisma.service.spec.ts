import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service.js';

describe('PrismaService', () => {
  it('should be created when DATABASE_URL is configured', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        {
          provide: ConfigService,
          useValue: {
            // Creating the client does not open a connection, so a fake URL is fine.
            get: () => 'postgresql://user:pass@localhost:5432/test',
          },
        },
      ],
    }).compile();

    expect(module.get(PrismaService)).toBeDefined();
  });

  it('should fail fast when DATABASE_URL is missing', async () => {
    await expect(
      Test.createTestingModule({
        providers: [
          PrismaService,
          { provide: ConfigService, useValue: { get: () => undefined } },
        ],
      }).compile(),
    ).rejects.toThrow('DATABASE_URL is missing');
  });
});
