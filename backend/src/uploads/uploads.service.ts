import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { basename, extname, resolve } from 'node:path';

export type TechnicianUploadType = 'identity' | 'profile';

@Injectable()
export class UploadsService {
  private readonly uploadRoot = resolve(
    process.cwd(),
    'uploads',
    'technicians',
  );

  async saveTechnicianFile(
    file: Express.Multer.File,
    type: TechnicianUploadType,
  ): Promise<{ key: string; path: string }> {
    if (!file || !Buffer.isBuffer(file.buffer)) {
      throw new BadRequestException('A valid file is required.');
    }

    const allowedExtensions =
      type === 'identity'
        ? ['.pdf', '.jpg', '.jpeg', '.png']
        : ['.jpg', '.jpeg', '.png', '.webp'];

    const extension = extname(basename(file.originalname)).toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      throw new BadRequestException(
        `Unsupported ${type} file format.`,
      );
    }

    const maxSize =
      type === 'identity'
        ? 5 * 1024 * 1024
        : 3 * 1024 * 1024;

    if (file.size > maxSize) {
      throw new BadRequestException(
        type === 'identity'
          ? 'Identity documents must be 5 MB or smaller.'
          : 'Profile pictures must be 3 MB or smaller.',
      );
    }

    const directory =
      type === 'identity'
        ? resolve(this.uploadRoot, 'identity')
        : resolve(this.uploadRoot, 'profiles');

    await mkdir(directory, { recursive: true });

    const key = randomUUID();
    const filename = `${key}${extension}`;
    const absolutePath = resolve(directory, filename);

    await writeFile(absolutePath, file.buffer, { flag: 'wx' });

    return {
      key,
      path: absolutePath,
    };
  }

  async deleteFile(path: string): Promise<void> {
    const identityDirectory = resolve(this.uploadRoot, 'identity');
    const profileDirectory = resolve(this.uploadRoot, 'profiles');
    const absolutePath = resolve(path);

    const isAllowedPath = [
      identityDirectory,
      profileDirectory,
    ].some(
      (directory) =>
        absolutePath.startsWith(`${directory}\\`) ||
        absolutePath.startsWith(`${directory}/`),
    );

    if (!isAllowedPath) {
      throw new BadRequestException(
        'The requested file is outside the upload directories.',
      );
    }

    try {
      await unlink(absolutePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }
}
