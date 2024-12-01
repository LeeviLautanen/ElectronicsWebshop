import { Component } from '@angular/core';
import { bootstrapCart4, bootstrapSearch } from '@ng-icons/bootstrap-icons';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { ShoppingCartComponent } from '../shopping-cart/shopping-cart.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgIconComponent, ShoppingCartComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  providers: [provideIcons({ bootstrapCart4, bootstrapSearch })],
})
export class NavbarComponent {}
