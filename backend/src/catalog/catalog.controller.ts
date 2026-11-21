import { Controller, Get, Header, Param, ParseIntPipe, Query, StreamableFile } from '@nestjs/common';
import { createReadStream } from 'node:fs';
import { CatalogService } from './catalog.service.js';
import { TechniciansQueryDto } from './dto/catalog.dto.js';

// Public endpoints: no login needed (used by the website and the future app).
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('services')
  services() {
    return this.catalog.services();
  }

  @Get('areas')
  areas() {
    return this.catalog.areas();
  }

  @Get('technicians')
  technicians(@Query() query: TechniciansQueryDto) {
    return this.catalog.technicians(query);
  }

  @Get('technicians/:id/photo')
  @Header('Cache-Control', 'public, max-age=3600')
  @Header('X-Content-Type-Options', 'nosniff')
  async technicianPhoto(@Param('id', ParseIntPipe) id: number) {
    const photo = await this.catalog.technicianPhoto(id);
    return new StreamableFile(createReadStream(photo.path), { type: photo.contentType });
  }
}
