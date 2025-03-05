import { Component } from '@angular/core';
import { Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-privacy-info-page',
  standalone: true,
  imports: [],
  templateUrl: './privacy-info-page.component.html',
  styleUrl: './privacy-info-page.component.css',
})
export class PrivacyInfoPageComponent {
  constructor(private meta: Meta) {}

  ngOnInit(): void {
    // Canonical url
    this.meta.updateTag({
      rel: 'canonical',
      href: `https://bittiboksi.fi/tietosuojaseloste`,
    });
  }
}
