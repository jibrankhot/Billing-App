import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Role {
  id: number;
  name: string;
  description: string;
  userCount: number;
  isActive: boolean;
}

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './role-list.component.html',
  styleUrl: './role-list.component.scss'
})
export class RoleListComponent {

  roles: Role[] = [
    {
      id: 1,
      name: 'Administrator',
      description: 'Full access to all Stockly modules.',
      userCount: 1,
      isActive: true
    },
    {
      id: 2,
      name: 'Manager',
      description: 'Manage daily business operations.',
      userCount: 1,
      isActive: true
    },
    {
      id: 3,
      name: 'Sales Executive',
      description: 'Manage customers, invoices and sales.',
      userCount: 2,
      isActive: true
    },
    {
      id: 4,
      name: 'Inventory Executive',
      description: 'Manage products and inventory operations.',
      userCount: 1,
      isActive: true
    }
  ];

  get activeRoles(): number {
    return this.roles.filter(
      role => role.isActive
    ).length;
  }

  get inactiveRoles(): number {
    return this.roles.filter(
      role => !role.isActive
    ).length;
  }

  toggleStatus(role: Role): void {

    role.isActive = !role.isActive;

  }

}