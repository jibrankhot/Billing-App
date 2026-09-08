import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { User } from '../../../shared/models/user';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    private users: User[] = [
        {
            id: 1,
            username: 'admin',
            fullName: 'System Administrator',
            email: 'admin@stockly.com',
            phone: '9876543210',
            roleId: 1,
            roleName: 'Administrator',
            isActive: true,
            createdAt: '2026-01-01',
            updatedAt: '2026-01-01'
        },
        {
            id: 2,
            username: 'manager',
            fullName: 'Store Manager',
            email: 'manager@stockly.com',
            phone: '9876543211',
            roleId: 2,
            roleName: 'Manager',
            isActive: true,
            createdAt: '2026-01-05',
            updatedAt: '2026-01-05'
        },
        {
            id: 3,
            username: 'sales',
            fullName: 'Sales Executive',
            email: 'sales@stockly.com',
            phone: '9876543212',
            roleId: 3,
            roleName: 'Sales Executive',
            isActive: true,
            createdAt: '2026-01-10',
            updatedAt: '2026-01-10'
        },
        {
            id: 4,
            username: 'inventory',
            fullName: 'Inventory Executive',
            email: 'inventory@stockly.com',
            phone: '9876543213',
            roleId: 4,
            roleName: 'Inventory Executive',
            isActive: true,
            createdAt: '2026-01-12',
            updatedAt: '2026-01-12'
        },
        {
            id: 5,
            username: 'olduser',
            fullName: 'Inactive User',
            email: 'olduser@stockly.com',
            phone: '9876543214',
            roleId: 3,
            roleName: 'Sales Executive',
            isActive: false,
            createdAt: '2026-01-15',
            updatedAt: '2026-02-01'
        }
    ];

    getUsers(): Observable<User[]> {
        return of([...this.users]);
    }

    getUserById(id: number): Observable<User | undefined> {
        const user = this.users.find(
            user => user.id === id
        );

        return of(user);
    }

    createUser(
        userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>
    ): Observable<User> {

        const newUser: User = {
            ...userData,
            id: this.getNextId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.users.push(newUser);

        return of(newUser);
    }

    updateUser(
        id: number,
        userData: Partial<User>
    ): Observable<User | undefined> {

        const index = this.users.findIndex(
            user => user.id === id
        );

        if (index === -1) {
            return of(undefined);
        }

        this.users[index] = {
            ...this.users[index],
            ...userData,
            id,
            updatedAt: new Date().toISOString()
        };

        return of(this.users[index]);
    }

    deleteUser(id: number): Observable<boolean> {

        const index = this.users.findIndex(
            user => user.id === id
        );

        if (index === -1) {
            return of(false);
        }

        this.users.splice(index, 1);

        return of(true);
    }

    getNextId(): number {
        return this.users.length > 0
            ? Math.max(...this.users.map(user => user.id)) + 1
            : 1;
    }

}