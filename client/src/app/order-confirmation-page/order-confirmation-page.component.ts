import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../services/order.service';
import { CommonModule } from '@angular/common';
import { OrderData } from '../models/OrderItems.model';
import { ShoppingCartService } from '../services/shopping-cart.service';

@Component({
  selector: 'app-order-confirmation-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-confirmation-page.component.html',
  styleUrl: './order-confirmation-page.component.css',
})
export class OrderConfirmationPageComponent implements OnInit {
  orderData!: OrderData;
  orderItemsTotal = 0;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private shoppingCartService: ShoppingCartService
  ) {}

  ngOnInit(): void {
    this.shoppingCartService.emptyCart();

    const orderId = this.route.snapshot.paramMap.get('orderId');

    if (orderId == null || orderId.length == 0) {
      console.error('Order id was not found in url');
      return;
    }

    this.orderService.getOrderData(orderId).subscribe((data: any) => {
      this.orderData = data;

      this.orderItemsTotal = this.orderData.orderItems.reduce((total, item) => {
        return item.price * item.quantity + total;
      }, 0);
    });
  }
}
