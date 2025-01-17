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
        path: ':category/:slug',
        component: ProductPageComponent,
      },
    ],
    title: 'Kauppa - BittiBoksi',
  },
  {
    path: 'ostoskori',
    component: ShoppingCartPageComponent,
    title: 'Ostoskori - BittiBoksi',
  },
  {
    path: 'kassa',
    component: CheckoutPageComponent,
    title: 'Kassa - BittiBoksi',
  },
  {
    path: 'tietoa-meista',
    component: AboutUsPageComponent,
    title: 'Tietoa meistä - BittiBoksi',
  },
  {
    path: 'toimitusehdot',
    component: TermsPageComponent,
    title: 'Toimitusehdot - BittiBoksi',
  },
  {
    path: 'tietosuojaseloste',
    component: PrivacyInfoPageComponent,
    title: 'Tietosuojaseloste - BittiBoksi',
  },
  {
    path: 'tilaus/:orderId',
    component: OrderConfirmationPageComponent,
    title: 'Kiitos tilauksestasi! - BittiBoksi',
  },
  {
    path: '404',
    component: NotFoundComponent,
    title: 'Sivua ei löydetty - BittiBoksi',
  },
  { path: '**', redirectTo: '/404' },
];
