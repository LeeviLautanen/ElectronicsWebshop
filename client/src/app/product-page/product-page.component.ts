import { Component, OnInit } from '@angular/core';
import { Product } from '../models/Product.model';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductDataService } from '../services/product-data.service';
import { CommonModule, Location } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { CartControlsLargeComponent } from '../cart-controls-large/cart-controls-large.component';
import { DomSanitizer, Meta, SafeHtml, Title } from '@angular/platform-browser';
import { environment } from '../../environments/environment.dev';
import { ImageUrlService } from '../services/image-url.service';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [CommonModule, NgIcon, CartControlsLargeComponent, RouterLink],
  templateUrl: './product-page.component.html',
  styleUrl: './product-page.component.css',
})
export class ProductPageComponent implements OnInit {
  product!: Product;
  sanitizedDescription!: SafeHtml;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private productDataService: ProductDataService,
    private sanitizer: DomSanitizer,
    private imageUrlService: ImageUrlService,
    private title: Title
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');

    if (slug == null || slug.length == 0) {
      console.log('ERROR: no slug received');
      return;
    }

    this.productDataService.getProductBySlug(slug).subscribe((data) => {
      this.product = data;
      this.sanitizedDescription = this.sanitizer.bypassSecurityTrustHtml(
        this.product.description
      );
      this.title.setTitle(`${this.product.name} - BittiBoksi`);
    });
  }

  getImageUrl(imageName: string): string {
    return this.imageUrlService.getImageUrl(imageName, 'large');
  }

  goBack(): void {
    this.location.back();
  }
}
