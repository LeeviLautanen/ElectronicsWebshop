import { Component } from '@angular/core';
import { Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-terms-page',
  standalone: true,
  imports: [],
  templateUrl: './terms-page.component.html',
  styleUrl: './terms-page.component.css',
})
export class TermsPageComponent {
  constructor(private meta: Meta) {}

  ngOnInit(): void {
    // Canonical url
    this.meta.updateTag({
      rel: 'canonical',
      href: `https://bittiboksi.fi/toimitusehdot`,
    });
  }
}
