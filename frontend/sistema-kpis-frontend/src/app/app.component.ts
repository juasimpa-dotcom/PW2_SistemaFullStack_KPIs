import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/auth/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatListModule
  ],
  template: `
    @if (!mostrarLayout) {
      <router-outlet></router-outlet>
    } @else {
      <mat-sidenav-container class="h-screen">
        <mat-sidenav #sidenav mode="side" [opened]="auth.isLoggedIn()" class="w-64 bg-white border-r border-slate-200 shadow-lg">
          <div class="h-full flex flex-col">
            <!-- Header con gradiente -->
            <div class="p-5 bg-gradient-to-br from-indigo-600 to-purple-600">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <mat-icon class="text-white">insights</mat-icon>
                </div>
                <div>
                  <h2 class="font-bold text-white text-lg">SistemaKpis</h2>
                  <p class="text-xs text-indigo-100">Gestión de Ventas</p>
                </div>
              </div>
            </div>

            <!-- Usuario info -->
            <div class="px-4 py-4 border-b border-slate-100 bg-slate-50">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                  {{ (auth.getFullName() || auth.getUsername()).charAt(0).toUpperCase() }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-slate-800 text-sm truncate">{{ auth.getFullName() || auth.getUsername() }}</p>
                  <p class="text-xs text-slate-500 capitalize">{{ auth.isSupervisor() ? 'Supervisor' : 'Vendedor' }}</p>
                </div>
              </div>
            </div>

            <!-- Menú de navegación -->
            <mat-nav-list class="flex-1 px-3 py-4 space-y-1">
              @if (auth.isVendedor()) {
                <a mat-list-item routerLink="/dashboard" routerLinkActive="active-link" 
                   class="!rounded-xl !mb-1 !h-12 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 group">
                  <mat-icon matListItemIcon class="text-slate-500 group-hover:text-indigo-600 transition-colors">dashboard</mat-icon>
                  <span class="font-medium group-hover:text-indigo-600">Mi Dashboard</span>
                </a>
                <a mat-list-item routerLink="/registrar-venta" routerLinkActive="active-link"
                   class="!rounded-xl !mb-1 !h-12 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 group">
                  <mat-icon matListItemIcon class="text-slate-500 group-hover:text-indigo-600 transition-colors">point_of_sale</mat-icon>
                  <span class="font-medium group-hover:text-indigo-600">Registrar Venta</span>
                </a>
              }
              
              @if (auth.isSupervisor()) {
                <a mat-list-item routerLink="/supervisor" routerLinkActive="active-link"
                   class="!rounded-xl !mb-1 !h-12 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 group">
                  <mat-icon matListItemIcon class="text-slate-500 group-hover:text-indigo-600 transition-colors">supervisor_account</mat-icon>
                  <span class="font-medium group-hover:text-indigo-600">Panel Supervisor</span>
                </a>
                <a mat-list-item routerLink="/equipo" routerLinkActive="active-link"
                   class="!rounded-xl !mb-1 !h-12 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 group">
                  <mat-icon matListItemIcon class="text-slate-500 group-hover:text-indigo-600 transition-colors">groups</mat-icon>
                  <span class="font-medium group-hover:text-indigo-600">Mi Equipo</span>
                </a>
                <a mat-list-item routerLink="/vendedores" routerLinkActive="active-link"
                   class="!rounded-xl !mb-1 !h-12 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 group">
                  <mat-icon matListItemIcon class="text-slate-500 group-hover:text-indigo-600 transition-colors">person_add</mat-icon>
                  <span class="font-medium group-hover:text-indigo-600">Gestionar Vendedores</span>
                </a>
                <a mat-list-item routerLink="/metas" routerLinkActive="active-link"
                   class="!rounded-xl !mb-1 !h-12 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 group">
                  <mat-icon matListItemIcon class="text-slate-500 group-hover:text-indigo-600 transition-colors">flag</mat-icon>
                  <span class="font-medium group-hover:text-indigo-600">Asignar Metas</span>
                </a>
              }
            </mat-nav-list>

            <!-- Footer con botón salir -->
            <div class="p-4 border-t border-slate-200 bg-slate-50">
              <button (click)="logout()" 
                      class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-xl transition-all duration-200 group">
                <mat-icon class="text-lg group-hover:scale-110 transition-transform">logout</mat-icon>
                <span class="font-medium">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </mat-sidenav>

        <mat-sidenav-content>
          <mat-toolbar color="primary" class="flex justify-between px-4 !bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md">
            @if (auth.isLoggedIn()) {
              <button mat-icon-button (click)="sidenav.toggle()" class="!text-white">
                <mat-icon>menu</mat-icon>
              </button>
            } @else {
              <span class="font-semibold text-lg text-white">Sistema KPIs</span>
            }
            
            <div class="flex items-center gap-3">
              @if (auth.isLoggedIn()) {
                <div class="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <mat-icon class="text-sm text-white">person</mat-icon>
                  <span class="text-sm font-medium text-white">{{ auth.getFullName() || auth.getUsername() }}</span>
                </div>
              } @else {
                <button mat-raised-button color="accent" (click)="login()" class="!rounded-lg">
                  <mat-icon>login</mat-icon>
                  Iniciar Sesión
                </button>
              }
            </div>
          </mat-toolbar>
          
          <div class="p-0 bg-slate-50 min-h-screen">
            <router-outlet></router-outlet>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    }
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
    ::ng-deep .mat-mdc-list-item.active-link {
      background: linear-gradient(90deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.08) 100%) !important;
      color: #4f46e5 !important;
      border-left: 3px solid #4f46e5;
    }
    ::ng-deep .mat-mdc-list-item.active-link mat-icon {
      color: #4f46e5 !important;
    }
    ::ng-deep .mat-mdc-list-item:hover:not(.active-link) {
      background-color: rgba(99, 102, 241, 0.05) !important;
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'sistema-kpis-frontend';
  mostrarLayout = true;

  constructor(
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('🚀 AppComponent inicializado');
    this.auth.debug();
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.mostrarLayout = event.urlAfterRedirects !== '/home' && event.urlAfterRedirects !== '/' && this.auth.isLoggedIn();
    });
    
    this.mostrarLayout = this.auth.isLoggedIn();
  }

  login(): void {
    this.auth.login();
  }

  logout(): void {
    this.auth.logout();
  }
}
