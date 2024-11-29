import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProductPageComponent } from './product-page/product-page.component';
import { ProductGridComponent } from './product-grid/product-grid.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: '', // Use slug or ID if needed
        component: ProductGridComponent, // The product grid on the right
      },
      {
        path: 'tuote/:slug', // Use slug or ID if needed
        component: ProductPageComponent, // The product grid on the right
      },
    ],
  },
];
