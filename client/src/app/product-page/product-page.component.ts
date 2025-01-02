import { Component, OnInit } from '@angular/core';
import { Product } from '../models/Product.model';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductDataService } from '../services/product-data.service';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { CartControlsLargeComponent } from '../cart-controls-large/cart-controls-large.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
    private router: Router,
    private productDataService: ProductDataService,
    private sanitizer: DomSanitizer
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
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
