import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { ApiService, KpiVendedor, RankingVendedor, ServicioVendido, ResumenEquipo, Usuario } from '../../core/services/api.service';

@Component({
  selector: 'app-dashboard-supervisor',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatSelectModule, MatFormFieldModule, MatDatepickerModule, MatInputModule, MatButtonModule, MatProgressBarModule, FormsModule, MatSnackBarModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 p-4 md:p-6">
      <div class="max-w-7xl mx-auto">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 class="text-2xl md:text-3xl font-bold text-slate-800">Panel de Supervisor</h1>
            <p class="text-slate-500 text-sm">Gestión y seguimiento del equipo</p>
          </div>
          <div class="flex flex-wrap gap-2 w-full md:w-auto">
            <mat-form-field appearance="outline" class="!mb-0 !h-14 w-full sm:w-auto min-w-[120px]">
              <mat-label class="text-xs">Vendedor</mat-label>
              <mat-select [(ngModel)]="vendedorSeleccionado" (selectionChange)="cargarKpisVendedor()">
                <mat-option [value]="null">Todos</mat-option>
                @for (v of vendedores; track v.id) {
                  <mat-option [value]="v.id">{{ v.nombreCompleto }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="!mb-0 !h-14 w-full sm:w-auto min-w-[120px]">
              <mat-label class="text-xs">Inicio</mat-label>
              <input matInput [matDatepicker]="picker1" [(ngModel)]="fechaInicio" (dateChange)="cargarDatos()" class="text-sm">
              <mat-datepicker-toggle matIconSuffix [for]="picker1"></mat-datepicker-toggle>
              <mat-datepicker #picker1></mat-datepicker>
            </mat-form-field>
            <mat-form-field appearance="outline" class="!mb-0 !h-14 w-full sm:w-auto min-w-[120px]">
              <mat-label class="text-xs">Fin</mat-label>
              <input matInput [matDatepicker]="picker2" [(ngModel)]="fechaFin" (dateChange)="cargarDatos()" class="text-sm">
              <mat-datepicker-toggle matIconSuffix [for]="picker2"></mat-datepicker-toggle>
              <mat-datepicker #picker2></mat-datepicker>
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="exportarReporte()" class="!rounded-lg h-14 !px-3">
              <mat-icon class="text-lg">download</mat-icon>
              <span class="hidden sm:inline">Exportar</span>
            </button>
          </div>
        </div>

        @if (error) {
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
            <mat-icon class="text-red-500">error</mat-icon>
            {{ error }}
          </div>
        }

        @if (loading) {
          <div class="flex justify-center items-center py-16 md:py-20">
            <mat-icon class="animate-spin text-slate-400 text-5xl md:text-6xl">sync</mat-icon>
          </div>
        } @else {
          @if (resumen) {
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
              <mat-card class="!rounded-2xl !shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <mat-card-content class="p-4 md:p-6">
                  <div class="flex items-center justify-between mb-3">
                    <div class="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <mat-icon class="text-white text-lg md:text-xl">account_balance_wallet</mat-icon>
                    </div>
                  </div>
                  <p class="text-xs md:text-sm text-slate-500 mb-1">Ingresos Totales</p>
                  <p class="text-xl md:text-2xl font-bold text-slate-800">{{ resumen.ingresoTotal | currency:'USD':'symbol':'1.0-0' }}</p>
                  <p class="text-xs text-slate-400 mt-1">{{ resumen.cantidadVentas }} ventas</p>
                </mat-card-content>
              </mat-card>

              <mat-card class="!rounded-2xl !shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <mat-card-content class="p-4 md:p-6">
                  <div class="flex items-center justify-between mb-3">
                    <div class="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <mat-icon class="text-white text-lg md:text-xl">groups</mat-icon>
                    </div>
                  </div>
                  <p class="text-xs md:text-sm text-slate-500 mb-1">Vendedores Activos</p>
                  <p class="text-xl md:text-2xl font-bold text-slate-800">{{ resumen.totalVendedores }}</p>
                  <p class="text-xs text-slate-400 mt-1">Promedio: {{ resumen.promedioAvance | number:'1.0-0' }}%</p>
                </mat-card-content>
              </mat-card>

              <mat-card class="!rounded-2xl !shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <mat-card-content class="p-4 md:p-6">
                  <div class="flex items-center justify-between mb-3">
                    <div class="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-violet-400 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                      <mat-icon class="text-white text-lg md:text-xl">payments</mat-icon>
                    </div>
                  </div>
                  <p class="text-xs md:text-sm text-slate-500 mb-1">Ticket Promedio</p>
                  <p class="text-xl md:text-2xl font-bold text-slate-800">{{ resumen.ticketPromedio | currency:'USD':'symbol':'1.0-0' }}</p>
                  <p class="text-xs text-slate-400 mt-1">{{ resumen.cantidadServicios }} servicios</p>
                </mat-card-content>
              </mat-card>

              <mat-card class="!rounded-2xl !shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <mat-card-content class="p-4 md:p-6">
                  <div class="flex items-center justify-between mb-3">
                    <div class="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <mat-icon class="text-white text-lg md:text-xl">flag</mat-icon>
                    </div>
                  </div>
                  <p class="text-xs md:text-sm text-slate-500 mb-1">Meta Total</p>
                  <p class="text-xl md:text-2xl font-bold text-slate-800">{{ resumen.metaTotal | currency:'USD':'symbol':'1.0-0' }}</p>
                  <p class="text-xs text-slate-400 mt-1">{{ (resumen.ingresoTotal / resumen.metaTotal * 100) | number:'1.0-0' }}% alcanzado</p>
                </mat-card-content>
              </mat-card>
            </div>
          }

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
            <mat-card class="!rounded-2xl !shadow-lg">
              <mat-card-content class="p-4 md:p-6">
                <h3 class="text-base md:text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <mat-icon class="text-amber-500">emoji_events</mat-icon>
                  Ranking de Equipo
                </h3>
                @if (ranking.length > 0) {
                  <div class="space-y-3">
                    @for (item of ranking; track item.vendedorId; let i = $index) {
                      <div class="flex items-center gap-3 md:gap-4 p-3 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors" [class]="getRankingClass(i)" (click)="seleccionarVendedor(item.vendedorId)">
                        <div class="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-xs md:text-sm" [class]="getMedalClass(i)">
                          {{ i + 1 }}
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="flex justify-between items-center">
                            <span class="font-medium text-slate-800 text-sm md:text-base truncate">{{ item.nombreVendedor }}</span>
                            <span class="font-bold text-sm" [class]="getPorcentajeClass(item.porcentajeAvance)">
                              {{ item.porcentajeAvance | number:'1.0-0' }}%
                            </span>
                          </div>
                          <mat-progress-bar mode="determinate" [value]="Math.min(item.porcentajeAvance, 100)"
                            [color]="getProgressColor(item.porcentajeAvance)" class="!rounded-full !h-2 !mt-2"></mat-progress-bar>
                        </div>
                      </div>
                    }
                  </div>
                } @else {
                  <div class="text-center py-8">
                    <mat-icon class="text-slate-300 text-5xl mb-2">group_off</mat-icon>
                    <p class="text-slate-500">No hay datos de ranking</p>
                    <p class="text-sm text-slate-400">Crea vendedores y asigna metas para ver el ranking</p>
                  </div>
                }
              </mat-card-content>
            </mat-card>

            <mat-card class="!rounded-2xl !shadow-lg">
              <mat-card-content class="p-4 md:p-6">
                <h3 class="text-base md:text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <mat-icon class="text-red-500">warning</mat-icon>
                  Vendedores en Riesgo
                </h3>
                @if (enRiesgo.length > 0) {
                  <div class="space-y-3">
                    @for (item of enRiesgo; track item.vendedorId) {
                      <div class="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-200 cursor-pointer hover:bg-red-100 transition-colors" (click)="seleccionarVendedor(item.vendedorId)">
                        <div class="flex items-center gap-3">
                          <mat-icon class="text-red-500">trending_down</mat-icon>
                          <span class="font-medium text-slate-800 text-sm">{{ item.nombreVendedor }}</span>
                        </div>
                        <span class="font-bold text-red-600 text-sm">{{ item.porcentajeAvance | number:'1.0-0' }}%</span>
                      </div>
                    }
                  </div>
                } @else {
                  <div class="text-center py-8">
                    <mat-icon class="text-emerald-500 text-5xl mb-2">check_circle</mat-icon>
                    <p class="text-emerald-600 font-medium">Ningún vendedor en riesgo!</p>
                    <p class="text-slate-500 text-sm">Todos están por encima del 50%</p>
                  </div>
                }
              </mat-card-content>
            </mat-card>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <mat-card class="!rounded-2xl !shadow-lg">
              <mat-card-content class="p-4 md:p-6">
                <h3 class="text-base md:text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <mat-icon class="text-cyan-500">shopping_cart</mat-icon>
                  Servicios Más Vendidos
                </h3>
                @if (servicios.length > 0) {
                  <div class="space-y-3">
                    @for (item of servicios; track item.nombreServicio; let i = $index) {
                      <div class="flex items-center gap-3 md:gap-4 p-3 bg-slate-50 rounded-xl">
                        <div class="w-7 h-7 md:w-8 md:h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 font-bold text-xs md:text-sm">
                          {{ i + 1 }}
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="font-medium text-slate-800 text-sm truncate">{{ item.nombreServicio }}</p>
                          <p class="text-xs md:text-sm text-slate-500">{{ item.cantidadVendida }} unidades</p>
                        </div>
                        <p class="font-bold text-slate-800 text-sm">{{ item.totalVendido | currency }}</p>
                      </div>
                    }
                  </div>
                } @else {
                  <div class="text-center py-8">
                    <mat-icon class="text-slate-300 text-5xl mb-2">inventory_2</mat-icon>
                    <p class="text-slate-500">No hay servicios vendidos</p>
                    <p class="text-sm text-slate-400">Registra ventas para ver los servicios más vendidos</p>
                  </div>
                }
              </mat-card-content>
            </mat-card>

            @if (kpiVendedor) {
              <mat-card class="!rounded-2xl !shadow-lg">
                <mat-card-content class="p-4 md:p-6">
                  <h3 class="text-base md:text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <mat-icon class="text-blue-500">person</mat-icon>
                    Detalle: {{ getNombreVendedor() }}
                  </h3>
                  <div class="grid grid-cols-2 gap-3 md:gap-4">
                    <div class="p-3 md:p-4 bg-slate-50 rounded-xl text-center">
                      <p class="text-2xl md:text-3xl font-bold text-emerald-600">{{ kpiVendedor.porcentajeCumplimiento | number:'1.0-0' }}%</p>
                      <p class="text-xs md:text-sm text-slate-500">Cumplimiento</p>
                    </div>
                    <div class="p-3 md:p-4 bg-slate-50 rounded-xl text-center">
                      <p class="text-xl md:text-2xl font-bold text-blue-600">{{ kpiVendedor.proyeccionCierre | currency:'USD':'symbol':'1.0-0' }}</p>
                      <p class="text-xs md:text-sm text-slate-500">Proyección</p>
                    </div>
                    <div class="p-3 md:p-4 bg-slate-50 rounded-xl text-center">
                      <p class="text-2xl md:text-3xl font-bold text-violet-600">{{ kpiVendedor.ticketPromedio | currency }}</p>
                      <p class="text-xs md:text-sm text-slate-500">Ticket Promedio</p>
                    </div>
                    <div class="p-3 md:p-4 bg-slate-50 rounded-xl text-center">
                      <p class="text-2xl md:text-3xl font-bold text-amber-600">{{ kpiVendedor.ritmoAvance | number:'1.1-1' }}%</p>
                      <p class="text-xs md:text-sm text-slate-500">Ritmo/día</p>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            } @else if (vendedorSeleccionado) {
              <mat-card class="!rounded-2xl !shadow-lg">
                <mat-card-content class="p-4 md:p-6">
                  <h3 class="text-base md:text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <mat-icon class="text-blue-500">person</mat-icon>
                    Selecciona un vendedor
                  </h3>
                  <p class="text-slate-500 text-center py-4 text-sm">Selecciona un vendedor del ranking o de la lista para ver sus KPIs detallados</p>
                </mat-card-content>
              </mat-card>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class DashboardSupervisorComponent implements OnInit {
  vendedores: Usuario[] = [];
  vendedorSeleccionado: number | null = null;
  ranking: RankingVendedor[] = [];
  enRiesgo: RankingVendedor[] = [];
  servicios: ServicioVendido[] = [];
  resumen: ResumenEquipo | null = null;
  kpiVendedor: KpiVendedor | null = null;
  fechaInicio: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  fechaFin: Date = new Date();
  Math = Math;
  loading = false;
  error = '';

  constructor(private api: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;
    this.error = '';
    const fi = this.fechaInicio.toISOString();
    const ff = this.fechaFin.toISOString();

    this.api.getVendedores().subscribe({
      next: (data) => this.vendedores = data,
      error: (err) => console.error('Error vendedores:', err)
    });

    this.api.getResumenEquipo(fi, ff).subscribe({
      next: (data) => { this.resumen = data; this.loading = false; },
      error: (err) => { this.loading = false; this.error = 'Error al cargar resumen'; console.error(err); }
    });

    this.api.getRankingEquipo(fi, ff).subscribe({
      next: (data) => this.ranking = data,
      error: (err) => console.error('Error ranking:', err)
    });

    this.api.getVendedoresEnRiesgo(fi, ff).subscribe({
      next: (data) => this.enRiesgo = data,
      error: (err) => console.error('Error en riesgo:', err)
    });

    this.api.getServiciosMasVendidos(fi, ff).subscribe({
      next: (data) => this.servicios = data,
      error: (err) => console.error('Error servicios:', err)
    });

    if (this.vendedorSeleccionado) this.cargarKpisVendedor();
  }

  seleccionarVendedor(vendedorId: number): void {
    this.vendedorSeleccionado = vendedorId;
    this.cargarKpisVendedor();
  }

  cargarKpisVendedor(): void {
    if (this.vendedorSeleccionado) {
      const fi = this.fechaInicio.toISOString();
      const ff = this.fechaFin.toISOString();
      this.api.getKpisVendedorPorId(this.vendedorSeleccionado, fi, ff).subscribe({
        next: (data) => this.kpiVendedor = data,
        error: (err) => console.error('Error KPIs:', err)
      });
    } else {
      this.kpiVendedor = null;
    }
  }

  exportarReporte(): void {
    const fi = this.fechaInicio.toISOString();
    const ff = this.fechaFin.toISOString();

    this.api.exportarReporte(fi, ff, this.vendedorSeleccionado || undefined).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_ventas_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open('Reporte exportado correctamente', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error exportar:', err);
        this.snackBar.open('Error al exportar reporte', 'Cerrar', { duration: 3000 });
      }
    });
  }

  getNombreVendedor(): string {
    return this.vendedores.find(v => v.id === this.vendedorSeleccionado)?.nombreCompleto || '';
  }

  getRankingClass(i: number): string {
    return i === 0 ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50';
  }

  getMedalClass(i: number): string {
    if (i === 0) return 'bg-amber-400 text-amber-900';
    if (i === 1) return 'bg-slate-300 text-slate-700';
    if (i === 2) return 'bg-orange-400 text-orange-900';
    return 'bg-slate-200 text-slate-600';
  }

  getPorcentajeClass(valor: number): string {
    if (valor >= 100) return 'text-emerald-600';
    if (valor >= 75) return 'text-blue-600';
    if (valor >= 50) return 'text-amber-600';
    return 'text-red-600';
  }

  getProgressColor(valor: number): 'primary' | 'accent' | 'warn' {
    if (valor >= 100) return 'primary';
    if (valor >= 50) return 'accent';
    return 'warn';
  }
}
