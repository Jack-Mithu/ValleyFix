import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import type { RegisterTechnicianDto } from './dto/register-technician.dto.js';

describe('AuthController', () => {
  let controller: AuthController;

  // A fake AuthService: the controller's job is only to pass data through.
  const authService = {
    register: vi.fn(),
    login: vi.fn(),
    registerTechnician: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    })
      // Guards are tested separately; here we only test the controller logic.
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(AuthController);
  });

  it('passes login details to the service', async () => {
    authService.login.mockResolvedValue({ accessToken: 't' });

    const dto = { email: 'a@example.com', password: 'password123' };
    await expect(controller.login(dto)).resolves.toEqual({ accessToken: 't' });
    expect(authService.login).toHaveBeenCalledWith(dto);
  });

  it('returns the authenticated user from /auth/me', () => {
    const user = {
      id: 1,
      name: 'Rhys',
      email: 'rhys@example.com',
      phone: null,
      role: 'customer',
    };

    expect(controller.me(user)).toEqual({ user });
  });

  it('rejects technician registration without an ID document', () => {
    expect(() =>
      controller.registerTechnician({} as RegisterTechnicianDto, {
        profilePicture: [{} as Express.Multer.File],
      }),
    ).toThrow(BadRequestException);

    expect(authService.registerTechnician).not.toHaveBeenCalled();
  });
});
