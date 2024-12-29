import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment.dev';
import { Category } from '../models/Category.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css',
})
export class CategoryListComponent implements OnInit {
  baseUrl = environment.baseUrl;
  categories!: Category[];
  selectedCategoryIndex = -1;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.http
      .get(`${this.baseUrl}/api/categories`)
      .subscribe((categories: any) => {
        this.categories = categories;
      });
  }

  selectCategory(index: number) {
    if (index == this.selectedCategoryIndex) {
      this.selectedCategoryIndex = -1;
      this.router.navigate([`/`]);
      return;
    }

    this.selectedCategoryIndex = index;
    const categoryName = this.categories[index].name;
    this.router.navigate([`/kauppa/${categoryName}`]);
  }
}
