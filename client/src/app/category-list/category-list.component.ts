import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css',
})
export class CategoryListComponent {
  categories = ['Mikrokontrollerit', 'Sensorit', 'Transistorit', 'Muut'];
  selectedCategory: number | null = null;

  selectCategory(index: number) {
    this.selectedCategory = index;
  }
}
