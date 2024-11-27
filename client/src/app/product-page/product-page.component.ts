import { Component, OnInit } from '@angular/core';
import { Product } from '../models/ProductModel';
import { ActivatedRoute } from '@angular/router';
import { ProductDataService } from '../product-data.service';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [CommonModule, NgIcon],
  templateUrl: './product-page.component.html',
  styleUrl: './product-page.component.css',
})
export class ProductPageComponent implements OnInit {
  product: Product | undefined;

  constructor(
    private route: ActivatedRoute,
    private productDataService: ProductDataService
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');

    if (slug == null || slug.length == 0) {
      console.log('ERROR: no slug received');
      return;
    }

    this.productDataService.getProductBySlug(slug).subscribe((data) => {
      this.product = data;
    });
  }
}
