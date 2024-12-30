import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment.dev';
import { Category } from '../models/Category.model';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { ProductDataService } from '../services/product-data.service';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css',
})
export class CategoryListComponent implements OnInit {
  baseUrl = environment.baseUrl;
  categories: Category[] = [];
  selectedCategoryIndex: number | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.http
      .get<Category[]>(`${this.baseUrl}/api/categories`)
      .subscribe((data) => {
        this.categories = data;
      });
  }

  selectCategory(index: number): void {
    if (this.selectedCategoryIndex === index) {
      this.selectedCategoryIndex = null;
      this.router.navigate(['/kauppa']);
    } else {
      this.selectedCategoryIndex = index;
      this.router.navigate([
        '/kauppa',
        { category: this.categories[index].name },
      ]);
    }
  }
}
