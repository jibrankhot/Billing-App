import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';

interface BreadcrumbItem {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss'
})
export class BreadcrumbComponent {

  private readonly router = inject(Router);

  breadcrumbs: BreadcrumbItem[] = [];

  constructor() {
    this.router.events
      .pipe(
        filter(
          event => event instanceof NavigationEnd
        )
      )
      .subscribe(() => {
        this.buildBreadcrumbs();
      });

    this.buildBreadcrumbs();
  }

  private buildBreadcrumbs(): void {
    const url = this.router.url.split('?')[0];

    const segments = url
      .split('/')
      .filter(segment => segment.length > 0);

    const breadcrumbs: BreadcrumbItem[] = [];

    let currentUrl = '';

    for (const segment of segments) {
      currentUrl += `/${segment}`;

      breadcrumbs.push({
        label: this.formatLabel(segment),
        url: currentUrl
      });
    }

    this.breadcrumbs = breadcrumbs;
  }

  private formatLabel(segment: string): string {
    return segment
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, character => character.toUpperCase());
  }
}