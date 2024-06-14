import { join } from 'path';
import { existsSync } from 'fs';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UploadFilesDto } from './dto/upload-files.dto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FilesService {
  constructor(private readonly configService: ConfigService) {}

  getStaticProductImage(imageName: string) {
    const path = join(__dirname, '../../static/products', imageName);

    if (!existsSync(path)) {
      throw new BadRequestException(`No product found with image ${imageName}`);
    }
    return path;
  }

  async uploadSingleImageToS3(files: Express.Multer.File[], uploadFilesDto: UploadFilesDto) {
    const folder = uploadFilesDto.folder || 'trash';
    const {s3Client, AWS_BUCKET} = this.getS3Client();
    const { buffer, originalname} = files[0];
    try {
      const now = new Date().getTime();
      const extension = originalname.split('.').pop();
      const params = {
        Bucket: AWS_BUCKET,
        Key: folder + '/' + now + '.' + extension,
        Body: buffer,
      };
      await s3Client.send(new PutObjectCommand(params));
      return {
        urls: folder+'/'+now+'.'+extension
      }
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }

  }

  async uploadImagesToS3(
    files: Express.Multer.File[],
    uploadFilesDto: UploadFilesDto,
  ) {
    // console.log({folder: uploadFilesDto.folder, files});
    const folder = uploadFilesDto.folder || 'trash';
    const {s3Client, AWS_BUCKET} = this.getS3Client();
    try {
      const urls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const now = new Date().getTime();
        const extension = files[i].originalname.split('.').pop();
        const params = {
          Bucket: AWS_BUCKET,
          Key: folder + '/' + now + '.' + extension,
          Body: files[i].buffer,
        };
        await s3Client.send(new PutObjectCommand(params));
        urls.push(folder + '/' + now + '.' + extension);
      }

      return {
        urls,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  getS3Client (){
    const AWS_REGION = this.configService.get('AWS_BUCKET_REGION');
    const AWS_KEY = this.configService.get('AWS_ACCESS_KEY_ID');
    const AWS_SECRET = this.configService.get('AWS_SECRET_ACCESS_KEY');
    const AWS_BUCKET = this.configService.get('AWS_BUCKET_NAME');
    const credentials = {
      accessKeyId: AWS_KEY,
      secretAccessKey: AWS_SECRET,
    };
    // console.log({
    //   folder,
    //   region: AWS_REGION,
    //   bucket: AWS_BUCKET,
    //   key: AWS_KEY,
    //   secret: AWS_SECRET,
    // });
    const s3Client = new S3Client({ region: AWS_REGION, credentials });
    return {
      s3Client, AWS_BUCKET
    }
  }
}
