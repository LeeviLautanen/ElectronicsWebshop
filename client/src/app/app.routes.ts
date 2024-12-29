import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProductPageComponent } from './product-page/product-page.component';
import { ProductGridComponent } from './product-grid/product-grid.component';
import { ShoppingCartPageComponent } from './shopping-cart-page/shopping-cart-page.component';
import { CheckoutPageComponent } from './checkout-page/checkout-page.component';
import { TermsPageComponent } from './info-and-legal/terms-page/terms-page.component';
import { OrderConfirmationPageComponent } from './order-confirmation-page/order-confirmation-page.component';
import { PrivacyInfoPageComponent } from './info-and-legal/privacy-info-page/privacy-info-page.component';
import { AboutUsPageComponent } from './info-and-legal/about-us-page/about-us-page.component';

export const routes: Routes = [
  { path: '', redirectTo: 'kauppa', pathMatch: 'full' },
  {
    path: 'kauppa',
    component: HomeComponent,
    children: [
      {
        path: '',
        component: ProductGridComponent,
      },
      {
        path: ':category',
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
  { path: 'tietoa-meistä', component: AboutUsPageComponent },
  { path: 'toimitusehdot', component: TermsPageComponent },
  { path: 'tietosuojaseloste', component: PrivacyInfoPageComponent },
  {
    path: 'tilaus/:orderId',
    component: OrderConfirmationPageComponent,
  },
];
