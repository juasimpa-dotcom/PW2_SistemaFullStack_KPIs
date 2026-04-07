import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { ApiService, RankingVendedor, KpiVendedor, Usuario } from '../../core/services/api.service';

@Component({
  selector: 'app-mi-equipo',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatTableModule, MatProgressBarModule, MatDatepickerModule, MatFormFieldModule, MatInputModule, FormsModule, MatSelectModule],
  template: `
    <div class="min-h-screen bg-gray-100 p-6">
      <div class="max-w-7xl mx-auto">
        <div class="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">Mi Equipo</h1>
            <p class="text-gray-500">Seguimiento de vendedores y ventas</p>
          </div>
          <div class="flex gap-3 items-center flex-wrap">
            <mat-form-field appearance="outline" class="!mb-0">
              <mat-label>Vendedor</mat-label>
              <mat-select [(ngModel)]="vendedorFiltro" (selectionChange)="filtrarYMostrar()">
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

        @if (vendedorFiltro && kpiVendedor) {
          <div class="mb-8">
            <mat-card class="!rounded-2xl !shadow-lg !bg-gradient-to-r from-blue-500 to-cyan-500 !text-white">
              <mat-card-content class="p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <h2 class="text-2xl font-bold mb-2">{{ getNombreVendedor() }}</h2>
                    <p class="opacity-80">Detalle del vendedor seleccionado</p>
                  </div>
                  <div class="text-right">
                    <p class="text-4xl font-bold">{{ kpiVendedor.porcentajeCumplimiento | number:'1.0-0' }}%</p>
                    <p class="opacity-80">Cumplimiento</p>
                  </div>
                </div>
                <mat-progress-bar mode="determinate" [value]="Math.min(kpiVendedor.porcentajeCumplimiento, 100)" class="!mt-4 !rounded-full !h-3 !bg-white/30" color="accent"></mat-progress-bar>
              </mat-card-content>
            </mat-card>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <mat-card class="!rounded-2xl !shadow-lg">
                <mat-card-content class="p-5 text-center">
                  <mat-icon class="text-3xl text-green-500 mb-2">account_balance_wallet</mat-icon>
                  <p class="text-2xl font-bold text-gray-800">{{ kpiVendedor.ingresoTotal | currency:'USD':'symbol':'1.0-0' }}</p>
                  <p class="text-sm text-gray-500">Ingresos Totales</p>
                </mat-card-content>
              </mat-card>
              <mat-card class="!rounded-2xl !shadow-lg">
                <mat-card-content class="p-5 text-center">
                  <mat-icon class="text-3xl text-blue-500 mb-2">shopping_cart</mat-icon>
                  <p class="text-2xl font-bold text-gray-800">{{ kpiVendedor.cantidadVentas }}</p>
                  <p class="text-sm text-gray-500">Ventas</p>
                </mat-card-content>
              </mat-card>
              <mat-card class="!rounded-2xl !shadow-lg">
                <mat-card-content class="p-5 text-center">
                  <mat-icon class="text-3xl text-purple-500 mb-2">payments</mat-icon>
                  <p class="text-2xl font-bold text-gray-800">{{ kpiVendedor.ticketPromedio | currency }}</p>
                  <p class="text-sm text-gray-500">Ticket Promedio</p>
                </mat-card-content>
              </mat-card>
              <mat-card class="!rounded-2xl !shadow-lg">
                <mat-card-content class="p-5 text-center">
                  <mat-icon class="text-3xl text-amber-500 mb-2">speed</mat-icon>
                  <p class="text-2xl font-bold text-gray-800">{{ kpiVendedor.ritmoAvance | number:'1.1-1' }}%</p>
                  <p class="text-sm text-gray-500">Ritmo/Día</p>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        }

        <mat-card class="!rounded-2xl !shadow-lg">
          <mat-card-content class="p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <mat-icon class="text-yellow-500">groups</mat-icon>
              Vendedores del Equipo
            </h3>
            @if (vendedores.length > 0) {
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="text-left text-gray-500 text-sm border-b">
                      <th class="pb-3">Vendedor</th>
                      <th class="pb-3">Ingresos</th>
                      <th class="pb-3">Meta</th>
                      <th class="pb-3">Avance</th>
                      <th class="pb-3">Ventas</th>
                      <th class="pb-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (item of ranking; track item.vendedorId) {
                      <tr class="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" (click)="seleccionarVendedor(item.vendedorId)">
                        <td class="py-4">
                          <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                              {{ item.nombreVendedor.charAt(0) }}
                            </div>
                            <span class="font-medium text-gray-800">{{ item.nombreVendedor }}</span>
                          </div>
                        </td>
                        <td class="py-4 font-semibold text-green-600">{{ item.ingresoTotal | currency }}</td>
                        <td class="py-4 text-gray-600">{{ item.metaMonetaria | currency }}</td>
                        <td class="py-4">
                          <div class="flex items-center gap-2">
                            <mat-progress-bar mode="determinate" [value]="Math.min(item.porcentajeAvance, 100)" [color]="getProgressColor(item.porcentajeAvance)" class="!w-24 !rounded-full !h-2"></mat-progress-bar>
                            <span class="font-bold" [class]="getPorcentajeClass(item.porcentajeAvance)">{{ item.porcentajeAvance | number:'1.0-0' }}%</span>
                          </div>
                        </td>
                        <td class="py-4">{{ item.cantidadVentas }}</td>
                        <td class="py-4">
                          <span class="px-3 py-1 rounded-full text-xs font-medium" [class]="item.porcentajeAvance >= 100 ? 'bg-green-100 text-green-700' : item.porcentajeAvance >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'">
                            {{ item.porcentajeAvance >= 100 ? 'Meta Alcanzada' : item.porcentajeAvance >= 50 ? 'En Progreso' : 'En Riesgo' }}
                          </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <div class="text-center py-12 text-gray-500">
                <mat-icon class="text-6xl mb-4 text-gray-300">group_off</mat-icon>
                <p class="text-lg">No hay vendedores en el equipo</p>
                <p class="text-sm">Los supervisores pueden crear vendedores desde "Gestionar Vendedores"</p>
              </div>
            }
          </mat-card-content>
        </mat-card>

        @if (vendedorFiltro && kpiVendedor) {
          <mat-card class="!rounded-2xl !shadow-lg mt-6">
            <mat-card-content class="p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <mat-icon class="text-cyan-500">analytics</mat-icon>
                Proyección al Cierre
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="text-center p-6 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl">
                  <p class="text-4xl font-bold text-cyan-600">{{ kpiVendedor.proyeccionCierre | currency:'USD':'symbol':'1.0-0' }}</p>
                  <p class="text-gray-500 mt-2">Proyección al Cierre</p>
                </div>
                <div class="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
                  <p class="text-4xl font-bold text-green-600">{{ kpiVendedor.metaMonetaria | currency:'USD':'symbol':'1.0-0' }}</p>
                  <p class="text-gray-500 mt-2">Meta Asignada</p>
                </div>
                <div class="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
                  <p class="text-4xl font-bold text-purple-600">{{ kpiVendedor.cantidadServicios }}</p>
                  <p class="text-gray-500 mt-2">Servicios Vendidos</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        }
      </div>
    </div>
  `
})
export class MiEquipoComponent implements OnInit {
  vendedores: Usuario[] = [];
  ranking: RankingVendedor[] = [];
  vendedorFiltro: number | null = null;
  kpiVendedor: KpiVendedor | null = null;
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

    this.api.getVendedores().subscribe({
      next: (data) => { this.vendedores = data; },
      error: (err) => console.error('Error vendedores:', err)
    });

    this.api.getRankingEquipo(fi, ff).subscribe({
      next: (data) => { this.ranking = data; },
      error: (err) => console.error('Error ranking:', err)
    });
  }

  seleccionarVendedor(vendedorId: number): void {
    this.vendedorFiltro = vendedorId;
    this.filtrarYMostrar();
  }

  filtrarYMostrar(): void {
    if (this.vendedorFiltro) {
      const fi = this.fechaInicio.toISOString();
      const ff = this.fechaFin.toISOString();
      this.api.getKpisVendedorPorId(this.vendedorFiltro, fi, ff).subscribe({
        next: (data) => { this.kpiVendedor = data; },
        error: (err) => console.error('Error KPIs:', err)
      });
    } else {
      this.kpiVendedor = null;
    }
  }

  getNombreVendedor(): string {
    return this.vendedores.find(v => v.id === this.vendedorFiltro)?.nombreCompleto || '';
  }

  getProgressColor(valor: number): 'primary' | 'accent' | 'warn' {
    if (valor >= 100) return 'primary';
    if (valor >= 50) return 'accent';
    return 'warn';
  }

  getPorcentajeClass(valor: number): string {
    if (valor >= 100) return 'text-green-600';
    if (valor >= 75) return 'text-blue-600';
    if (valor >= 50) return 'text-amber-600';
    return 'text-red-600';
  }
}
