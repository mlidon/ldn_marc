import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { ApiService } from './api.service';

interface UploadResponseData {
  url?: string;
}

@Injectable({ providedIn: 'root' })
export class UploadService {
  private readonly api = inject(ApiService);

  uploadCover(file: File) {
    const formData = new FormData();

    formData.append('cover', file);

    return this.api.post<UploadResponseData>('/upload/cover', formData).pipe(
      map((response) => {
        const url = response.data?.url;

        if (!url) {
          throw new Error('Upload response does not contain a URL.');
        }

        return this.toPublicUploadsUrl(url);
      }),
    );
  }

  uploadFile(file: File) {
    const formData = new FormData();

    formData.append('file', file);

    return this.api.post<UploadResponseData>('/upload/file', formData).pipe(
      map((response) => {
        const url = response.data?.url;

        if (!url) {
          throw new Error('Upload response does not contain a URL.');
        }

        return this.toPublicUploadsUrl(url);
      }),
    );
  }

  private toPublicUploadsUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    if (url.startsWith('/uploads/')) {
      return `http://localhost:3000${url}`;
    }

    if (url.startsWith('uploads/')) {
      return `http://localhost:3000/${url}`;
    }

    return url;
  }
}
