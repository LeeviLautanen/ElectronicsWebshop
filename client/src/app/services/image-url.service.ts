import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.dev';

@Injectable({
  providedIn: 'root',
})
export class ImageUrlService {
  baseUrl = environment.baseUrl;

  getImageUrl(imageName: string, size: 'small' | 'large'): string {
    return `${environment.baseUrl}/uploads/${size}/${imageName}`;
  }
}
