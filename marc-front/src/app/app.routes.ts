import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/public/layout/public-layout.component').then(
        (m) => m.PublicLayoutComponent,
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/public/pages/home/home.component').then(
            (m) => m.HomeComponent,
          ),
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./features/public/pages/about/about.component').then(
            (m) => m.AboutComponent,
          ),
      },
      {
        path: 'projects',
        loadComponent: () =>
          import(
            './features/public/pages/projects-list/projects-list.component'
          ).then((m) => m.ProjectsListComponent),
      },
      {
        path: 'projects/:slug',
        loadComponent: () =>
          import(
            './features/public/pages/project-detail/project-detail.component'
          ).then((m) => m.ProjectDetailComponent),
      },
      {
        path: 'posts',
        loadComponent: () =>
          import('./features/public/pages/posts-list/posts-list.component').then(
            (m) => m.PostsListComponent,
          ),
      },
      {
        path: 'posts/:slug',
        loadComponent: () =>
          import('./features/public/pages/post-detail/post-detail.component').then(
            (m) => m.PostDetailComponent,
          ),
      },
    ],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/layout/dashboard-layout.component').then(
        (m) => m.DashboardLayoutComponent,
      ),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'projects' },
      {
        path: 'projects/new',
        loadComponent: () =>
          import('./features/dashboard/pages/content-editor/content-editor.component').then(
            (m) => m.ContentEditorComponent,
          ),
        data: { contentType: 'project' },
      },
      {
        path: 'projects/:id/edit',
        loadComponent: () =>
          import('./features/dashboard/pages/content-editor/content-editor.component').then(
            (m) => m.ContentEditorComponent,
          ),
        data: { contentType: 'project' },
      },
      {
        path: 'projects',
        loadComponent: () =>
          import(
            './features/dashboard/pages/projects-admin/projects-admin.component'
          ).then((m) => m.ProjectsAdminComponent),
      },
      {
        path: 'posts/new',
        loadComponent: () =>
          import('./features/dashboard/pages/content-editor/content-editor.component').then(
            (m) => m.ContentEditorComponent,
          ),
        data: { contentType: 'post' },
      },
      {
        path: 'posts/:id/edit',
        loadComponent: () =>
          import('./features/dashboard/pages/content-editor/content-editor.component').then(
            (m) => m.ContentEditorComponent,
          ),
        data: { contentType: 'post' },
      },
      {
        path: 'posts',
        loadComponent: () =>
          import('./features/dashboard/pages/posts-admin/posts-admin.component').then(
            (m) => m.PostsAdminComponent,
          ),
      },
      {
        path: 'tags',
        loadComponent: () =>
          import('./features/dashboard/pages/tags-admin/tags-admin.component').then(
            (m) => m.TagsAdminComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
