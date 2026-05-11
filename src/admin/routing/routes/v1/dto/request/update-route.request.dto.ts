import { PartialType } from '@nestjs/swagger';
import { CreateRouteRequestDto } from './create-route.request.dto';

export class UpdateRouteRequestDto extends PartialType(CreateRouteRequestDto) {}
