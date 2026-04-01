import { Routes } from '@angular/router';
import { DashboardVendedorComponent } from './pages/dashboard-vendedor/dashboard-vendedor.component';
import { DashboardSupervisorComponent } from './pages/dashboard-supervisor/dashboard-supervisor.component';
import { HomeComponent } from './pages/home/home.component';
import { VendedoresComponent } from './pages/vendedores/vendedores.component';
import { MetasComponent } from './pages/metas/metas.component';
import { AuthGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'dashboard', component: DashboardVendedorComponent, canActivate: [AuthGuard] },
  { path: 'supervisor', component: DashboardSupervisorComponent, canActivate: [AuthGuard] },
  { path: 'vendedores', component: VendedoresComponent, canActivate: [AuthGuard] },
  { path: 'metas', component: MetasComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/home' }
];
