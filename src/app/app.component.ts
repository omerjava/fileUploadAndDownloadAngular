import {
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
} from '@angular/common/http';
import { saveAs } from 'file-saver';
import { Component } from '@angular/core';
import { FileService } from './service/file.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  filenames: string[] = [];
  fileStatus = { status: '', requestType: '', percent: 0 };

  constructor(private fileService: FileService) {}

  // define a function to upload files
   onUploadFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    const formData: FormData = new FormData();
    if(files){
      for (let i=0; i<files.length; i++) {
        formData.append('files', files[i], files[i].name);
      }
    }
    
    this.fileService.upload(formData).subscribe({
      next: (event) => {
        this.reportProgress(event);
      },
      error: (error: HttpErrorResponse) => console.error(error),
      complete: () => console.info('complete'),
    });
  }

  // define a function to download files
  onDownloadFile(filename: string): void {
    this.fileService.download(filename).subscribe({
      next: (event) => {
        this.reportProgress(event);
      },
      error: (error: HttpErrorResponse) => console.error(error),
      complete: () => console.info('complete'),
    });
  }

  private reportProgress(httpEvent: HttpEvent<string[] | Blob>): void {
    switch (httpEvent.type) {
      case HttpEventType.UploadProgress:
        this.updateStatus(httpEvent.loaded, httpEvent.total!, 'Uploading... ');
        break;
      case HttpEventType.DownloadProgress:
        this.updateStatus(
          httpEvent.loaded,
          httpEvent.total!,
          'Downloading... '
        );
        break;
      case HttpEventType.ResponseHeader:
        // console.log('Header returned', httpEvent);
        break;
      case HttpEventType.Response:
        if (httpEvent.body instanceof Array) {
          this.fileStatus.status = 'done';
          for (const filename of httpEvent.body) {
            this.filenames.unshift(filename);
          }
        } else {
          saveAs(
            new File([httpEvent.body!], httpEvent.headers.get('File-Name')!, {
              type: `${httpEvent.headers.get('Content-Type')};charset=utf-8`,
            })
          );
          // saveAs(new Blob([httpEvent.body!],
          //   { type: `${httpEvent.headers.get('Content-Type')};charset=utf-8`}),
          //    httpEvent.headers.get('File-Name'));
        }
        this.fileStatus.status = 'done';
        break;
      default:
       // console.log(httpEvent);
        break;
    }
  }

  private updateStatus(
    loaded: number,
    total: number,
    requestType: string
  ): void {
    this.fileStatus.status = 'progress';
    this.fileStatus.requestType = requestType;
    this.fileStatus.percent = Math.round((100 * loaded) / total);
  }
}
