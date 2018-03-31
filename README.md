## Environment

I am using 

visual code 1.21.0

and NPM version is follows
$npm --version
5.6.0

$ ng --version
Angular CLI: 1.6.8
Node: 9.8.0
OS: linux x64

## Angular App Setup
We are going to use the angular cli to generate a new angular project. 
create a folder for your project called 'file-upload-lambda-s3-incognito'
$ mkdir file-upload-lambda-s3-incognito 
$ cd file-upload-lambda-s3-incognito

To generate a new project, run the following angular cli command from your terminal.
$ ng new front-end

This will generate a new project in a folder named ‘front-end’. Next, let’s serve the application so we can view our project in the browser.

Change directories into the project folder.
$ cd front-end

Run the following command in your terminal.
$ ng serve

Your app should now be served at http://localhost:4200/

for debugging on VS follow the instructions here https://github.com/Microsoft/vscode-recipes/tree/master/Angular-CLI

## Steps for getting to first step

1- update the app/app.component.html

```
<h1>Angular File Input</h1>
<!-- IMG preview -->
<img [src]="fileDataUri">

<p *ngIf="errorMsg" style="color:red">{{errorMsg}}</p>

<!-- Form with submit method and template variable (#fileInput) -->
<form (submit)="uploadFile($event)">
  <input
    type="file"
    (change)="previewFile()"
    #fileInput
  >
  <button
    type="submit"
    [disabled]="fileDataUri.length === 0"
  >Upload</button>
</form>
```

2- update the app/app.component.html

```
import {Component, ElementRef, ViewChild} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  acceptedMimeTypes = [
    'image/gif',
    'image/jpeg',
    'image/png'
  ];

  @ViewChild('fileInput') fileInput: ElementRef;
  fileDataUri = '';
  errorMsg = '';

  previewFile() {
    const file = this.fileInput.nativeElement.files[0];
    if (file && this.validateFile(file)) {
      this.errorMsg = '';
      const reader = new FileReader();
      reader.readAsDataURL(this.fileInput.nativeElement.files[0]);
      reader.onload = () => {
        this.fileDataUri = reader.result;
      }
    } else {
      this.errorMsg = 'File must be jpg, png, or gif and cannot be exceed 500 KB in size'
    }
  }

  uploadFile(event: Event) {
    event.preventDefault();

    // get only the base64 file
    if (this.fileDataUri.length > 0) {
      const base64File = this.fileDataUri.split(',')[1];
      // TODO: send to server
      console.log(base64File);
    }

  }

  validateFile(file) {
    return this.acceptedMimeTypes.includes(file.type) && file.size < 500000;
  }

}
```

# steps for getting to second step
Create a folder to store lambda functions
```
$ mkdir lambda
$ cd lambda
```

1- Create a javascript file "s3-file-load-lambda" and update the file content as follows

```
const AWS = require('aws-sdk');
const fileType = require('file-type');

const config = new AWS.Config({
    region: process.env.REGION
});

AWS.config.update(config);

const s3 = new AWS.S3({apiVersion: '2006-03-01'});

const imageTypes = [
    'image/gif',
    'image/jpeg',
    'image/png'
];

exports.handler = (event, context, callback) => {

    //get the image data from upload
    const body = JSON.parse(event.body);

    const fileBuffer = new Buffer(body['image'], 'base64');
    const fileTypeInfo = fileType(fileBuffer);

    //validate image is on right type
    if (fileBuffer.length < 500000 && imageTypes.includes(fileTypeInfo.mime)) {

        // upload it to s3 with unix timestamp as a file name
        const fileName = `${Math.floor(new Date() / 1000)}.${fileTypeInfo.ext}`;

        const bucket = process.env.BUCKET;
        const params = {
            Body: fileBuffer,
            Key: fileName,
            Bucket: bucket,
            ContentEncoding: 'base64',
            ContentType: fileTypeInfo.mime
        };

        s3.putObject(params, (err, data) => {
            if (err) {
                callback(new Error([err.statusCode], [err.message]));
            }

            callback(null, {
                statusCode: '200',
                headers: {'Access-Control-Allow-Origin': '*'},
                body: JSON.stringify({'data': data})
            });
        });


    } else {
        callback(null, {
            statusCode: '402',
            headers: {'Access-Control-Allow-Origin': '*'},
            body: JSON.stringify({"message": "Not a valid file type or file too big."})
        });
    }

};
```

2- Create package.json file and update as following

```
{
  "name": "lambda-s3-upload",
  "version": "0.0.0",
  "license": "MIT",
  "private": true,
  "dependencies": {
    "file-type": "7.6.x"
  }
}
```

3- go to lambda folder and run the npm and download the dependecies

```
$ cd lambda
$ npm install
```

4- Zip the contents of the lambda folder (node_modules folder and s3-file-load-lambda.js file) and follow the instructions at "instructions.docx"

5- Update the src/app/app.module.ts and import the HttpClientModule

```
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

6- open up src/environments/environment.ts and add the key apiUrl with the value of your API URL.

```
export const environment = {
  production: false,
  apiUrl: 'your api url' // i.e.'https://beepboop.execute-api.us-west-2.amazonaws.com/Prod'
};
```

7- Finally, open up the app.component.ts file and add the http post functionality.

```
import {Component, ElementRef, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  acceptedMimeTypes = [
    'image/gif',
    'image/jpeg',
    'image/png'
  ];

  @ViewChild('fileInput') fileInput: ElementRef;
  fileDataUri = '';
  errorMsg = '';

  constructor(private http: HttpClient) {}

  previewFile() {
    const file = this.fileInput.nativeElement.files[0];
    if (file && this.validateFile(file)) {
      this.errorMsg = '';
      const reader = new FileReader();
      reader.readAsDataURL(this.fileInput.nativeElement.files[0]);
      reader.onload = () => {
        this.fileDataUri = reader.result;
      }
    } else {
      this.errorMsg = 'File must be jpg, png, or gif and cannot be exceed 500 KB in size'
    }
  }

  uploadFile(event: Event) {
    event.preventDefault();

    // get only the base64 file and post it
    if (this.fileDataUri.length > 0) {
      const base64File = this.fileDataUri.split(',')[1];
      const data = {'image': base64File};
      this.http.post(`${environment.apiUrl}/file`, data)
        .subscribe(
          res => {
            // handle success
            // reset file input
            this.fileInput.nativeElement.value = '';
            this.fileDataUri = '';
          },
          err => {
            this.errorMsg = 'Could not upload image.';
          }
        );
    }

  }

  validateFile(file) {
    return this.acceptedMimeTypes.includes(file.type) && file.size < 500000;
  }

}
```

# steps for getting to third step

1- update the Environment file

```
export const environment = {
  production: false,
  apiUrl: <your AWS url>, // i.e.'https://beepboop.execute-api.us-west-2.amazonaws.com/Prod'
  apiKey: <your API key from AWS>
};
```

2- Update the app.components.ts

```
import {Component, ElementRef, ViewChild} from '@angular/core';
import { HttpClient, HttpRequest, HttpHeaders } from '@angular/common/http';
import {environment} from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  acceptedMimeTypes = [
    'image/gif',
    'image/jpeg',
    'image/png'
  ];

  @ViewChild('fileInput') fileInput: ElementRef;
  fileDataUri = '';
  errorMsg = '';

  constructor(private http: HttpClient) {}

  previewFile() {
    const file = this.fileInput.nativeElement.files[0];
    if (file && this.validateFile(file)) {
      this.errorMsg = '';
      const reader = new FileReader();
      reader.readAsDataURL(this.fileInput.nativeElement.files[0]);
      reader.onload = () => {
        this.fileDataUri = reader.result;
      }
    } else {
      this.errorMsg = 'File must be jpg, png, or gif and cannot be exceed 500 KB in size'
    }
  }

  uploadFile(event: Event) {
    event.preventDefault();

    // get only the base64 file and post it
    if (this.fileDataUri.length > 0) {
      const base64File = this.fileDataUri.split(',')[1];
      const data = {'image': base64File};

      const req = new HttpRequest('POST', `${environment.apiUrl}/file`, data, {
        headers : new HttpHeaders({
          'x-api-key': `${environment.apiKey}`
        })
      });
  
      this.http.request(req)
        .subscribe(
          res => {
            // handle success
            // reset file input
            this.fileInput.nativeElement.value = '';
            this.fileDataUri = '';
          },
          err => {
            this.errorMsg = 'Could not upload image.';
          }
        );
    }

  }

  validateFile(file) {
    return this.acceptedMimeTypes.includes(file.type) && file.size < 500000;
  }

}
```