import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService, Meta, Usuario, Periodo } from '../../core/services/api.service';

@Component({
  selector: 'app-metas',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatTableModule, MatSelectModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, FormsModule, MatSnackBarModule, MatProgressBarModule],
  template: `
    <div class="min-h-screen bg-gray-100 p-6">
      <div class="max-w-7xl mx-auto">
        <div class="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">Asignar Metas</h1>
            <p class="text-gray-500">Gestión de metas por vendedor</p>
          </div>
          <button mat-raised-button color="primary" (click)="abrirDialogo()" class="!rounded-full">
            <mat-icon>add_task</mat-icon>
            Nueva Meta
          </button>
        </div>

        <mat-card class="!rounded-2xl !shadow-lg mb-6">
          <mat-card-content class="p-6">
            <mat-form-field appearance="outline" class="!w-80">
              <mat-label>Filtrar por vendedor</mat-label>
              <mat-select [(ngModel)]="vendedorFiltro" (selectionChange)="cargarMetas()">
                <mat-option [value]="null">Todos</mat-option>
                @for (v of vendedores; track v.id) {
                  <mat-option [value]="v.id">{{ v.nombreCompleto }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </mat-card-content>
        </mat-card>

        @if (loading) {
          <mat-card class="!rounded-2xl !shadow-lg">
            <mat-card-content class="p-6 text-center">
              <mat-icon class="animate-spin text-4xl text-gray-400">sync</mat-icon>
              <p class="mt-2 text-gray-500">Cargando metas...</p>
            </mat-card-content>
          </mat-card>
        } @else if (metas.length === 0) {
          <mat-card class="!rounded-2xl !shadow-lg">
            <mat-card-content class="p-6 text-center">
              <mat-icon class="text-6xl mb-4 text-gray-300">flag_off</mat-icon>
              <p class="text-lg text-gray-600">No hay metas asignadas</p>
              <p class="text-sm text-gray-500">Crea una nueva meta con el botón "Nueva Meta"</p>
            </mat-card-content>
          </mat-card>
        } @else {
          <mat-card class="!rounded-2xl !shadow-lg">
            <mat-card-content class="p-6">
              <div class="overflow-x-auto">
                <table mat-table [dataSource]="metas" class="w-full">
                  <ng-container matColumnDef="vendedor">
                    <th mat-header-cell *matHeaderCellDef>Vendedor</th>
                    <td mat-cell *matCellDef="let m">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                          {{ m.nombreVendedor.charAt(0) }}
                        </div>
                        <span class="font-medium">{{ m.nombreVendedor }}</span>
                      </div>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="periodo">
                    <th mat-header-cell *matHeaderCellDef>Periodo</th>
                    <td mat-cell *matCellDef="let m">
                      <span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        {{ m.periodoNombre }}
                      </span>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="fechas">
                    <th mat-header-cell *matHeaderCellDef>Fechas</th>
                    <td mat-cell *matCellDef="let m" class="text-gray-600">
                      {{ m.fechaInicio | date:'dd/MM/yyyy' }} - {{ m.fechaFin | date:'dd/MM/yyyy' }}
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="metaMonetaria">
                    <th mat-header-cell *matHeaderCellDef>Meta Monetaria</th>
                    <td mat-cell *matCellDef="let m">
                      <span class="font-semibold text-green-600">{{ m.metaMonetaria | currency }}</span>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="metaCantidad">
                    <th mat-header-cell *matHeaderCellDef>Meta Unidades</th>
                    <td mat-cell *matCellDef="let m">
                      <span class="font-semibold text-blue-600">{{ m.metaCantidad }} unidades</span>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="acciones">
                    <th mat-header-cell *matHeaderCellDef>Acciones</th>
                    <td mat-cell *matCellDef="let m">
                      <button mat-icon-button color="warn" (click)="eliminarMeta(m)" matTooltip="Eliminar">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-gray-50"></tr>
                </table>
              </div>
            </mat-card-content>
          </mat-card>
        }
      </div>
    </div>

    @if (mostrarDialogo) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" (click)="cerrarDialogo()">
        <mat-card class="!rounded-2xl !w-[450px]" (click)="$event.stopPropagation()">
          <mat-card-content class="p-6">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <mat-icon class="text-white">flag</mat-icon>
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-800">Asignar Nueva Meta</h2>
                <p class="text-sm text-gray-500">Define las metas para un vendedor</p>
              </div>
            </div>

            <mat-form-field appearance="outline" class="!w-full !mb-4">
              <mat-label>Vendedor</mat-label>
              <mat-select [(ngModel)]="formulario.usuarioId" required>
                @if (vendedores.length === 0) {
                  <mat-option disabled>No hay vendedores disponibles</mat-option>
                }
                @for (v of vendedores; track v.id) {
                  <mat-option [value]="v.id">{{ v.nombreCompleto }}</mat-option>
                }
              </mat-select>
              <mat-icon matSuffix>person</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="!w-full !mb-4">
              <mat-label>Meta Monetaria ($)</mat-label>
              <input matInput [(ngModel)]="formulario.metaMonetaria" type="number" required min="0" placeholder="10000">
              <mat-icon matSuffix>attach_money</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="!w-full !mb-4">
              <mat-label>Meta en Unidades</mat-label>
              <input matInput [(ngModel)]="formulario.metaCantidad" type="number" required min="1" placeholder="50">
              <mat-icon matSuffix>inventory</mat-icon>
            </mat-form-field>

            <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
              <div class="flex items-center gap-2 text-amber-700 text-sm">
                <mat-icon class="text-amber-500">info</mat-icon>
                <span>La meta se asignará al periodo actual por defecto.</span>
              </div>
            </div>

            <div class="flex justify-end gap-3 mt-6">
              <button mat-button (click)="cerrarDialogo()" class="!text-gray-600">Cancelar</button>
              <button mat-raised-button color="primary" (click)="asignarMeta()" [disabled]="!esFormularioValido()" class="!rounded-lg">
                <mat-icon>save</mat-icon>
                Asignar Meta
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    }
  `
})
export class MetasComponent implements OnInit {
  displayedColumns = ['vendedor', 'periodo', 'fechas', 'metaMonetaria', 'metaCantidad', 'acciones'];
  metas: Meta[] = [];
  vendedores: Usuario[] = [];
  vendedorFiltro: number | null = null;
  mostrarDialogo = false;
  loading = false;
  periodoActual: Periodo | null = null;
  formulario = { usuarioId: 0, periodoId: 0, metaMonetaria: 0, metaCantidad: 0 };

  constructor(private api: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.cargarPeriodoActual();
    this.cargarVendedores();
    this.cargarMetas();
  }

  cargarPeriodoActual(): void {
    this.api.getPeriodoActual().subscribe({
      next: (data) => {
        this.periodoActual = data;
        this.formulario.periodoId = data.id;
      },
      error: (err) => {
        console.error('Error al cargar periodo actual:', err);
        this.snackBar.open('No se pudo obtener el periodo actual', 'Cerrar', { duration: 3000 });
      }
    });
  }

  cargarVendedores(): void {
    this.api.getVendedores().subscribe({
      next: (data) => {
        this.vendedores = data;
        console.log('Vendedores cargados:', data.length);
      },
      error: (err) => {
        console.error('Error al cargar vendedores:', err);
        this.snackBar.open('Error al cargar vendedores', 'Cerrar', { duration: 3000 });
      }
    });
  }

  cargarMetas(): void {
    this.loading = true;
    this.api.getMetas(this.vendedorFiltro || undefined).subscribe({
      next: (data) => {
        this.metas = data;
        this.loading = false;
        console.log('Metas cargadas:', data.length);
      },
      error: (err) => {
        console.error('Error al cargar metas:', err);
        this.loading = false;
        this.snackBar.open('Error al cargar metas', 'Cerrar', { duration: 3000 });
      }
    });
  }

  abrirDialogo(): void {
    this.formulario = { 
      usuarioId: 0, 
      periodoId: this.periodoActual?.id || 0, 
      metaMonetaria: 0, 
      metaCantidad: 0 
    };
    this.mostrarDialogo = true;
  }

  cerrarDialogo(): void {
    this.mostrarDialogo = false;
  }

  esFormularioValido(): boolean {
    return this.formulario.usuarioId > 0 && this.formulario.metaMonetaria > 0 && this.formulario.metaCantidad > 0;
  }

  asignarMeta(): void {
    if (!this.esFormularioValido()) {
      this.snackBar.open('Completa todos los campos', 'Cerrar', { duration: 3000 });
      return;
    }

    this.api.asignarMeta(this.formulario).subscribe({
      next: () => {
        this.snackBar.open('Meta asignada correctamente', 'Cerrar', { duration: 3000 });
        this.cerrarDialogo();
        this.cargarMetas();
      },
      error: (err) => {
        console.error('Error al asignar meta:', err);
        let mensaje = 'Error al asignar meta';
        if (err.status === 400 && err.error?.message) {
          mensaje = err.error.message;
        }
        this.snackBar.open(mensaje, 'Cerrar', { duration: 4000 });
      }
    });
  }

  eliminarMeta(m: Meta): void {
    if (confirm(`¿Eliminar la meta de ${m.nombreVendedor}?`)) {
      this.api.eliminarMeta(m.id).subscribe({
        next: () => {
          this.snackBar.open('Meta eliminada', 'Cerrar', { duration: 3000 });
          this.cargarMetas();
        },
        error: (err) => {
          console.error('Error al eliminar meta:', err);
          this.snackBar.open('Error al eliminar meta', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }
}
