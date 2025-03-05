import { Component } from '@angular/core';
import { CategoryListComponent } from '../category-list/category-list.component';
import { ProductGridComponent } from '../product-grid/product-grid.component';
import { RouterModule } from '@angular/router';
import { Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CategoryListComponent, ProductGridComponent, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  constructor(private meta: Meta) {}

  ngOnInit(): void {
    // Meta description
    this.meta.updateTag({
      name: 'description',
      content:
        'Tervetuloa BittiBoksiin! Olemme suomalainen verkkokauppa, joka myy edullisia elektroniikan komponentteja.',
    });

    // Canonical url
    this.meta.updateTag({
      rel: 'canonical',
      href: `https://bittiboksi.fi/kauppa`,
    });
  }
}
