import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { extname } from 'path';

@Injectable()
export class S3Service {
  private s3: S3Client;
  private bucketName: string;

  constructor(private readonly configService: ConfigService) {
    console.log(this.configService.get<string>('s3.region'));
    this.s3 = new S3Client({
      endpoint: process.env.S3,
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.S3_AKEY,
        secretAccessKey: process.env.S3_SKEY,
      },
      forcePathStyle: true,
    });

    this.bucketName = process.env.S3_BUCKET;
  }

  async uploadFile(
    file: Buffer,
    fileName: string,
    mimeType: string,
  ): Promise<string> {
    const uniqueFileName = `${randomUUID()}${extname(fileName)}`;

    const uploadParams = {
      Bucket: this.bucketName,
      Key: uniqueFileName,
      Body: file,
      ContentType: mimeType,
    };

    await this.s3.send(new PutObjectCommand(uploadParams));

    return `https://${this.bucketName}.s3.${this.configService.get<string>('AWS_REGION')}.amazonaws.com/${uniqueFileName}`;
  }
}
