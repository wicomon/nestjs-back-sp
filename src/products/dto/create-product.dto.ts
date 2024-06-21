import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateProductDto {

  @ApiProperty({
    description: 'Product Title (UNIQUE)',
    nullable: false,
    minLength: 1
  })
  @IsString()
  @MinLength(2)
  title: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  slug?: string;
  
  @ApiProperty()
  @IsInt()
  @IsPositive()
  @IsOptional()
  stock?: number;

  @ApiProperty()
  @IsString({ each: true })
  @IsArray()
  sizes: string[];

  @ApiProperty()
  @IsIn(['men', 'women', 'kid', 'unisex'])
  @IsOptional()
  gender: string;

  @ApiProperty()
  @IsString({each: true})
  @IsArray()
  tags: string[];

  @ApiProperty()
  @IsString({each: true})
  @IsArray()
  @IsOptional()
  images?: string[];
}
