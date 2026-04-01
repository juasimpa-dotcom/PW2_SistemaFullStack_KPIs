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
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatProgressBarModule, MatFormFieldModule, MatInputModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-100 p-6">
      <div class="max-w-7xl mx-auto">
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">Mi Dashboard</h1>
            <p class="text-gray-500">Seguimiento de ventas y metas</p>
          </div>
          <div class="flex gap-3">
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

        @if (kpi) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <mat-card class="!rounded-2xl !shadow-lg hover:shadow-xl transition-shadow">
              <mat-card-content class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                    <mat-icon class="text-white">trending_up</mat-icon>
                  </div>
                  <span class="text-xs font-medium" [class]="getColorClass(kpi.porcentajeCumplimiento)">
                    {{ kpi.porcentajeCumplimiento | number:'1.0-0' }}%
                  </span>
                </div>
                <p class="text-sm text-gray-500 mb-1">Cumplimiento de Meta</p>
                <p class="text-2xl font-bold text-gray-800">{{ kpi.ingresoTotal | currency:'USD':'symbol':'1.0-0' }}</p>
                <p class="text-xs text-gray-400 mt-1">Meta: {{ kpi.metaMonetaria | currency:'USD':'symbol':'1.0-0' }}</p>
                <mat-progress-bar mode="determinate" [value]="Math.min(kpi.porcentajeCumplimiento, 100)" 
                  [color]="kpi.porcentajeCumplimiento >= 100 ? 'primary' : 'accent'" class="!rounded-full !h-2 !mt-3"></mat-progress-bar>
              </mat-card-content>
            </mat-card>

            <mat-card class="!rounded-2xl !shadow-lg hover:shadow-xl transition-shadow">
              <mat-card-content class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                    <mat-icon class="text-white">payments</mat-icon>
                  </div>
                </div>
                <p class="text-sm text-gray-500 mb-1">Ticket Promedio</p>
                <p class="text-2xl font-bold text-gray-800">{{ kpi.ticketPromedio | currency:'USD':'symbol':'1.0-0' }}</p>
                <p class="text-xs text-gray-400 mt-1">{{ kpi.cantidadVentas }} ventas registradas</p>
              </mat-card-content>
            </mat-card>

            <mat-card class="!rounded-2xl !shadow-lg hover:shadow-xl transition-shadow">
              <mat-card-content class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                    <mat-icon class="text-white">inventory</mat-icon>
                  </div>
                </div>
                <p class="text-sm text-gray-500 mb-1">Unidades Vendidas</p>
                <p class="text-2xl font-bold text-gray-800">{{ kpi.cantidadServicios }}</p>
                <p class="text-xs text-gray-400 mt-1">Meta: {{ kpi.metaCantidad }} unidades</p>
                <mat-progress-bar mode="determinate" [value]="Math.min(kpi.porcentajeUnidades, 100)" color="primary" class="!rounded-full !h-2 !mt-3"></mat-progress-bar>
              </mat-card-content>
            </mat-card>

            <mat-card class="!rounded-2xl !shadow-lg hover:shadow-xl transition-shadow">
              <mat-card-content class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                    <mat-icon class="text-white">speed</mat-icon>
                  </div>
                </div>
                <p class="text-sm text-gray-500 mb-1">Ritmo de Avance</p>
                <p class="text-2xl font-bold text-gray-800">{{ kpi.ritmoAvance | number:'1.1-1' }}%</p>
                <p class="text-xs text-gray-400 mt-1">Día {{ kpi.diasTranscurridos }} de {{ kpi.diasTotales }}</p>
              </mat-card-content>
            </mat-card>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <mat-card class="!rounded-2xl !shadow-lg">
              <mat-card-content class="p-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <mat-icon class="text-cyan-500">insights</mat-icon>
                  Proyección al Cierre
                </h3>
                <div class="flex items-center justify-center py-6">
                  <div class="text-center">
                    <p class="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
                      {{ kpi.proyeccionCierre | currency:'USD':'symbol':'1.0-0' }}
                    </p>
                    <p class="text-gray-500 mt-2">Proyección basada en {{ kpi.diasTranscurridos }} días</p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="!rounded-2xl !shadow-lg">
              <mat-card-content class="p-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <mat-icon class="text-green-500">timeline</mat-icon>
                  Resumen del Periodo
                </h3>
                <div class="space-y-4">
                  <div class="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <span class="text-gray-600">Ingresos Totales</span>
                    <span class="font-bold text-gray-800">{{ kpi.ingresoTotal | currency }}</span>
                  </div>
                  <div class="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <span class="text-gray-600">Cantidad de Ventas</span>
                    <span class="font-bold text-gray-800">{{ kpi.cantidadVentas }}</span>
                  </div>
                  <div class="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <span class="text-gray-600">Servicios Vendidos</span>
                    <span class="font-bold text-gray-800">{{ kpi.cantidadServicios }}</span>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>

          <mat-card class="!rounded-2xl !shadow-lg">
            <mat-card-content class="p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <mat-icon class="text-purple-500">history</mat-icon>
                Mis Ventas Recientes
              </h3>
              @if (ventas.length > 0) {
                <div class="overflow-x-auto">
                  <table class="w-full">
                    <thead>
                      <tr class="text-left text-gray-500 text-sm border-b">
                        <th class="pb-3">ID</th>
                        <th class="pb-3">Cliente</th>
                        <th class="pb-3">Monto</th>
                        <th class="pb-3">Unidades</th>
                        <th class="pb-3">Fecha</th>
                        <th class="pb-3">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (venta of ventas.slice(0, 5); track venta.id) {
                        <tr class="border-b border-gray-100 hover:bg-gray-50">
                          <td class="py-3">#{{ venta.id }}</td>
                          <td class="py-3">{{ venta.cliente }}</td>
                          <td class="py-3 font-semibold">{{ venta.monto | currency }}</td>
                          <td class="py-3">{{ venta.unidades }}</td>
                          <td class="py-3">{{ venta.fecha | date:'short' }}</td>
                          <td class="py-3">
                            <span class="px-2 py-1 text-xs rounded-full" [class]="getEstadoClass(venta.estado)">
                              {{ venta.estado }}
                            </span>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              } @else {
                <div class="text-center py-8 text-gray-500">
                  <mat-icon class="text-4xl mb-2">inbox</mat-icon>
                  <p>No hay ventas registradas en este periodo</p>
                </div>
              }
            </mat-card-content>
          </mat-card>
        } @else {
          <div class="flex justify-center items-center py-20">
            <mat-icon class="text-gray-300 text-6xl animate-pulse">analytics</mat-icon>
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
    if (valor >= 100) return 'text-green-600 bg-green-100 px-2 py-1 rounded-full';
    if (valor >= 75) return 'text-blue-600 bg-blue-100 px-2 py-1 rounded-full';
    if (valor >= 50) return 'text-amber-600 bg-amber-100 px-2 py-1 rounded-full';
    return 'text-red-600 bg-red-100 px-2 py-1 rounded-full';
  }

  getEstadoClass(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'completada': return 'bg-green-100 text-green-700';
      case 'pendiente': return 'bg-amber-100 text-amber-700';
      case 'cancelada': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }
}
