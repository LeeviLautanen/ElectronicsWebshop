import { Component } from '@angular/core';
import { CategoryListComponent } from '../category-list/category-list.component';
import { ProductGridComponent } from '../product-grid/product-grid.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CategoryListComponent, ProductGridComponent, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {}
