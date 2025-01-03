import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment.dev';
import { Category } from '../models/Category.model';
import { ActivatedRoute, Router } from '@angular/router';

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
      this.router.navigate([`/kauppa/${this.categories[index].name}`]);
    }
  }
}
