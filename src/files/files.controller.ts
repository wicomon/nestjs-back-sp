import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { fileFilter, fileNamer} from './helpers';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { UploadFilesDto } from './dto/upload-files.dto';
import { filesFilter } from './helpers/filesFilter.helper';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) {}

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response,
    @Param('imageName') imageName: string
  ){
    const path = this.filesService.getStaticProductImage(imageName);
    // return  res.status(403).json({
    //   ok: false,
    //   path: path
    // })
    res.sendFile( path );
  }

  @Post('product')
  @UseInterceptors( FileInterceptor('file', {
    fileFilter: fileFilter,
    // limits: {fileSize: 100000}
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    })
  }) )
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ) {
    if(!file) throw new BadRequestException('Make sure that file is an image');
    // console.log({file})
    // const {buffer, ...restFile} = file;
    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`;
    return {
      secureUrl
    };
  }

  @Post('products')
  @UseInterceptors( FilesInterceptor('files', 5, {
    fileFilter: filesFilter,
    limits: {fileSize: 20971520}, // 20MB
    // storage: diskStorage({
    //   destination: './static/products',
    //   filename: fileNamer
    // })
  }) )
  uploadFiles(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() uploadFilesDto: UploadFilesDto
  ) {
    if(!files) throw new BadRequestException('Make sure that file is an image');
    // console.log(uploadFilesDto)
    if (files.length > 1) {
      return this.filesService.uploadImagesToS3(files, uploadFilesDto);
    }

    return this.filesService.uploadSingleImageToS3(files, uploadFilesDto);
  }
}
