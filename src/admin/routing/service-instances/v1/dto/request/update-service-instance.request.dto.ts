import { PartialType } from '@nestjs/swagger';
import { CreateServiceInstanceRequestDto } from './create-service-instance.request.dto';

export class UpdateServiceInstanceRequestDto extends PartialType(
  CreateServiceInstanceRequestDto,
) {}
