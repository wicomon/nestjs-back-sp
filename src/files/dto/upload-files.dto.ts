import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class UploadFilesDto {
  @ApiProperty({
    example: 'images',
    description: 'image folder',
    required: true
  })
  @IsString()
  @MinLength(3)
  folder: string;
  
}