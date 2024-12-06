import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProductPageComponent } from './product-page/product-page.component';
import { ProductGridComponent } from './product-grid/product-grid.component';
import { ShoppingCartPageComponent } from './shopping-cart-page/shopping-cart-page.component';
import { CheckoutPageComponent } from './checkout-page/checkout-page.component';
import { InfoPageComponent } from './info-page/info-page.component';
import { TermsPageComponent } from './terms-page/terms-page.component';
import { AddProductComponent } from './add-product/add-product.component';

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
  { path: 'kassa', component: CheckoutPageComponent },
  { path: 'tietoa', component: InfoPageComponent },
  { path: 'toimitusehdot', component: TermsPageComponent },
  { path: 'addProduct', component: AddProductComponent },
];
