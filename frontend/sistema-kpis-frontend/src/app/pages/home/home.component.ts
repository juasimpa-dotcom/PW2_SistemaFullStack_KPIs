import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <nav class="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-slate-900/70 border-b border-white/10">
        <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <mat-icon class="text-white">analytics</mat-icon>
            </div>
            <span class="text-xl font-bold text-white">KPI<span class="text-cyan-400">Pro</span></span>
          </div>
          <button mat-raised-button color="accent" (click)="login()" class="!rounded-full !px-6">
            <mat-icon>login</mat-icon>
            Iniciar Sesión
          </button>
        </div>
      </nav>

      <section class="relative min-h-screen flex items-center justify-center pt-20 px-6">
        <div class="absolute inset-0 overflow-hidden">
          <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div class="relative z-10 text-center max-w-5xl mx-auto">
          <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/20">
            <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span class="text-cyan-300 text-sm">Sistema de Gestión de Ventas</span>
          </div>

          <h1 class="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Impulsa tu <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Equipo de Ventas</span>
          </h1>

          <p class="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Monitorea el rendimiento de tu equipo en tiempo real, establece metas y alcanza tus objetivos con análisis detallados.
          </p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button mat-raised-button color="accent" (click)="login()" class="!rounded-full !px-8 !py-3 text-lg">
              <mat-icon>login</mat-icon>
              Comenzar Ahora
            </button>
          </div>
        </div>
      </section>

      <section class="py-24 px-6">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-4xl font-bold text-white mb-4">Todo lo que necesitas para ganar</h2>
            <p class="text-slate-400 text-lg">Herramientas diseñadas para vendedores y supervisores</p>
          </div>

          <div class="grid md:grid-cols-3 gap-8">
            <div class="group bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-cyan-400/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-cyan-400/10">
              <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <mat-icon class="text-white">trending_up</mat-icon>
              </div>
              <h3 class="text-xl font-semibold text-white mb-3">KPIs en Tiempo Real</h3>
              <p class="text-slate-400">Visualiza cumplimiento de metas, ticket promedio y proyección de ventas al instante.</p>
            </div>

            <div class="group bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-cyan-400/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-cyan-400/10">
              <div class="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <mat-icon class="text-white">groups</mat-icon>
              </div>
              <h3 class="text-xl font-semibold text-white mb-3">Gestión de Equipo</h3>
              <p class="text-slate-400">Supervisores pueden gestionar vendedores, asignar metas y monitorear avances.</p>
            </div>

            <div class="group bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-cyan-400/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-cyan-400/10">
              <div class="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <mat-icon class="text-white">assessment</mat-icon>
              </div>
              <h3 class="text-xl font-semibold text-white mb-3">Reportes Detallados</h3>
              <p class="text-slate-400">Exporta reportes completos de rendimiento por vendedor o equipo completo.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="py-24 px-6 bg-gradient-to-r from-blue-600/20 to-cyan-600/20">
        <div class="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 class="text-4xl font-bold text-white mb-6">Para <span class="text-cyan-400">Vendedores</span></h2>
            <ul class="space-y-4">
              <li class="flex items-center gap-3 text-slate-300">
                <div class="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <mat-icon class="text-green-400 text-sm">check</mat-icon>
                </div>
                Registra tus ventas fácilmente
              </li>
              <li class="flex items-center gap-3 text-slate-300">
                <div class="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <mat-icon class="text-green-400 text-sm">check</mat-icon>
                </div>
                Visualiza tu progreso vs metas
              </li>
              <li class="flex items-center gap-3 text-slate-300">
                <div class="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <mat-icon class="text-green-400 text-sm">check</mat-icon>
                </div>
                Conoce tu ticket promedio
              </li>
              <li class="flex items-center gap-3 text-slate-300">
                <div class="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <mat-icon class="text-green-400 text-sm">check</mat-icon>
                </div>
                Proyección de cierre mensual
              </li>
            </ul>
          </div>
          <div class="relative">
            <div class="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-3xl blur-xl opacity-30"></div>
            <div class="relative bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <div class="flex items-center gap-4 mb-6">
                <div class="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <mat-icon class="text-white">check_circle</mat-icon>
                </div>
                <div>
                  <p class="text-white font-semibold">Cumplimiento de Meta</p>
                  <p class="text-3xl font-bold text-green-400">85%</p>
                </div>
              </div>
              <div class="w-full bg-slate-700 rounded-full h-3">
                <div class="bg-gradient-to-r from-green-400 to-cyan-400 h-3 rounded-full" style="width: 85%"></div>
              </div>
              <p class="text-slate-400 text-sm mt-2">17/20 ventas completadas</p>
            </div>
          </div>
        </div>
      </section>

      <section class="py-24 px-6">
        <div class="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div class="order-2 md:order-1 relative">
            <div class="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-3xl blur-xl opacity-30"></div>
            <div class="relative bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <h4 class="text-white font-semibold mb-4">Ranking del Equipo</h4>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <span class="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-slate-900">1</span>
                    <span class="text-white">María García</span>
                  </div>
                  <span class="text-green-400 font-semibold">92%</span>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <span class="w-6 h-6 bg-slate-400 rounded-full flex items-center justify-center text-xs font-bold text-slate-900">2</span>
                    <span class="text-white">Carlos López</span>
                  </div>
                  <span class="text-cyan-400 font-semibold">78%</span>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <span class="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-xs font-bold text-white">3</span>
                    <span class="text-white">Ana Martínez</span>
                  </div>
                  <span class="text-orange-400 font-semibold">65%</span>
                </div>
              </div>
            </div>
          </div>
          <div class="order-1 md:order-2">
            <h2 class="text-4xl font-bold text-white mb-6">Para <span class="text-purple-400">Supervisores</span></h2>
            <ul class="space-y-4">
              <li class="flex items-center gap-3 text-slate-300">
                <div class="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <mat-icon class="text-purple-400 text-sm">check</mat-icon>
                </div>
                Gestiona tu equipo de vendedores
              </li>
              <li class="flex items-center gap-3 text-slate-300">
                <div class="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <mat-icon class="text-purple-400 text-sm">check</mat-icon>
                </div>
                Asigna metas individuales
              </li>
              <li class="flex items-center gap-3 text-slate-300">
                <div class="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <mat-icon class="text-purple-400 text-sm">check</mat-icon>
                </div>
                Ranking de vendedores en tiempo real
              </li>
              <li class="flex items-center gap-3 text-slate-300">
                <div class="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <mat-icon class="text-purple-400 text-sm">check</mat-icon>
                </div>
                Alertas de vendedores en riesgo
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section class="py-24 px-6 text-center">
        <div class="max-w-3xl mx-auto">
          <h2 class="text-4xl font-bold text-white mb-6">¿Listo para empezar?</h2>
          <p class="text-slate-400 text-lg mb-10">Únete a cientos de equipos que ya están mejorando su rendimiento con KPIPro.</p>
          <button mat-raised-button color="accent" (click)="login()" class="!rounded-full !px-12 !py-4 text-lg">
            <mat-icon>login</mat-icon>
            Iniciar Sesión Ahora
          </button>
        </div>
      </section>

      <footer class="py-8 px-6 border-t border-white/10">
        <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <mat-icon class="text-white text-sm">analytics</mat-icon>
            </div>
            <span class="text-white font-semibold">KPI<span class="text-cyan-400">Pro</span></span>
          </div>
          <p class="text-slate-500 text-sm">© 2026 KPIPro. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  `
})
export class HomeComponent {
  constructor(private auth: AuthService) {}

  login(): void {
    this.auth.login();
  }
}
