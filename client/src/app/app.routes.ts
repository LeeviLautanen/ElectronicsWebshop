import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProductGridComponent } from './product-grid/product-grid.component';
import { ProductPageComponent } from './product-page/product-page.component';
import { ShoppingCartPageComponent } from './shopping-cart-page/shopping-cart-page.component';
import { CheckoutPageComponent } from './checkout-page/checkout-page.component';
import { TermsPageComponent } from './info-and-legal/terms-page/terms-page.component';
import { OrderConfirmationPageComponent } from './order-confirmation-page/order-confirmation-page.component';
import { PrivacyInfoPageComponent } from './info-and-legal/privacy-info-page/privacy-info-page.component';
import { AboutUsPageComponent } from './info-and-legal/about-us-page/about-us-page.component';
import { NotFoundComponent } from './not-found/not-found.component';

export const routes: Routes = [
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
        path: ':category/:slug',
        component: ProductPageComponent,
      },
    ],
  },
  { path: 'ostoskori', component: ShoppingCartPageComponent },
  { path: 'kassa', component: CheckoutPageComponent },
  { path: 'tietoa-meista', component: AboutUsPageComponent },
  { path: 'toimitusehdot', component: TermsPageComponent },
  { path: 'tietosuojaseloste', component: PrivacyInfoPageComponent },
  {
    path: 'tilaus/:orderId',
    component: OrderConfirmationPageComponent,
  },
  { path: '**', component: NotFoundComponent },
];
