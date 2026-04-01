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
        <mat-sidenav #sidenav mode="side" [opened]="auth.isLoggedIn()" class="w-64 bg-gray-900">
          <mat-nav-list>
            <div class="p-4 text-white border-b border-gray-700">
              <p class="font-semibold">{{ auth.getUsername() }}</p>
              <p class="text-sm text-gray-400">{{ auth.isSupervisor() ? 'Supervisor' : 'Vendedor' }}</p>
            </div>
            
            @if (auth.isVendedor()) {
              <a mat-list-item routerLink="/dashboard" routerLinkActive="active" class="text-gray-300 hover:bg-gray-800">
                <mat-icon matListItemIcon>dashboard</mat-icon>
                Mi Dashboard
              </a>
              <a mat-list-item routerLink="/mis-ventas" routerLinkActive="active" class="text-gray-300 hover:bg-gray-800">
                <mat-icon matListItemIcon>point_of_sale</mat-icon>
                Registrar Venta
              </a>
            }
            
            @if (auth.isSupervisor()) {
              <a mat-list-item routerLink="/supervisor" routerLinkActive="active" class="text-gray-300 hover:bg-gray-800">
                <mat-icon matListItemIcon>supervisor_account</mat-icon>
                Panel Supervisor
              </a>
              <a mat-list-item routerLink="/equipo" routerLinkActive="active" class="text-gray-300 hover:bg-gray-800">
                <mat-icon matListItemIcon>groups</mat-icon>
                Mi Equipo
              </a>
              <a mat-list-item routerLink="/vendedores" routerLinkActive="active" class="text-gray-300 hover:bg-gray-800">
                <mat-icon matListItemIcon>person_add</mat-icon>
                Gestionar Vendedores
              </a>
              <a mat-list-item routerLink="/metas" routerLinkActive="active" class="text-gray-300 hover:bg-gray-800">
                <mat-icon matListItemIcon>flag</mat-icon>
                Asignar Metas
              </a>
            }
          </mat-nav-list>
        </mat-sidenav>

        <mat-sidenav-content>
          <mat-toolbar color="primary" class="flex justify-between">
            @if (auth.isLoggedIn()) {
              <button mat-icon-button (click)="sidenav.toggle()">
                <mat-icon>menu</mat-icon>
              </button>
            } @else {
              <span>Sistema KPIs</span>
            }
            
            <div class="flex items-center gap-4">
              @if (auth.isLoggedIn()) {
                <span class="text-sm">{{ auth.getUsername() }}</span>
                <button mat-button (click)="logout()">
                  <mat-icon>logout</mat-icon>
                  Salir
                </button>
              } @else {
                <button mat-raised-button color="accent" (click)="login()">
                  <mat-icon>login</mat-icon>
                  Iniciar Sesión
                </button>
              }
            </div>
          </mat-toolbar>
          
          <div class="p-0">
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
