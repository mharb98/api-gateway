import { BooleanField, NumberField, StringField, UUIDField } from '../../../../../../common/decorators/dtos';

export class CreateServiceInstanceRequestDto {
  @UUIDField({ description: 'UID of the service this instance belongs to' })
  serviceUid: string;

  @StringField({
    maxLength: 255,
    description: 'Hostname or IP address of the upstream instance',
    example: 'localhost',
  })
  host: string;

  @NumberField({
    integer: true,
    min: 1,
    max: 65535,
    description: 'Port number of the upstream instance',
    example: 3001,
  })
  port: number;

  @NumberField({
    required: false,
    integer: true,
    min: 1,
    default: 1,
    description: 'Load-balancing weight — higher values receive proportionally more traffic',
    example: 1,
  })
  weight?: number;

  @BooleanField({
    required: false,
    default: true,
    description: 'Whether this instance is healthy and eligible to receive traffic',
  })
  isHealthy?: boolean;
}
