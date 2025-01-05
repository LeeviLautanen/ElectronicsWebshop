import { Component, Inject, OnInit, Optional } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { environment } from '../../environments/environment.dev';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css',
})
export class NotFoundComponent implements OnInit {
  baseUrl = environment.baseUrl;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // I cant believe angular has no feature to return 404
    this.route.queryParams.subscribe((queryParams) => {
      if (!queryParams['refreshed']) {
        location.href = '/404?refreshed=true';
      }
    });
  }
}
