import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { Customer } from '../../../shared/models/customer';

@Injectable({
    providedIn: 'root'
})
export class CustomerService {

    private readonly customers: Customer[] = [
        {
            id: 1,
            code: 'CUS-001',
            name: 'ABC Retail Store',
            email: 'contact@abcretail.com',
            phone: '9876543210',
            address: '12 Market Road',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560001',
            taxNumber: '29ABCDE1234F1Z5',
            isActive: true,
            createdAt: '2026-08-01',
            updatedAt: '2026-08-01'
        },
        {
            id: 2,
            code: 'CUS-002',
            name: 'Tech Solutions Pvt Ltd',
            email: 'accounts@techsolutions.com',
            phone: '9876543211',
            address: '45 MG Road',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560025',
            taxNumber: '29BCDEF2345G1Z6',
            isActive: true,
            createdAt: '2026-08-02',
            updatedAt: '2026-08-02'
        },
        {
            id: 3,
            code: 'CUS-003',
            name: 'Office Hub',
            email: 'billing@officehub.com',
            phone: '9876543212',
            address: '78 Commercial Street',
            city: 'Chennai',
            state: 'Tamil Nadu',
            postalCode: '600001',
            taxNumber: '33CDEFG3456H1Z7',
            isActive: true,
            createdAt: '2026-08-03',
            updatedAt: '2026-08-03'
        },
        {
            id: 4,
            code: 'CUS-004',
            name: 'Green Mart',
            email: 'info@greenmart.com',
            phone: '9876543213',
            address: '21 Main Street',
            city: 'Hyderabad',
            state: 'Telangana',
            postalCode: '500001',
            taxNumber: '36DEFGH4567I1Z8',
            isActive: true,
            createdAt: '2026-08-04',
            updatedAt: '2026-08-04'
        },
        {
            id: 5,
            code: 'CUS-005',
            name: 'General Traders',
            email: 'generaltraders@example.com',
            phone: '9876543214',
            address: '10 Station Road',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400001',
            taxNumber: '27EFGHI5678J1Z9',
            isActive: false,
            createdAt: '2026-08-05',
            updatedAt: '2026-08-05'
        }
    ];

    getCustomers(): Observable<Customer[]> {
        return of(this.customers);
    }

    getCustomerById(id: number): Observable<Customer | null> {
        const customer = this.customers.find(
            customer => customer.id === id
        );

        return of(customer ?? null);
    }

    createCustomer(
        customerData: Partial<Customer>
    ): Observable<Customer> {

        const id = this.getNextId();

        const customer: Customer = {
            id,
            code: customerData.code ?? `CUS-${String(id).padStart(3, '0')}`,
            name: customerData.name ?? '',
            email: customerData.email ?? '',
            phone: customerData.phone ?? '',
            address: customerData.address ?? '',
            city: customerData.city ?? '',
            state: customerData.state ?? '',
            postalCode: customerData.postalCode ?? '',
            taxNumber: customerData.taxNumber ?? '',
            isActive: customerData.isActive ?? true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.customers.push(customer);

        return of(customer);
    }

    updateCustomer(
        id: number,
        customerData: Partial<Customer>
    ): Observable<Customer | null> {

        const index = this.customers.findIndex(
            customer => customer.id === id
        );

        if (index === -1) {
            return of(null);
        }

        const updatedCustomer: Customer = {
            ...this.customers[index],
            ...customerData,
            id,
            updatedAt: new Date().toISOString()
        };

        this.customers[index] = updatedCustomer;

        return of(updatedCustomer);
    }

    deleteCustomer(id: number): Observable<boolean> {

        const index = this.customers.findIndex(
            customer => customer.id === id
        );

        if (index === -1) {
            return of(false);
        }

        this.customers.splice(index, 1);

        return of(true);
    }

    private getNextId(): number {
        if (this.customers.length === 0) {
            return 1;
        }

        return Math.max(
            ...this.customers.map(customer => customer.id)
        ) + 1;
    }
}