import { Routes } from '@angular/router';

import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

import { authGuard } from './core/auth/guards/auth.guard';

export const routes: Routes = [

    // Default route
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },

    // Authentication routes
    {
        path: 'auth',
        component: AuthLayoutComponent,
        children: [

            {
                path: 'login',
                loadComponent: () =>
                    import('./features/auth/login/login.component').then(
                        m => m.LoginComponent
                    )
            },

            {
                path: 'forgot-password',
                loadComponent: () =>
                    import('./features/auth/forgot-password/forgot-password.component').then(
                        m => m.ForgotPasswordComponent
                    )
            }

        ]
    },

    // Main application routes
    {
        path: '',
        component: MainLayoutComponent,
        children: [

            // Dashboard
            {
                path: 'dashboard',
                canActivate: [authGuard],
                loadComponent: () =>
                    import('./features/dashboard/dashboard.component').then(
                        m => m.DashboardComponent
                    )
            },

            // Products
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

            // Categories
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

            // Suppliers
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
            }

        ]
    },

    // Unknown routes
    {
        path: '**',
        redirectTo: 'dashboard'
    }

];