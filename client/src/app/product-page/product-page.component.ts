import { Component, OnInit, Renderer2 } from '@angular/core';
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
    private title: Title,
    private renderer: Renderer2,
    private meta: Meta
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
      this.setPageMetaData();
    });
  }

  setPageMetaData() {
    // Product snippet rich results
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: this.product.name,
      image: this.getImageUrl(this.product.image),
      description: this.product.description,
      offers: {
        '@type': 'Offer',
        url: `https://bittiboksi.fi/tuote/${this.product.slug}`,
        priceCurrency: 'EUR',
        price: this.product.price,
        availability:
          this.product.stock > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
      },
    };
    const script = this.renderer.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(jsonLd);
    this.renderer.appendChild(document.head, script);

    // Tab title
    this.title.setTitle(`${this.product.name} - BittiBoksi`);

    // Meta description
    this.meta.updateTag({
      name: 'description',
      content: this.product.description,
    });

    // Canonical url
    this.meta.updateTag({
      rel: 'canonical',
      href: `https://bittiboksi.fi/tuote/${this.product.slug}`,
    });
  }

  getImageUrl(imageName: string): string {
    return this.imageUrlService.getImageUrl(imageName, 'large');
  }

  goBack(): void {
    this.location.back();
  }
}
