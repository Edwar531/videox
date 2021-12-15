import { Injectable } from '@angular/core';
import * as AWS from 'node_modules/aws-sdk/global';
import * as S3 from 'node_modules/aws-sdk/clients/s3';

@Injectable({
  providedIn: 'root'
})
export class UploadAwsService {
  FOLDER = "Pruebas/";
  constructor() { }

  uploadFile(file) {
    const contentType = file.type;

    const bucket = new S3(
      {
        accessKeyId: 'AKIAUEGUSGNGMAAIUDBI',
        secretAccessKey: '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',
        region: 'us-east-1'
      }
    );

    const params = {
      Bucket: 'onlyfetixx2',
      Key: this.FOLDER + file.name,
      Body: file,
      ACL: 'public-read',
      ContentType: contentType
    };

    bucket.upload(params, function (err:any, data:any) {
      if (err) {
        console.log('There was an error uploading your file: ', err);
        return false;
      }
      console.log('Successfully uploaded file.', data);
      return true;
    });



    //for upload progress
    bucket.upload(params).on('httpUploadProgress', function (evt) {
        console.log(evt.loaded + ' of ' + evt.total + ' Bytes');
    }).send(function (err, data) {
        if (err) {
            console.log('There was an error uploading your file: ', err);
            return false;
        }
        console.log('Successfully uploaded file.', data);
        return true;
    });
  }
  // getListObjects(){
  //   const bucket = new S3(
  //     {
  //       accessKeyId: 'AKIAUEGUSGNGMAAIUDBI',
  //       secretAccessKey: '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',
  //       region: 'us-east-1'
  //     }
  //   );

  //   var params = {
  //    Bucket: 'onlifetyxx2',
  //    Delimiter: '/',
  //    Prefix: 's/5469b2f5b4292d22522e84e0/ms.files/'
  //   }

  //   bucket.listObjects(params, function (err, data) {
  //    if(err)throw err;
  //    console.log(data);
  //   });
  // }
}
