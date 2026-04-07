import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private auth = inject(AuthService);
  private router = inject(Router);

  canActivate(route?: ActivatedRouteSnapshot): boolean {
    console.log('AuthGuard - Verificando acceso...');
    
    if (!this.auth.isLoggedIn()) {
      console.log('AuthGuard - Usuario no logueado, redirigiendo...');
      this.router.navigate(['/home']);
      return false;
    }

    const path = route?.routeConfig?.path;
    console.log('AuthGuard - Usuario logueado, verificando rol para:', path);

    if (path === 'dashboard' && this.auth.isSupervisor()) {
      console.log('AuthGuard - Supervisor intentando acceder a dashboard, redirigiendo a /supervisor');
      this.router.navigate(['/supervisor']);
      return false;
    }

    if (path === 'supervisor' && !this.auth.isSupervisor()) {
      console.log('AuthGuard - Vendedor intentando acceder a supervisor, redirigiendo a /dashboard');
      this.router.navigate(['/dashboard']);
      return false;
    }

    if (path === 'equipo' && !this.auth.isSupervisor()) {
      console.log('AuthGuard - Vendedor intentando acceder a equipo, redirigiendo a /dashboard');
      this.router.navigate(['/dashboard']);
      return false;
    }

    console.log('AuthGuard - Acceso permitido');
    return true;
  }
}
