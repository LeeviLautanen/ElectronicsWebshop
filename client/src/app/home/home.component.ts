import { Component } from '@angular/core';
import { CategoryListComponent } from '../category-list/category-list.component';
import { ProductGridComponent } from '../product-grid/product-grid.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CategoryListComponent, ProductGridComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  products = [
    {
      name: 'Product 1',
      description: 'Description 1',
      price: 10.99,
      imageUrl: 'path_to_image',
      inStock: true,
    },
    {
      name: 'Product 2',
      description: 'Description 2',
      price: 8.49,
      imageUrl: 'path_to_image',
      inStock: true,
    },
    {
      name: 'Product 3',
      description: 'Description 3',
      price: 2.39,
      imageUrl: 'path_to_image',
      inStock: false,
    },
    {
      name: 'Product 3',
      description: 'Description 3',
      price: 2.39,
      imageUrl: 'path_to_image',
      inStock: false,
    },
    {
      name: 'Product 3',
      description: 'Description 3',
      price: 2.39,
      imageUrl: 'path_to_image',
      inStock: false,
    },
    {
      name: 'Product 3',
      description: 'Description 3',
      price: 2.39,
      imageUrl: 'path_to_image',
      inStock: true,
    },
    {
      name: 'Product 3',
      description: 'Description 3',
      price: 2.39,
      imageUrl: 'path_to_image',
      inStock: false,
    },
    {
      name: 'Product 3',
      description: 'Description 3',
      price: 2.39,
      imageUrl: 'path_to_image',
      inStock: true,
    },
    {
      name: 'Product 3',
      description: 'Description 3',
      price: 2.39,
      imageUrl: 'path_to_image',
      inStock: false,
    },
    {
      name: 'Product 3',
      description: 'Description 3',
      price: 2.39,
      imageUrl: 'path_to_image',
      inStock: true,
    },
    {
      name: 'Product 3',
      description: 'Description 3',
      price: 2.39,
      imageUrl: 'path_to_image',
      inStock: false,
    },
  ];
}
