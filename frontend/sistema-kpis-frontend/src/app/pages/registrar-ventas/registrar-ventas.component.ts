import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService, Servicio } from '../../core/services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registrar-ventas',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, FormsModule, MatSnackBarModule],
  template: `
    <div class="min-h-screen bg-gray-100 p-6">
      <div class="max-w-2xl mx-auto">
        <mat-card class="!rounded-2xl !shadow-lg">
          <mat-card-content class="p-8">
            <div class="flex items-center gap-3 mb-8">
              <div class="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                <mat-icon class="text-white text-2xl">point_of_sale</mat-icon>
              </div>
              <div>
                <h1 class="text-2xl font-bold text-gray-800">Registrar Venta</h1>
                <p class="text-gray-500">Ingresa los datos de la venta</p>
              </div>
            </div>

            <mat-form-field appearance="outline" class="!w-full !mb-4">
              <mat-label>Nombre del Cliente</mat-label>
              <input matInput [(ngModel)]="venta.cliente" placeholder="Nombre completo del cliente" required>
              <mat-icon matSuffix>person</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="!w-full !mb-4">
              <mat-label>Servicio</mat-label>
              <mat-select [(ngModel)]="venta.servicioId" required>
                @if (servicios.length === 0 && !cargandoServicios) {
                  <mat-option disabled>No hay servicios disponibles</mat-option>
                }
                @for (s of servicios; track s.id) {
                  <mat-option [value]="s.id">{{ s.nombre }} - {{ s.precioActual | currency }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="!w-full !mb-4">
              <mat-label>Cantidad</mat-label>
              <input matInput [(ngModel)]="venta.cantidad" type="number" min="1" required>
              <mat-icon matSuffix>inventory</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="!w-full !mb-4">
              <mat-label>Monto Total</mat-label>
              <input matInput [(ngModel)]="venta.monto" type="number" required>
              <mat-icon matSuffix>attach_money</mat-icon>
            </mat-form-field>

            @if (venta.monto > 0 && venta.cantidad > 0) {
              <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div class="flex items-center gap-2 text-blue-700">
                  <mat-icon class="text-blue-500">info</mat-icon>
                  <span>Precio por unidad: {{ venta.monto / venta.cantidad | currency }}</span>
                </div>
              </div>
            }

            @if (error) {
              <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-3">
                <mat-icon class="text-red-500">error</mat-icon>
                {{ error }}
              </div>
            }

            <div class="flex justify-end gap-3 mt-6">
              <button mat-button (click)="cancelar()" class="!text-gray-600">
                <mat-icon>close</mat-icon>
                <span>Cancelar</span>
              </button>
              <button mat-raised-button color="primary" (click)="registrar()" [disabled]="!esValido() || guardando" class="!rounded-lg">
                <ng-container *ngIf="guardando; else guardarTemplate">
                  <mat-icon class="animate-spin">sync</mat-icon>
                  <span>Guardando...</span>
                </ng-container>
                <ng-template #guardarTemplate>
                  <mat-icon>save</mat-icon>
                  <span>Registrar Venta</span>
                </ng-template>
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `
})
export class RegistrarVentasComponent implements OnInit {
  servicios: Servicio[] = [];
  cargandoServicios = false;
  guardando = false;
  error = '';
  venta = {
    cliente: '',
    servicioId: 0,
    cantidad: 1,
    monto: 0
  };

  constructor(private api: ApiService, private snackBar: MatSnackBar, private router: Router) {}

  ngOnInit(): void {
    this.cargarServicios();
  }

  cargarServicios(): void {
    this.cargandoServicios = true;
    this.api.getServicios().subscribe({
      next: (data) => {
        this.servicios = data;
        this.cargandoServicios = false;
        if (data.length > 0) {
          this.venta.servicioId = data[0].id;
          this.venta.monto = data[0].precioActual;
        }
      },
      error: (err) => {
        console.error('Error al cargar servicios:', err);
        this.cargandoServicios = false;
        this.error = 'Error al cargar servicios';
        this.snackBar.open('Error al cargar servicios', 'Cerrar', { duration: 3000 });
      }
    });
  }

  esValido(): boolean {
    return !!this.venta.cliente.trim() && this.venta.servicioId > 0 && this.venta.cantidad > 0 && this.venta.monto > 0;
  }

  registrar(): void {
    if (!this.esValido()) {
      this.error = 'Completa todos los campos';
      return;
    }

    this.guardando = true;
    this.error = '';

    this.api.registrarVenta({
      clienteId: 1,
      montoTotal: this.venta.monto,
      cantidadServicios: this.venta.cantidad,
      nombreCliente: this.venta.cliente.trim(),
      servicioId: this.venta.servicioId
    }).subscribe({
      next: () => {
        this.snackBar.open('Venta registrada correctamente', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Error al registrar venta:', err);
        this.guardando = false;
        this.error = err.error?.message || 'Error al registrar la venta';
        this.snackBar.open('Error al registrar venta', 'Cerrar', { duration: 3000 });
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard']);
  }
}
