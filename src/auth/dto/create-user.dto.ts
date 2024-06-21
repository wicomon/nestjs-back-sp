import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  
  @ApiProperty({
    example: 'example@mail.com',
    description: 'user email',
    required: true
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '*********',
    description: 'user pass',
    required: true
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The password must have a Uppercase, lowercase letter and a number',
  })
  password: string;

  @ApiProperty({
    example: 'jhon doe',
    description: 'user full name',
    required: true
  })
  @IsString()
  @MinLength(1)
  fullName: string;
}
