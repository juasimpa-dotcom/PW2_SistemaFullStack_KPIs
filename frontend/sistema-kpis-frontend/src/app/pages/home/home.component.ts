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
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden relative">
      <nav class="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-white/10">
        <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <mat-icon class="text-white">analytics</mat-icon>
            </div>
            <span class="text-xl font-bold text-white">KPI<span class="text-cyan-400">Pro</span></span>
          </div>
          <button mat-raised-button color="accent" (click)="login()" class="!rounded-full !px-6 !py-2 !font-semibold">
            <mat-icon>login</mat-icon>
            Iniciar Sesión
          </button>
        </div>
      </nav>

      <!-- Floating Images Section -->
      <section class="relative min-h-screen flex items-center justify-center pt-20 px-6 overflow-hidden">
        <!-- Animated Background Orbs -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div class="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] animate-pulse"></div>
          <div class="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px]"></div>
        </div>

        <!-- Floating Cards -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <!-- Card 1 - Top Left -->
          <div class="absolute top-32 left-10 md:left-20 w-72 bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl animate-float-1">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                <mat-icon class="text-white">trending_up</mat-icon>
              </div>
              <div>
                <p class="text-white font-semibold">+85%</p>
                <p class="text-gray-400 text-sm">Crecimiento</p>
              </div>
            </div>
          </div>

          <!-- Card 2 - Top Right -->
          <div class="absolute top-40 right-10 md:right-32 w-64 bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl animate-float-2">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                <mat-icon class="text-white">groups</mat-icon>
              </div>
              <div>
                <p class="text-white font-semibold">25</p>
                <p class="text-gray-400 text-sm">Vendedores</p>
              </div>
            </div>
          </div>

          <!-- Card 3 - Middle Left -->
          <div class="absolute top-1/2 left-5 md:left-40 w-56 bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl animate-float-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                <mat-icon class="text-white">attach_money</mat-icon>
              </div>
              <div>
                <p class="text-white font-semibold">$125K</p>
                <p class="text-gray-400 text-sm">Ingresos</p>
              </div>
            </div>
          </div>

          <!-- Card 4 - Middle Right -->
          <div class="absolute top-1/3 right-10 md:right-20 w-60 bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl animate-float-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                <mat-icon class="text-white">flag</mat-icon>
              </div>
              <div>
                <p class="text-white font-semibold">98%</p>
                <p class="text-gray-400 text-sm">Metas</p>
              </div>
            </div>
          </div>

          <!-- Card 5 - Bottom Left -->
          <div class="absolute bottom-32 left-10 md:left-32 w-48 bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl animate-float-5">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-xl flex items-center justify-center">
                <mat-icon class="text-white">assessment</mat-icon>
              </div>
              <div>
                <p class="text-white font-semibold">12</p>
                <p class="text-gray-400 text-sm">Reportes</p>
              </div>
            </div>
          </div>

          <!-- Card 6 - Bottom Right -->
          <div class="absolute bottom-40 right-10 md:right-40 w-52 bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl animate-float-6">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gradient-to-br from-rose-400 to-red-500 rounded-xl flex items-center justify-center">
                <mat-icon class="text-white">star</mat-icon>
              </div>
              <div>
                <p class="text-white font-semibold">4.9</p>
                <p class="text-gray-400 text-sm">Rating</p>
              </div>
            </div>
          </div>

          <!-- Circle Icons -->
          <div class="absolute top-1/4 right-1/4 w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 flex items-center justify-center animate-float-7">
            <mat-icon class="text-cyan-400 text-3xl">speed</mat-icon>
          </div>

          <div class="absolute bottom-1/4 left-1/4 w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 flex items-center justify-center animate-float-8">
            <mat-icon class="text-yellow-400 text-2xl">emoji_events</mat-icon>
          </div>

          <div class="absolute top-1/3 left-1/3 w-14 h-14 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 flex items-center justify-center animate-float-9">
            <mat-icon class="text-green-400 text-2xl">verified</mat-icon>
          </div>
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
            <button mat-raised-button color="accent" (click)="login()" class="!rounded-full !px-10 !py-4 text-lg hover:scale-105 transition-transform !font-semibold">
              <mat-icon>login</mat-icon>
              Iniciar Sesión
            </button>
          </div>
        </div>
      </section>

      <section class="py-24 px-6 relative">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-4xl font-bold text-white mb-4">Todo lo que necesitas para ganar</h2>
            <p class="text-slate-400 text-lg">Herramientas diseñadas para vendedores y supervisores</p>
          </div>

          <div class="grid md:grid-cols-3 gap-8">
            <div class="group bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-cyan-400/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-cyan-400/10">
              <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <mat-icon class="text-white text-3xl">trending_up</mat-icon>
              </div>
              <h3 class="text-xl font-semibold text-white mb-3">KPIs en Tiempo Real</h3>
              <p class="text-slate-400">Visualiza cumplimiento de metas, ticket promedio y proyección de ventas al instante.</p>
            </div>

            <div class="group bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-cyan-400/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-cyan-400/10">
              <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <mat-icon class="text-white text-3xl">groups</mat-icon>
              </div>
              <h3 class="text-xl font-semibold text-white mb-3">Gestión de Equipo</h3>
              <p class="text-slate-400">Supervisores pueden gestionar vendedores, asignar metas y monitorear avances.</p>
            </div>

            <div class="group bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-cyan-400/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-cyan-400/10">
              <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <mat-icon class="text-white text-3xl">assessment</mat-icon>
              </div>
              <h3 class="text-xl font-semibold text-white mb-3">Reportes Detallados</h3>
              <p class="text-slate-400">Exporta reportes completos de rendimiento por vendedor o equipo completo.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="py-24 px-6 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 relative overflow-hidden">
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
                <div class="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center">
                  <mat-icon class="text-white text-2xl">check_circle</mat-icon>
                </div>
                <div>
                  <p class="text-white font-semibold text-lg">Cumplimiento de Meta</p>
                  <p class="text-4xl font-bold text-green-400">85%</p>
                </div>
              </div>
              <div class="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
                <div class="bg-gradient-to-r from-green-400 to-cyan-400 h-full rounded-full transition-all duration-1000" style="width: 85%"></div>
              </div>
              <p class="text-slate-400 text-sm mt-3">17/20 ventas completadas del mes</p>
            </div>
          </div>
        </div>
      </section>

      <section class="py-24 px-6 relative overflow-hidden">
        <div class="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div class="order-2 md:order-1 relative">
            <div class="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-3xl blur-xl opacity-30"></div>
            <div class="relative bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <h4 class="text-white font-semibold text-lg mb-6">Ranking del Equipo</h4>
              <div class="space-y-4">
                <div class="flex items-center justify-between p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                  <div class="flex items-center gap-3">
                    <span class="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-sm font-bold text-slate-900">1</span>
                    <span class="text-white font-medium">María García</span>
                  </div>
                  <span class="text-green-400 font-bold text-lg">92%</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-gray-500/10 rounded-xl border border-gray-500/20">
                  <div class="flex items-center gap-3">
                    <span class="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-sm font-bold text-slate-900">2</span>
                    <span class="text-white font-medium">Carlos López</span>
                  </div>
                  <span class="text-cyan-400 font-bold text-lg">78%</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-gray-500/10 rounded-xl border border-gray-500/20">
                  <div class="flex items-center gap-3">
                    <span class="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-sm font-bold text-white">3</span>
                    <span class="text-white font-medium">Ana Martínez</span>
                  </div>
                  <span class="text-orange-400 font-bold text-lg">65%</span>
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

      <section class="py-24 px-6 text-center relative">
        <div class="max-w-3xl mx-auto relative z-10">
          <h2 class="text-4xl font-bold text-white mb-6">¿Listo para empezar?</h2>
          <p class="text-slate-400 text-lg mb-10">Únete a cientos de equipos que ya están mejorando su rendimiento con KPIPro.</p>
          <button mat-raised-button color="accent" (click)="login()" class="!rounded-full !px-12 !py-4 text-lg hover:scale-105 transition-transform !font-semibold">
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
  `,
  styles: [`
    @keyframes float-1 {
      0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
      25% { transform: translateY(-15px) translateX(5px) rotate(2deg); }
      50% { transform: translateY(-25px) translateX(-5px) rotate(-1deg); }
      75% { transform: translateY(-10px) translateX(8px) rotate(1deg); }
    }
    @keyframes float-2 {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      33% { transform: translateY(-20px) rotate(-3deg); }
      66% { transform: translateY(-12px) rotate(2deg); }
    }
    @keyframes float-3 {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-18px) rotate(3deg); }
    }
    @keyframes float-4 {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-22px); }
    }
    @keyframes float-5 {
      0%, 100% { transform: translateY(0px) translateX(0px); }
      50% { transform: translateY(-15px) translateX(10px); }
    }
    @keyframes float-6 {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      33% { transform: translateY(-18px) rotate(-2deg); }
      66% { transform: translateY(-8px) rotate(2deg); }
    }
    @keyframes float-7 {
      0%, 100% { transform: translateY(0px) scale(1); }
      50% { transform: translateY(-20px) scale(1.1); }
    }
    @keyframes float-8 {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-15px) rotate(10deg); }
    }
    @keyframes float-9 {
      0%, 100% { transform: translateY(0px) scale(1); }
      50% { transform: translateY(-12px) scale(0.95); }
    }
    .animate-float-1 { animation: float-1 7s ease-in-out infinite; }
    .animate-float-2 { animation: float-2 6s ease-in-out infinite 0.5s; }
    .animate-float-3 { animation: float-3 8s ease-in-out infinite 1s; }
    .animate-float-4 { animation: float-4 5s ease-in-out infinite 1.5s; }
    .animate-float-5 { animation: float-5 7s ease-in-out infinite 2s; }
    .animate-float-6 { animation: float-6 6s ease-in-out infinite 2.5s; }
    .animate-float-7 { animation: float-7 4s ease-in-out infinite 3s; }
    .animate-float-8 { animation: float-8 5s ease-in-out infinite 3.5s; }
    .animate-float-9 { animation: float-9 6s ease-in-out infinite 4s; }
  `]
})
export class HomeComponent {
  constructor(private auth: AuthService) {}

  login(): void {
    this.auth.login();
  }
}
