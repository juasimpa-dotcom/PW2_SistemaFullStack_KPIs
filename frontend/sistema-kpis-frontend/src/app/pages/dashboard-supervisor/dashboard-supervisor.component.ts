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
import { FormsModule } from '@angular/forms';
import { ApiService, KpiVendedor, RankingVendedor, ServicioVendido, ResumenEquipo, Usuario } from '../../core/services/api.service';

@Component({
  selector: 'app-dashboard-supervisor',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatSelectModule, MatFormFieldModule, MatDatepickerModule, MatInputModule, MatButtonModule, MatProgressBarModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-100 p-6">
      <div class="max-w-7xl mx-auto">
        <div class="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">Panel de Supervisor</h1>
            <p class="text-gray-500">Gestión y seguimiento del equipo</p>
          </div>
          <div class="flex gap-3 items-center flex-wrap">
            <mat-form-field appearance="outline" class="!mb-0">
              <mat-label>Vendedor</mat-label>
              <mat-select [(ngModel)]="vendedorSeleccionado" (selectionChange)="cargarKpisVendedor()">
                <mat-option [value]="null">Todos</mat-option>
                @for (v of vendedores; track v.id) {
                  <mat-option [value]="v.id">{{ v.nombreCompleto }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="!mb-0">
              <mat-label>Fecha Inicio</mat-label>
              <input matInput [matDatepicker]="picker1" [(ngModel)]="fechaInicio" (dateChange)="cargarDatos()">
              <mat-datepicker-toggle matIconSuffix [for]="picker1"></mat-datepicker-toggle>
              <mat-datepicker #picker1></mat-datepicker>
            </mat-form-field>
            <mat-form-field appearance="outline" class="!mb-0">
              <mat-label>Fecha Fin</mat-label>
              <input matInput [matDatepicker]="picker2" [(ngModel)]="fechaFin" (dateChange)="cargarDatos()">
              <mat-datepicker-toggle matIconSuffix [for]="picker2"></mat-datepicker-toggle>
              <mat-datepicker #picker2></mat-datepicker>
            </mat-form-field>
          </div>
        </div>

        @if (resumen) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <mat-card class="!rounded-2xl !shadow-lg hover:shadow-xl transition-shadow">
              <mat-card-content class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                    <mat-icon class="text-white">account_balance_wallet</mat-icon>
                  </div>
                </div>
                <p class="text-sm text-gray-500 mb-1">Ingresos Totales</p>
                <p class="text-2xl font-bold text-gray-800">{{ resumen.ingresoTotal | currency:'USD':'symbol':'1.0-0' }}</p>
                <p class="text-xs text-gray-400 mt-1">{{ resumen.cantidadVentas }} ventas</p>
              </mat-card-content>
            </mat-card>

            <mat-card class="!rounded-2xl !shadow-lg hover:shadow-xl transition-shadow">
              <mat-card-content class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                    <mat-icon class="text-white">groups</mat-icon>
                  </div>
                </div>
                <p class="text-sm text-gray-500 mb-1">Vendedores Activos</p>
                <p class="text-2xl font-bold text-gray-800">{{ resumen.totalVendedores }}</p>
                <p class="text-xs text-gray-400 mt-1">Promedio: {{ resumen.promedioAvance | number:'1.0-0' }}%</p>
              </mat-card-content>
            </mat-card>

            <mat-card class="!rounded-2xl !shadow-lg hover:shadow-xl transition-shadow">
              <mat-card-content class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                    <mat-icon class="text-white">payments</mat-icon>
                  </div>
                </div>
                <p class="text-sm text-gray-500 mb-1">Ticket Promedio</p>
                <p class="text-2xl font-bold text-gray-800">{{ resumen.ticketPromedio | currency:'USD':'symbol':'1.0-0' }}</p>
                <p class="text-xs text-gray-400 mt-1">{{ resumen.cantidadServicios }} servicios</p>
              </mat-card-content>
            </mat-card>

            <mat-card class="!rounded-2xl !shadow-lg hover:shadow-xl transition-shadow">
              <mat-card-content class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                    <mat-icon class="text-white">flag</mat-icon>
                  </div>
                </div>
                <p class="text-sm text-gray-500 mb-1">Meta Total</p>
                <p class="text-2xl font-bold text-gray-800">{{ resumen.metaTotal | currency:'USD':'symbol':'1.0-0' }}</p>
                <p class="text-xs text-gray-400 mt-1">{{ (resumen.ingresoTotal / resumen.metaTotal * 100) | number:'1.0-0' }}% alcanzado</p>
              </mat-card-content>
            </mat-card>
          </div>
        }

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <mat-card class="!rounded-2xl !shadow-lg">
            <mat-card-content class="p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <mat-icon class="text-yellow-500">emoji_events</mat-icon>
                Ranking de Equipo
              </h3>
              @if (ranking.length > 0) {
                <div class="space-y-3">
                  @for (item of ranking; track item.vendedorId; let i = $index) {
                    <div class="flex items-center gap-4 p-3 rounded-xl" [class]="getRankingClass(i)">
                      <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" [class]="getMedalClass(i)">
                        {{ i + 1 }}
                      </div>
                      <div class="flex-1">
                        <div class="flex justify-between items-center">
                          <span class="font-medium text-gray-800">{{ item.nombreVendedor }}</span>
                          <span class="font-bold" [class]="getPorcentajeClass(item.porcentajeAvance)">
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
                <p class="text-center text-gray-500 py-4">No hay datos de ranking</p>
              }
            </mat-card-content>
          </mat-card>

          <mat-card class="!rounded-2xl !shadow-lg">
            <mat-card-content class="p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <mat-icon class="text-red-500">warning</mat-icon>
                Vendedores en Riesgo
              </h3>
              @if (enRiesgo.length > 0) {
                <div class="space-y-3">
                  @for (item of enRiesgo; track item.vendedorId) {
                    <div class="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-200">
                      <div class="flex items-center gap-3">
                        <mat-icon class="text-red-500">trending_down</mat-icon>
                        <span class="font-medium text-gray-800">{{ item.nombreVendedor }}</span>
                      </div>
                      <span class="font-bold text-red-600">{{ item.porcentajeAvance | number:'1.0-0' }}%</span>
                    </div>
                  }
                </div>
              } @else {
                <div class="text-center py-8">
                  <mat-icon class="text-green-500 text-5xl mb-2">check_circle</mat-icon>
                  <p class="text-green-600 font-medium">Ningún vendedor en riesgo!</p>
                  <p class="text-gray-500 text-sm">Todos están por encima del 50%</p>
                </div>
              }
            </mat-card-content>
          </mat-card>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <mat-card class="!rounded-2xl !shadow-lg">
            <mat-card-content class="p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <mat-icon class="text-cyan-500">shopping_cart</mat-icon>
                Servicios Más Vendidos
              </h3>
              @if (servicios.length > 0) {
                <div class="space-y-3">
                  @for (item of servicios; track item.nombreServicio; let i = $index) {
                    <div class="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                      <div class="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 font-bold text-sm">
                        {{ i + 1 }}
                      </div>
                      <div class="flex-1">
                        <p class="font-medium text-gray-800">{{ item.nombreServicio }}</p>
                        <p class="text-sm text-gray-500">{{ item.cantidadVendida }} unidades</p>
                      </div>
                      <p class="font-bold text-gray-800">{{ item.totalVendido | currency }}</p>
                    </div>
                  }
                </div>
              } @else {
                <p class="text-center text-gray-500 py-4">No hay servicios vendidos</p>
              }
            </mat-card-content>
          </mat-card>

          @if (kpiVendedor) {
            <mat-card class="!rounded-2xl !shadow-lg">
              <mat-card-content class="p-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <mat-icon class="text-blue-500">person</mat-icon>
                  Detalle: {{ getNombreVendedor() }}
                </h3>
                <div class="grid grid-cols-2 gap-4">
                  <div class="p-4 bg-gray-50 rounded-xl text-center">
                    <p class="text-3xl font-bold text-green-600">{{ kpiVendedor.porcentajeCumplimiento | number:'1.0-0' }}%</p>
                    <p class="text-sm text-gray-500">Cumplimiento</p>
                  </div>
                  <div class="p-4 bg-gray-50 rounded-xl text-center">
                    <p class="text-3xl font-bold text-blue-600">{{ kpiVendedor.proyeccionCierre | currency:'USD':'symbol':'1.0-0' }}</p>
                    <p class="text-sm text-gray-500">Proyección</p>
                  </div>
                  <div class="p-4 bg-gray-50 rounded-xl text-center">
                    <p class="text-3xl font-bold text-purple-600">{{ kpiVendedor.ticketPromedio | currency }}</p>
                    <p class="text-sm text-gray-500">Ticket Promedio</p>
                  </div>
                  <div class="p-4 bg-gray-50 rounded-xl text-center">
                    <p class="text-3xl font-bold text-amber-600">{{ kpiVendedor.ritmoAvance | number:'1.0-1' }}%</p>
                    <p class="text-sm text-gray-500">Ritmo/día</p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>
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

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getVendedores().subscribe({ next: (data) => this.vendedores = data });
    this.cargarDatos();
  }

  cargarDatos(): void {
    const fi = this.fechaInicio.toISOString();
    const ff = this.fechaFin.toISOString();

    this.api.getResumenEquipo(fi, ff).subscribe({ next: (data) => this.resumen = data });
    this.api.getRankingEquipo(fi, ff).subscribe({ next: (data) => this.ranking = data });
    this.api.getVendedoresEnRiesgo(fi, ff).subscribe({ next: (data) => this.enRiesgo = data });
    this.api.getServiciosMasVendidos(fi, ff).subscribe({ next: (data) => this.servicios = data });

    if (this.vendedorSeleccionado) this.cargarKpisVendedor();
  }

  cargarKpisVendedor(): void {
    if (this.vendedorSeleccionado) {
      const fi = this.fechaInicio.toISOString();
      const ff = this.fechaFin.toISOString();
      this.api.getKpisVendedorPorId(this.vendedorSeleccionado, fi, ff).subscribe({ next: (data) => this.kpiVendedor = data });
    } else {
      this.kpiVendedor = null;
    }
  }

  getNombreVendedor(): string {
    return this.vendedores.find(v => v.id === this.vendedorSeleccionado)?.nombreCompleto || '';
  }

  getRankingClass(i: number): string {
    return i === 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50';
  }

  getMedalClass(i: number): string {
    if (i === 0) return 'bg-yellow-400 text-yellow-900';
    if (i === 1) return 'bg-gray-300 text-gray-700';
    if (i === 2) return 'bg-orange-400 text-orange-900';
    return 'bg-gray-200 text-gray-600';
  }

  getPorcentajeClass(valor: number): string {
    if (valor >= 100) return 'text-green-600';
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
