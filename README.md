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