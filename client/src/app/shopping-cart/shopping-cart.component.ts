import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  bootstrapCart4,
  bootstrapChevronDown,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ShoppingCartService } from '../services/shopping-cart.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Cart } from '../models/Cart.model';

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [NgIcon, CommonModule],
  templateUrl: './shopping-cart.component.html',
  styleUrl: './shopping-cart.component.css',
  providers: [provideIcons({ bootstrapCart4, bootstrapChevronDown })],
})
export class ShoppingCartComponent implements OnInit {
  cart$!: Observable<Cart>;

  constructor(private shoppingCartService: ShoppingCartService) {}

  ngOnInit(): void {
    this.cart$ = this.shoppingCartService.cart$;
  }
}
