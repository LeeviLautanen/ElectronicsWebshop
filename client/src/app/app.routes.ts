import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProductPageComponent } from './product-page/product-page.component';
import { ProductGridComponent } from './product-grid/product-grid.component';
import { ShoppingCartPageComponent } from './shopping-cart-page/shopping-cart-page.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: '',
        component: ProductGridComponent,
      },
      {
        path: 'tuote/:slug',
        component: ProductPageComponent,
      },
    ],
  },
  { path: 'ostoskori', component: ShoppingCartPageComponent },
];
