import {
  StringField,
  EmailField,
  UUIDField,
  BooleanField,
  EnumField,
} from '../../decorators/dtos/index';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
}

export class CreateUserDto {
  @StringField({
    minLength: 2,
    maxLength: 100,
    trim: true,
    description: 'Full name of the user',
    example: 'John Doe',
  })
  name: string;

  @EmailField({
    description: 'User email address',
    example: 'john@example.com',
  })
  email: string;

  @StringField({
    minLength: 8,
    maxLength: 128,
    description: 'User password (min 8 characters)',
    example: 'Secret123!',
  })
  password: string;

  @EnumField(UserRole, {
    default: UserRole.USER,
    description: 'User role',
    example: UserRole.USER,
  })
  role: UserRole = UserRole.USER;

  @UUIDField({
    required: false,
    description: 'UUID of the organization this user belongs to',
  })
  organizationId?: string;

  @BooleanField({
    default: true,
    description: 'Whether the user account is active',
    example: true,
  })
  isActive: boolean = true;

  @StringField({
    required: false,
    isArray: true,
    description: 'List of permission tags for this user',
    example: ['read:users', 'write:posts'],
  })
  tags?: string[];
}
