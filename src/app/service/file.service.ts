import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private server = 'http://localhost:9000';

  constructor(private http: HttpClient) {}

  // define function to upload
  upload(formData: FormData): Observable<HttpEvent<string[]>> {
    return this.http.post<string[]>(`${this.server}/file/upload`, formData, {
      reportProgress: true,
      observe: 'events',
    });
  }

  // define function to download
  download(filename: string): Observable<HttpEvent<Blob>> {
    return this.http.get(`${this.server}/file/download/${filename}`, {
      reportProgress: true,
      observe: 'events',
      responseType: 'blob',
    });
  }
}
