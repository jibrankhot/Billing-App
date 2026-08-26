import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavigationItem {
  label: string;
  icon: string;
  route?: string;
  children?: NavigationItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {

  expandedMenus = new Set<string>();

  readonly navigationItems: NavigationItem[] = [
    {
      label: 'Dashboard',
      icon: '▦',
      route: '/dashboard'
    },
    {
      label: 'Products',
      icon: '▣',
      children: [
        {
          label: 'Products',
          icon: '•',
          route: '/products'
        },
        {
          label: 'Categories',
          icon: '•',
          route: '/categories'
        }
      ]
    },
    {
      label: 'Customers',
      icon: '♙',
      route: '/customers'
    },
    {
      label: 'Suppliers',
      icon: '♧',
      route: '/suppliers'
    },
    {
      label: 'Inventory',
      icon: '▤',
      children: [
        {
          label: 'Stock Overview',
          icon: '•',
          route: '/inventory/overview'
        },
        {
          label: 'Stock Movements',
          icon: '•',
          route: '/inventory/movements'
        },
        {
          label: 'Stock Adjustment',
          icon: '•',
          route: '/inventory/adjustment'
        },
        {
          label: 'Low Stock',
          icon: '•',
          route: '/inventory/low-stock'
        }
      ]
    },
    {
      label: 'Sales',
      icon: '▰',
      children: [
        {
          label: 'Invoices',
          icon: '•',
          route: '/sales/invoices'
        },
        {
          label: 'Sales Orders',
          icon: '•',
          route: '/sales/orders'
        },
        {
          label: 'Sales Returns',
          icon: '•',
          route: '/sales/returns'
        }
      ]
    },
    {
      label: 'Purchases',
      icon: '▱',
      children: [
        {
          label: 'Purchase Orders',
          icon: '•',
          route: '/purchases/orders'
        },
        {
          label: 'Purchase Returns',
          icon: '•',
          route: '/purchases/returns'
        }
      ]
    },
    {
      label: 'Payments',
      icon: '₹',
      route: '/payments'
    },
    {
      label: 'Reports',
      icon: '▥',
      children: [
        {
          label: 'Sales Report',
          icon: '•',
          route: '/reports/sales'
        },
        {
          label: 'Purchase Report',
          icon: '•',
          route: '/reports/purchases'
        },
        {
          label: 'Inventory Report',
          icon: '•',
          route: '/reports/inventory'
        },
        {
          label: 'Payment Report',
          icon: '•',
          route: '/reports/payments'
        }
      ]
    },
    {
      label: 'Users',
      icon: '♙',
      children: [
        {
          label: 'Users',
          icon: '•',
          route: '/users'
        },
        {
          label: 'Roles',
          icon: '•',
          route: '/users/roles'
        }
      ]
    },
    {
      label: 'Settings',
      icon: '⚙',
      children: [
        {
          label: 'Company Profile',
          icon: '•',
          route: '/settings/company'
        },
        {
          label: 'Invoice Settings',
          icon: '•',
          route: '/settings/invoice'
        },
        {
          label: 'Tax Settings',
          icon: '•',
          route: '/settings/tax'
        }
      ]
    }
  ];

  toggleMenu(label: string): void {
    if (this.expandedMenus.has(label)) {
      this.expandedMenus.delete(label);
    } else {
      this.expandedMenus.add(label);
    }
  }

  isMenuExpanded(label: string): boolean {
    return this.expandedMenus.has(label);
  }

  hasChildren(item: NavigationItem): boolean {
    return !!item.children?.length;
  }
}