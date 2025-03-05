import { Component } from '@angular/core';
import { Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-about-us-page',
  standalone: true,
  imports: [],
  templateUrl: './about-us-page.component.html',
  styleUrl: './about-us-page.component.css',
})
export class AboutUsPageComponent {
  constructor(private meta: Meta) {}

  ngOnInit(): void {
    // Canonical url
    this.meta.updateTag({
      rel: 'canonical',
      href: `https://bittiboksi.fi/tietoa-meista`,
    });
  }
}
