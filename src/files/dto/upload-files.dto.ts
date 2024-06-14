import { IsString, MinLength } from "class-validator";

export class UploadFilesDto {
  @IsString()
  @MinLength(3)
  folder: string;
  
}