import {
  BooleanField,
  EnumField,
  NumberField,
  StringField,
  UUIDField,
} from '../../../../../../common/decorators/dtos';
import { HttpMethod } from '../../../../../../data-access/entities/route.entity';

export class CreateRouteRequestDto {
  @UUIDField({ description: 'UID of the service that will handle this route' })
  serviceUid: string;

  @StringField({
    required: false,
    nullable: true,
    default: null,
    description: 'Optional hostname matcher',
    example: 'api.example.com',
  })
  host?: string | null;

  @StringField({
    maxLength: 255,
    description: 'Path pattern',
    example: '/users/:id',
  })
  pathPattern: string;

  @EnumField(HttpMethod, {
    required: false,
    nullable: true,
    default: null,
    description: 'HTTP method — omit or set null to match all methods',
  })
  method?: HttpMethod | null;

  @BooleanField({
    required: false,
    default: false,
    description: 'Strip the route prefix before forwarding to the upstream service',
  })
  stripPrefix?: boolean;

  @NumberField({
    required: false,
    integer: true,
    default: 0,
    description: 'Match priority — higher values are evaluated first',
    example: 10,
  })
  priority?: number;

  @BooleanField({
    required: false,
    default: true,
    description: 'Whether this route is active and will be loaded into the routing table',
  })
  isEnabled?: boolean;
}
