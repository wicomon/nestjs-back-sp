import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {
  
  @ApiProperty({
    default: 10, 
    description: 'rows needed'
  })
  @IsOptional()
  @IsPositive()
  @Type( () => Number ) //enableImpicitConversions: true
  limit?: number;

  @ApiProperty({
    default: 0, 
    description: 'rows to skip'
  })
  @IsOptional()
  @Min(0)
  @Type( () => Number )
  offset?: number;
}