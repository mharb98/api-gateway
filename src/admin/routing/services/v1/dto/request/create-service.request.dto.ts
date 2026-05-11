import { EnumField, StringField } from '../../../../../../common/decorators/dtos';
import { ServiceProtocol } from '../../../../../../data-access/entities/service.entity';

export class CreateServiceRequestDto {
  @StringField({
    maxLength: 100,
    trim: true,
    description: 'Unique service name',
    example: 'user-service',
  })
  name: string;

  @EnumField(ServiceProtocol, {
    required: false,
    default: ServiceProtocol.HTTP,
    description: 'Upstream protocol',
  })
  protocol?: ServiceProtocol;
}
