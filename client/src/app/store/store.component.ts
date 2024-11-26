import { Component } from '@angular/core';
import { CategoryListComponent } from '../category-list/category-list.component';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CategoryListComponent],
  templateUrl: './store.component.html',
  styleUrl: './store.component.css',
})
export class StoreComponent {}
