import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { Supplier } from '../../../shared/models/supplier';

@Injectable({
    providedIn: 'root'
})
export class SupplierService {

    private readonly suppliers: Supplier[] = [
        {
            id: 1,
            code: 'SUP-001',
            name: 'Tech World Supplies',
            contactPerson: 'Rahul Sharma',
            email: 'rahul@techworld.example',
            phone: '9876543210',
            address: '12 MG Road',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560001',
            taxNumber: '29ABCDE1234F1Z5',
            paymentTerms: '30 Days',
            isActive: true,
            createdAt: '2026-08-01T10:00:00',
            updatedAt: '2026-08-20T10:00:00'
        },
        {
            id: 2,
            code: 'SUP-002',
            name: 'Office Mart',
            contactPerson: 'Priya Verma',
            email: 'priya@officemart.example',
            phone: '9876543211',
            address: '45 Nehru Street',
            city: 'Chennai',
            state: 'Tamil Nadu',
            postalCode: '600001',
            taxNumber: '33FGHIJ5678K2Z6',
            paymentTerms: '15 Days',
            isActive: true,
            createdAt: '2026-08-03T10:00:00',
            updatedAt: '2026-08-18T10:00:00'
        },
        {
            id: 3,
            code: 'SUP-003',
            name: 'Fresh Foods Distributors',
            contactPerson: 'Amit Patel',
            email: 'amit@freshfoods.example',
            phone: '9876543212',
            address: '78 Ring Road',
            city: 'Ahmedabad',
            state: 'Gujarat',
            postalCode: '380001',
            taxNumber: '24KLMNO9012P3Z7',
            paymentTerms: '30 Days',
            isActive: true,
            createdAt: '2026-08-05T10:00:00',
            updatedAt: '2026-08-19T10:00:00'
        },
        {
            id: 4,
            code: 'SUP-004',
            name: 'Prime Stationery',
            contactPerson: 'Neha Singh',
            email: 'neha@primestationery.example',
            phone: '9876543213',
            address: '21 Station Road',
            city: 'Pune',
            state: 'Maharashtra',
            postalCode: '411001',
            taxNumber: '27QRSTU3456V4Z8',
            paymentTerms: '45 Days',
            isActive: true,
            createdAt: '2026-08-07T10:00:00',
            updatedAt: '2026-08-21T10:00:00'
        },
        {
            id: 5,
            code: 'SUP-005',
            name: 'General Trading Co.',
            contactPerson: 'Vikram Rao',
            email: 'vikram@generaltrading.example',
            phone: '9876543214',
            address: '9 Market Street',
            city: 'Hyderabad',
            state: 'Telangana',
            postalCode: '500001',
            taxNumber: '36WXYZA7890B5Z9',
            paymentTerms: '15 Days',
            isActive: false,
            createdAt: '2026-08-09T10:00:00',
            updatedAt: '2026-08-22T10:00:00'
        }
    ];

    getSuppliers(): Observable<Supplier[]> {
        return of(this.suppliers);
    }

    getSupplierById(id: number): Observable<Supplier | null> {
        const supplier = this.suppliers.find(
            item => item.id === id
        );

        return of(supplier ?? null);
    }

    createSupplier(
        supplierData: Partial<Supplier>
    ): Observable<Supplier> {

        const now = new Date().toISOString();

        const newSupplier: Supplier = {
            id: this.getNextId(),
            code: supplierData.code ?? '',
            name: supplierData.name ?? '',
            contactPerson: supplierData.contactPerson ?? '',
            email: supplierData.email ?? '',
            phone: supplierData.phone ?? '',
            address: supplierData.address ?? '',
            city: supplierData.city ?? '',
            state: supplierData.state ?? '',
            postalCode: supplierData.postalCode ?? '',
            taxNumber: supplierData.taxNumber ?? '',
            paymentTerms: supplierData.paymentTerms ?? '30 Days',
            isActive: supplierData.isActive ?? true,
            createdAt: now,
            updatedAt: now
        };

        this.suppliers.push(newSupplier);

        return of(newSupplier);
    }

    updateSupplier(
        id: number,
        supplierData: Partial<Supplier>
    ): Observable<Supplier | null> {

        const index = this.suppliers.findIndex(
            supplier => supplier.id === id
        );

        if (index === -1) {
            return of(null);
        }

        const updatedSupplier: Supplier = {
            ...this.suppliers[index],
            ...supplierData,
            id,
            updatedAt: new Date().toISOString()
        };

        this.suppliers[index] = updatedSupplier;

        return of(updatedSupplier);
    }

    deleteSupplier(id: number): Observable<boolean> {
        const index = this.suppliers.findIndex(
            supplier => supplier.id === id
        );

        if (index === -1) {
            return of(false);
        }

        this.suppliers.splice(index, 1);

        return of(true);
    }

    private getNextId(): number {
        if (this.suppliers.length === 0) {
            return 1;
        }

        return Math.max(
            ...this.suppliers.map(supplier => supplier.id)
        ) + 1;
    }
}