import { CatalogService } from './catalog.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { UploadsService } from '../uploads/uploads.service.js';

describe('CatalogService.technicians', () => {
  const prisma = {
    technicianProfile: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: 4,
          firstName: 'Gareth',
          lastName: 'Evans',
          bio: 'Plumber',
          profilePic: 'profiles/x.png',
          createdAt: new Date('2026-01-01'),
          technicianServices: [{ service: { name: 'Plumbing', slug: 'plumbing' } }],
          technicianServiceAreas: [{ serviceArea: { city: 'Cardiff' } }, { serviceArea: { city: 'Cardiff' } }],
          _count: { bookings: 3 },
        },
      ]),
    },
  };
  const service = new CatalogService(prisma as unknown as PrismaService, {} as UploadsService);

  it('only ever lists approved, active technicians', async () => {
    await service.technicians({ city: 'Cardiff', service: 'plumbing' });
    const where = prisma.technicianProfile.findMany.mock.calls[0][0].where;
    expect(where.approvalStatus).toBe('APPROVED');
    expect(where.user).toEqual({ isActive: true });
  });

  it('returns public-safe details only', async () => {
    const [tech] = await service.technicians({});
    expect(tech).toEqual({
      id: 4,
      name: 'Gareth E.',
      bio: 'Plumber',
      hasPhoto: true,
      memberSince: new Date('2026-01-01'),
      completedJobs: 3,
      services: [{ name: 'Plumbing', slug: 'plumbing' }],
      areas: ['Cardiff'], // de-duplicated
    });
    // Nothing private leaks out.
    const keys = JSON.stringify(tech);
    for (const secret of ['email', 'phone', 'ni_Number', 'id_Proof', 'lastName', 'profilePic']) {
      expect(keys).not.toContain(secret);
    }
  });
});
