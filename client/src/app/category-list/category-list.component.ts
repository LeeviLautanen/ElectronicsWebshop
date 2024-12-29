import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment.dev';
import { Category } from '../models/Category.model';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

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

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.http
      .get(`${this.baseUrl}/api/categories`)
      .subscribe((categories: any) => {
        this.categories = categories;
      });

    // Sketchy way to reset selected category when clicking on product card
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.selectedCategoryIndex = -1;
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
