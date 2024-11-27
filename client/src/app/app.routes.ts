import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProductPageComponent } from './product-page/product-page.component';
import { ProductGridComponent } from './product-grid/product-grid.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: ':slug', component: ProductPageComponent },
];
