import { Routes } from '@angular/router';

import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

import { authGuard } from './core/auth/guards/auth.guard';

export const routes: Routes = [

    // =========================================================
    // Default route
    // =========================================================

    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },


    // =========================================================
    // Authentication routes
    // =========================================================

    {
        path: 'auth',
        component: AuthLayoutComponent,
        children: [

            // /auth/login
            {
                path: 'login',
                loadComponent: () =>
                    import(
                        './features/auth/login/login.component'
                    ).then(
                        m => m.LoginComponent
                    )
            },

            // /auth/forgot-password
            {
                path: 'forgot-password',
                loadComponent: () =>
                    import(
                        './features/auth/forgot-password/forgot-password.component'
                    ).then(
                        m => m.ForgotPasswordComponent
                    )
            }

        ]
    },


    // =========================================================
    // Main application routes
    // =========================================================

    {
        path: '',
        component: MainLayoutComponent,

        children: [

            // =====================================================
            // Dashboard
            // =====================================================

            {
                path: 'dashboard',
                canActivate: [authGuard],

                loadComponent: () =>
                    import(
                        './features/dashboard/dashboard.component'
                    ).then(
                        m => m.DashboardComponent
                    )
            },


            // =====================================================
            // Products
            // =====================================================

            {
                path: 'products',
                canActivate: [authGuard],

                children: [

                    // /products
                    {
                        path: '',
                        loadComponent: () =>
                            import(
                                './features/products/pages/product-list/product-list.component'
                            ).then(
                                m => m.ProductListComponent
                            )
                    },

                    // /products/create
                    {
                        path: 'create',
                        loadComponent: () =>
                            import(
                                './features/products/pages/product-create/product-create.component'
                            ).then(
                                m => m.ProductCreateComponent
                            )
                    },

                    // /products/:id/edit
                    {
                        path: ':id/edit',
                        loadComponent: () =>
                            import(
                                './features/products/pages/product-edit/product-edit.component'
                            ).then(
                                m => m.ProductEditComponent
                            )
                    },

                    // /products/:id
                    {
                        path: ':id',
                        loadComponent: () =>
                            import(
                                './features/products/pages/product-details/product-details.component'
                            ).then(
                                m => m.ProductDetailsComponent
                            )
                    }

                ]
            },


            // =====================================================
            // Categories
            // =====================================================

            {
                path: 'categories',
                canActivate: [authGuard],

                children: [

                    // /categories
                    {
                        path: '',
                        loadComponent: () =>
                            import(
                                './features/categories/pages/category-list/category-list.component'
                            ).then(
                                m => m.CategoryListComponent
                            )
                    },

                    // /categories/create
                    {
                        path: 'create',
                        loadComponent: () =>
                            import(
                                './features/categories/pages/category-create/category-create.component'
                            ).then(
                                m => m.CategoryCreateComponent
                            )
                    },

                    // /categories/:id/edit
                    {
                        path: ':id/edit',
                        loadComponent: () =>
                            import(
                                './features/categories/pages/category-edit/category-edit.component'
                            ).then(
                                m => m.CategoryEditComponent
                            )
                    },

                    // /categories/:id
                    {
                        path: ':id',
                        loadComponent: () =>
                            import(
                                './features/categories/pages/category-details/category-details.component'
                            ).then(
                                m => m.CategoryDetailsComponent
                            )
                    }

                ]
            },


            // =====================================================
            // Suppliers
            // =====================================================

            {
                path: 'suppliers',
                canActivate: [authGuard],

                children: [

                    // /suppliers
                    {
                        path: '',
                        loadComponent: () =>
                            import(
                                './features/suppliers/pages/supplier-list/supplier-list.component'
                            ).then(
                                m => m.SupplierListComponent
                            )
                    },

                    // /suppliers/create
                    {
                        path: 'create',
                        loadComponent: () =>
                            import(
                                './features/suppliers/pages/supplier-create/supplier-create.component'
                            ).then(
                                m => m.SupplierCreateComponent
                            )
                    },

                    // /suppliers/:id/edit
                    {
                        path: ':id/edit',
                        loadComponent: () =>
                            import(
                                './features/suppliers/pages/supplier-edit/supplier-edit.component'
                            ).then(
                                m => m.SupplierEditComponent
                            )
                    },

                    // /suppliers/:id
                    {
                        path: ':id',
                        loadComponent: () =>
                            import(
                                './features/suppliers/pages/supplier-details/supplier-details.component'
                            ).then(
                                m => m.SupplierDetailsComponent
                            )
                    }

                ]
            },


            // =====================================================
            // Customers
            // =====================================================

            {
                path: 'customers',
                canActivate: [authGuard],

                children: [

                    // /customers
                    {
                        path: '',
                        loadComponent: () =>
                            import(
                                './features/customers/pages/customer-list/customer-list.component'
                            ).then(
                                m => m.CustomerListComponent
                            )
                    },

                    // /customers/create
                    {
                        path: 'create',
                        loadComponent: () =>
                            import(
                                './features/customers/pages/customer-create/customer-create.component'
                            ).then(
                                m => m.CustomerCreateComponent
                            )
                    },

                    // /customers/:id/edit
                    {
                        path: ':id/edit',
                        loadComponent: () =>
                            import(
                                './features/customers/pages/customer-edit/customer-edit.component'
                            ).then(
                                m => m.CustomerEditComponent
                            )
                    },

                    // /customers/:id
                    {
                        path: ':id',
                        loadComponent: () =>
                            import(
                                './features/customers/pages/customer-details/customer-details.component'
                            ).then(
                                m => m.CustomerDetailsComponent
                            )
                    }

                ]
            },


            // =====================================================
            // Invoices
            // =====================================================

            {
                path: 'invoices',
                canActivate: [authGuard],

                children: [

                    // /invoices
                    {
                        path: '',
                        loadComponent: () =>
                            import(
                                './features/sales/invoices/pages/invoice-list/invoice-list.component'
                            ).then(
                                m => m.InvoiceListComponent
                            )
                    },

                    // /invoices/create
                    {
                        path: 'create',
                        loadComponent: () =>
                            import(
                                './features/sales/invoices/pages/invoice-create/invoice-create.component'
                            ).then(
                                m => m.InvoiceCreateComponent
                            )
                    },

                    // /invoices/:id/edit
                    {
                        path: ':id/edit',
                        loadComponent: () =>
                            import(
                                './features/sales/invoices/pages/invoice-edit/invoice-edit.component'
                            ).then(
                                m => m.InvoiceEditComponent
                            )
                    },

                    // /invoices/:id/print
                    {
                        path: ':id/print',
                        loadComponent: () =>
                            import(
                                './features/sales/invoices/pages/invoice-print/invoice-print.component'
                            ).then(
                                m => m.InvoicePrintComponent
                            )
                    },

                    // /invoices/:id
                    {
                        path: ':id',
                        loadComponent: () =>
                            import(
                                './features/sales/invoices/pages/invoice-details/invoice-details.component'
                            ).then(
                                m => m.InvoiceDetailsComponent
                            )
                    }

                ]
            },


            // =====================================================
            // Purchase Orders
            // =====================================================

            {
                path: 'purchases',
                canActivate: [authGuard],

                children: [

                    // /purchases
                    {
                        path: '',
                        loadComponent: () =>
                            import(
                                './features/purchases/pages/purchase-order-list/purchase-order-list.component'
                            ).then(
                                m => m.PurchaseOrderListComponent
                            )
                    },

                    // /purchases/create
                    {
                        path: 'create',
                        loadComponent: () =>
                            import(
                                './features/purchases/pages/purchase-order-create/purchase-order-create.component'
                            ).then(
                                m => m.PurchaseOrderCreateComponent
                            )
                    },

                    // /purchases/:id/edit
                    {
                        path: ':id/edit',
                        loadComponent: () =>
                            import(
                                './features/purchases/pages/purchase-order-edit/purchase-order-edit.component'
                            ).then(
                                m => m.PurchaseOrderEditComponent
                            )
                    },

                    // /purchases/:id
                    {
                        path: ':id',
                        loadComponent: () =>
                            import(
                                './features/purchases/pages/purchase-order-details/purchase-order-details.component'
                            ).then(
                                m => m.PurchaseOrderDetailsComponent
                            )
                    }

                ]
            },


            // =====================================================
            // Inventory
            // =====================================================

            {
                path: 'inventory',
                canActivate: [authGuard],

                children: [

                    // /inventory
                    {
                        path: '',
                        loadComponent: () =>
                            import(
                                './features/inventory/pages/stock-overview/stock-overview.component'
                            ).then(
                                m => m.StockOverviewComponent
                            )
                    },

                    // /inventory/low-stock
                    {
                        path: 'low-stock',
                        loadComponent: () =>
                            import(
                                './features/inventory/pages/low-stock/low-stock.component'
                            ).then(
                                m => m.LowStockComponent
                            )
                    },

                    // /inventory/movements
                    {
                        path: 'movements',
                        loadComponent: () =>
                            import(
                                './features/inventory/pages/stock-movement/stock-movements.component'
                            ).then(
                                m => m.StockMovementsComponent
                            )
                    },

                    // /inventory/adjustment
                    {
                        path: 'adjustment',
                        loadComponent: () =>
                            import(
                                './features/inventory/pages/stock-adjustment/stock-adjustment.component'
                            ).then(
                                m => m.StockAdjustmentComponent
                            )
                    }

                ]
            },


            // =====================================================
            // Sales Orders
            // =====================================================

            {
                path: 'sales-orders',
                canActivate: [authGuard],

                children: [

                    // /sales-orders
                    {
                        path: '',
                        loadComponent: () =>
                            import(
                                './features/sales/sales-orders/pages/sales-order-list/sales-order-list.component'
                            ).then(
                                m => m.SalesOrderListComponent
                            )
                    },

                    // /sales-orders/create
                    {
                        path: 'create',
                        loadComponent: () =>
                            import(
                                './features/sales/sales-orders/pages/sales-order-create/sales-order-create.component'
                            ).then(
                                m => m.SalesOrderCreateComponent
                            )
                    },

                    // /sales-orders/:id
                    {
                        path: ':id',
                        loadComponent: () =>
                            import(
                                './features/sales/sales-orders/pages/sales-order-details/sales-order-details.component'
                            ).then(
                                m => m.SalesOrderDetailsComponent
                            )
                    }

                ]
            },


            // =====================================================
            // Sales Returns
            // =====================================================

            {
                path: 'sales-returns',
                canActivate: [authGuard],

                children: [

                    // /sales-returns
                    {
                        path: '',
                        loadComponent: () =>
                            import(
                                './features/sales/sales-returns/pages/sales-return-list/sales-return-list.component'
                            ).then(
                                m => m.SalesReturnListComponent
                            )
                    },

                    // /sales-returns/create
                    {
                        path: 'create',
                        loadComponent: () =>
                            import(
                                './features/sales/sales-returns/pages/sales-return-create/sales-return-create.component'
                            ).then(
                                m => m.SalesReturnCreateComponent
                            )
                    },

                    // /sales-returns/:id
                    {
                        path: ':id',
                        loadComponent: () =>
                            import(
                                './features/sales/sales-returns/pages/sales-return-details/sales-return-details.component'
                            ).then(
                                m => m.SalesReturnDetailsComponent
                            )
                    }

                ]
            },


            // =====================================================
            // Payments
            // =====================================================

            {
                path: 'payments',
                canActivate: [authGuard],

                children: [

                    // /payments
                    {
                        path: '',
                        loadComponent: () =>
                            import(
                                './features/payments/pages/payment-list/payment-list.component'
                            ).then(
                                m => m.PaymentListComponent
                            )
                    },

                    // /payments/create
                    {
                        path: 'create',
                        loadComponent: () =>
                            import(
                                './features/payments/pages/payment-create/payment-create.component'
                            ).then(
                                m => m.PaymentCreateComponent
                            )
                    },

                    // /payments/:id
                    {
                        path: ':id',
                        loadComponent: () =>
                            import(
                                './features/payments/pages/payment-details/payment-details.component'
                            ).then(
                                m => m.PaymentDetailsComponent
                            )
                    }

                ]
            },


            // =====================================================
            // Reports
            // =====================================================

            {
                path: 'reports',
                canActivate: [authGuard],

                children: [

                    // /reports/sales
                    {
                        path: 'sales',
                        loadComponent: () =>
                            import(
                                './features/reports/sales-report/sales-report.component'
                            ).then(
                                m => m.SalesReportComponent
                            )
                    },

                    // /reports/purchases
                    {
                        path: 'purchases',
                        loadComponent: () =>
                            import(
                                './features/reports/purchase-report/purchase-report.component'
                            ).then(
                                m => m.PurchaseReportComponent
                            )
                    },

                    // /reports/inventory
                    {
                        path: 'inventory',
                        loadComponent: () =>
                            import(
                                './features/reports/inventory-report/inventory-report.component'
                            ).then(
                                m => m.InventoryReportComponent
                            )
                    },

                    // /reports/payments
                    {
                        path: 'payments',
                        loadComponent: () =>
                            import(
                                './features/reports/payment-report/payment-report.component'
                            ).then(
                                m => m.PaymentReportComponent
                            )
                    }

                ]
            },


            // =====================================================
            // Users
            // =====================================================

            {
                path: 'users',
                canActivate: [authGuard],

                children: [

                    // /users
                    {
                        path: '',
                        loadComponent: () =>
                            import(
                                './features/users/pages/user-list/user-list.component'
                            ).then(
                                m => m.UserListComponent
                            )
                    },

                    // /users/create
                    {
                        path: 'create',
                        loadComponent: () =>
                            import(
                                './features/users/pages/user-form/user-form.component'
                            ).then(
                                m => m.UserFormComponent
                            )
                    },

                    // /users/:id/edit
                    {
                        path: ':id/edit',
                        loadComponent: () =>
                            import(
                                './features/users/pages/user-form/user-form.component'
                            ).then(
                                m => m.UserFormComponent
                            )
                    },

                    // /users/roles
                    {
                        path: 'roles',
                        loadComponent: () =>
                            import(
                                './features/users/pages/role-list/role-list.component'
                            ).then(
                                m => m.RoleListComponent
                            )
                    }

                ]
            },


            // =====================================================
            // Settings
            // =====================================================

            {
                path: 'settings',
                canActivate: [authGuard],

                children: [

                    // /settings/company
                    {
                        path: 'company',
                        loadComponent: () =>
                            import(
                                './features/settings/pages/company-profile/company-profile.component'
                            ).then(
                                m => m.CompanyProfileComponent
                            )
                    },

                    // /settings/invoice
                    {
                        path: 'invoice',
                        loadComponent: () =>
                            import(
                                './features/settings/pages/invoice-settings/invoice-settings.component'
                            ).then(
                                m => m.InvoiceSettingsComponent
                            )
                    },

                    // /settings/tax
                    {
                        path: 'tax',
                        loadComponent: () =>
                            import(
                                './features/settings/pages/tax-settings/tax-settings.component'
                            ).then(
                                m => m.TaxSettingsComponent
                            )
                    }

                ]
            },

        ]
    },


    // =========================================================
    // Unknown routes
    // =========================================================

    {
        path: '**',
        redirectTo: 'dashboard'
    }

];