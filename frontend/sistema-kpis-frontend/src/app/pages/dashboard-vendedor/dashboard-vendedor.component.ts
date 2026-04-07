import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ApiService, KpiVendedor, Venta } from '../../core/services/api.service';

@Component({
  selector: 'app-dashboard-vendedor',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatProgressBarModule, MatFormFieldModule, MatInputModule, FormsModule, MatDatepickerModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 p-4 md:p-6">
      <div class="max-w-7xl mx-auto">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 class="text-2xl md:text-3xl font-bold text-slate-800">Mi Dashboard</h1>
            <p class="text-slate-500 text-sm">Seguimiento de ventas y metas</p>
          </div>
          <div class="flex flex-wrap gap-2 w-full md:w-auto">
            <mat-form-field appearance="outline" class="!mb-0 !h-14 w-full sm:w-auto min-w-[140px]">
              <mat-label class="text-xs">Inicio</mat-label>
              <input matInput [matDatepicker]="picker1" [(ngModel)]="fechaInicio" (dateChange)="cargarDatos()" class="text-sm">
              <mat-datepicker-toggle matIconSuffix [for]="picker1"></mat-datepicker-toggle>
              <mat-datepicker #picker1></mat-datepicker>
            </mat-form-field>
            <mat-form-field appearance="outline" class="!mb-0 !h-14 w-full sm:w-auto min-w-[140px]">
              <mat-label class="text-xs">Fin</mat-label>
              <input matInput [matDatepicker]="picker2" [(ngModel)]="fechaFin" (dateChange)="cargarDatos()" class="text-sm">
              <mat-datepicker-toggle matIconSuffix [for]="picker2"></mat-datepicker-toggle>
              <mat-datepicker #picker2></mat-datepicker>
            </mat-form-field>
          </div>
        </div>

        @if (kpi) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
            <mat-card class="!rounded-2xl !shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <mat-card-content class="p-4 md:p-6">
                <div class="flex items-center justify-between mb-3">
                  <div class="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <mat-icon class="text-white text-lg md:text-xl">trending_up</mat-icon>
                  </div>
                  <span class="text-xs font-semibold px-2 py-1 rounded-full" [class]="getColorClass(kpi.porcentajeCumplimiento)">
                    {{ kpi.porcentajeCumplimiento | number:'1.0-0' }}%
                  </span>
                </div>
                <p class="text-xs md:text-sm text-slate-500 mb-1">Cumplimiento de Meta</p>
                <p class="text-xl md:text-2xl font-bold text-slate-800">{{ kpi.ingresoTotal | currency:'USD':'symbol':'1.0-0' }}</p>
                <p class="text-xs text-slate-400 mt-1">Meta: {{ kpi.metaMonetaria | currency:'USD':'symbol':'1.0-0' }}</p>
                <mat-progress-bar mode="determinate" [value]="Math.min(kpi.porcentajeCumplimiento, 100)" 
                  [color]="kpi.porcentajeCumplimiento >= 100 ? 'primary' : 'accent'" class="!rounded-full !h-2 !mt-3"></mat-progress-bar>
              </mat-card-content>
            </mat-card>

            <mat-card class="!rounded-2xl !shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <mat-card-content class="p-4 md:p-6">
                <div class="flex items-center justify-between mb-3">
                  <div class="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <mat-icon class="text-white text-lg md:text-xl">payments</mat-icon>
                  </div>
                </div>
                <p class="text-xs md:text-sm text-slate-500 mb-1">Ticket Promedio</p>
                <p class="text-xl md:text-2xl font-bold text-slate-800">{{ kpi.ticketPromedio | currency:'USD':'symbol':'1.0-0' }}</p>
                <p class="text-xs text-slate-400 mt-1">{{ kpi.cantidadVentas }} ventas registradas</p>
              </mat-card-content>
            </mat-card>

            <mat-card class="!rounded-2xl !shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <mat-card-content class="p-4 md:p-6">
                <div class="flex items-center justify-between mb-3">
                  <div class="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-violet-400 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                    <mat-icon class="text-white text-lg md:text-xl">inventory_2</mat-icon>
                  </div>
                </div>
                <p class="text-xs md:text-sm text-slate-500 mb-1">Unidades Vendidas</p>
                <p class="text-xl md:text-2xl font-bold text-slate-800">{{ kpi.cantidadServicios }}</p>
                <p class="text-xs text-slate-400 mt-1">Meta: {{ kpi.metaCantidad }} unidades</p>
                <mat-progress-bar mode="determinate" [value]="Math.min(kpi.porcentajeUnidades, 100)" color="primary" class="!rounded-full !h-2 !mt-3"></mat-progress-bar>
              </mat-card-content>
            </mat-card>

            <mat-card class="!rounded-2xl !shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <mat-card-content class="p-4 md:p-6">
                <div class="flex items-center justify-between mb-3">
                  <div class="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <mat-icon class="text-white text-lg md:text-xl">speed</mat-icon>
                  </div>
                </div>
                <p class="text-xs md:text-sm text-slate-500 mb-1">Ritmo de Avance</p>
                <p class="text-xl md:text-2xl font-bold text-slate-800">{{ kpi.ritmoAvance | number:'1.1-1' }}%</p>
                <p class="text-xs text-slate-400 mt-1">Día {{ kpi.diasTranscurridos }} de {{ kpi.diasTotales }}</p>
              </mat-card-content>
            </mat-card>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
            <mat-card class="!rounded-2xl !shadow-lg">
              <mat-card-content class="p-4 md:p-6">
                <h3 class="text-base md:text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <mat-icon class="text-cyan-500">insights</mat-icon>
                  Proyección al Cierre
                </h3>
                <div class="flex items-center justify-center py-4 md:py-6">
                  <div class="text-center">
                    <p class="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
                      {{ kpi.proyeccionCierre | currency:'USD':'symbol':'1.0-0' }}
                    </p>
                    <p class="text-slate-500 text-sm mt-2">Proyección basada en {{ kpi.diasTranscurridos }} días</p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="!rounded-2xl !shadow-lg">
              <mat-card-content class="p-4 md:p-6">
                <h3 class="text-base md:text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <mat-icon class="text-emerald-500">timeline</mat-icon>
                  Resumen del Periodo
                </h3>
                <div class="space-y-3">
                  <div class="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                    <span class="text-slate-600 text-sm">Ingresos Totales</span>
                    <span class="font-bold text-slate-800">{{ kpi.ingresoTotal | currency }}</span>
                  </div>
                  <div class="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                    <span class="text-slate-600 text-sm">Cantidad de Ventas</span>
                    <span class="font-bold text-slate-800">{{ kpi.cantidadVentas }}</span>
                  </div>
                  <div class="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                    <span class="text-slate-600 text-sm">Servicios Vendidos</span>
                    <span class="font-bold text-slate-800">{{ kpi.cantidadServicios }}</span>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>

          <mat-card class="!rounded-2xl !shadow-lg">
            <mat-card-content class="p-4 md:p-6">
              <h3 class="text-base md:text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <mat-icon class="text-violet-500">history</mat-icon>
                Mis Ventas Recientes
              </h3>
              @if (ventas.length > 0) {
                <div class="overflow-x-auto -mx-4 md:mx-0">
                  <table class="w-full min-w-[600px]">
                    <thead>
                      <tr class="text-left text-slate-500 text-xs md:text-sm border-b border-slate-200">
                        <th class="pb-3 px-4">ID</th>
                        <th class="pb-3 px-4">Cliente</th>
                        <th class="pb-3 px-4">Monto</th>
                        <th class="pb-3 px-4">Unidades</th>
                        <th class="pb-3 px-4">Fecha</th>
                        <th class="pb-3 px-4">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (venta of ventas.slice(0, 5); track venta.id) {
                        <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td class="py-3 px-4 text-slate-600 text-sm">#{{ venta.id }}</td>
                          <td class="py-3 px-4 text-slate-800 font-medium text-sm">{{ venta.cliente }}</td>
                          <td class="py-3 px-4 font-semibold text-slate-800 text-sm">{{ venta.monto | currency }}</td>
                          <td class="py-3 px-4 text-slate-600 text-sm">{{ venta.unidades }}</td>
                          <td class="py-3 px-4 text-slate-600 text-sm">{{ venta.fecha | date:'dd/MM/yy' }}</td>
                          <td class="py-3 px-4">
                            <span class="px-2 py-1 text-xs font-medium rounded-full" [class]="getEstadoClass(venta.estado)">
                              {{ venta.estado }}
                            </span>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              } @else {
                <div class="text-center py-8 text-slate-400">
                  <mat-icon class="text-5xl mb-2">inventory_2</mat-icon>
                  <p class="text-sm">No hay ventas registradas en este periodo</p>
                </div>
              }
            </mat-card-content>
          </mat-card>
        } @else {
          <div class="flex flex-col justify-center items-center py-16 md:py-20">
            <mat-icon class="text-slate-300 text-5xl md:text-6xl animate-pulse">analytics</mat-icon>
            <p class="text-slate-400 mt-4 text-sm">Cargando datos...</p>
          </div>
        }
      </div>
    </div>
  `
})
export class DashboardVendedorComponent implements OnInit {
  kpi: KpiVendedor | null = null;
  ventas: Venta[] = [];
  fechaInicio: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  fechaFin: Date = new Date();
  Math = Math;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    const fi = this.fechaInicio.toISOString();
    const ff = this.fechaFin.toISOString();
    
    this.api.getKpisVendedor(fi, ff).subscribe({
      next: (data) => this.kpi = data,
      error: (err) => console.error('Error KPIs:', err)
    });

    this.api.getMisVentas(fi, ff).subscribe({
      next: (data) => this.ventas = data,
      error: (err) => console.error('Error ventas:', err)
    });
  }

  getColorClass(valor: number): string {
    if (valor >= 100) return 'text-emerald-600 bg-emerald-100';
    if (valor >= 75) return 'text-blue-600 bg-blue-100';
    if (valor >= 50) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  }

  getEstadoClass(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'completada': return 'bg-emerald-100 text-emerald-700';
      case 'pendiente': return 'bg-amber-100 text-amber-700';
      case 'cancelada': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }
}
