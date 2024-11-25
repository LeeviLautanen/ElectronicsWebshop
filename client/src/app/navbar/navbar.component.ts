import { Component } from '@angular/core';
import { bootstrapCart4, bootstrapSearch } from '@ng-icons/bootstrap-icons';
import { NgIconComponent, provideIcons } from '@ng-icons/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgIconComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  providers: [provideIcons({ bootstrapCart4, bootstrapSearch })],
})
export class NavbarComponent {}
