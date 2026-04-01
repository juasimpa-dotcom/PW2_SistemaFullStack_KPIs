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
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService, Meta, Usuario } from '../../core/services/api.service';

@Component({
  selector: 'app-metas',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatTableModule, MatSelectModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, FormsModule, MatSnackBarModule],
  template: `
    <div class="min-h-screen bg-gray-100 p-6">
      <div class="max-w-7xl mx-auto">
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">Asignar Metas</h1>
            <p class="text-gray-500">Gestión de metas por vendedor</p>
          </div>
          <button mat-raised-button color="primary" (click)="mostrarDialogo = true">
            <mat-icon>add_task</mat-icon>
            Nueva Meta
          </button>
        </div>

        <mat-card class="!rounded-2xl !shadow-lg">
          <mat-card-content class="p-6">
            <mat-form-field appearance="outline" class="!w-80 !mb-4">
              <mat-label>Filtrar por vendedor</mat-label>
              <mat-select [(ngModel)]="vendedorFiltro" (selectionChange)="cargarMetas()">
                <mat-option [value]="null">Todos</mat-option>
                @for (v of vendedores; track v.id) {
                  <mat-option [value]="v.id">{{ v.nombreCompleto }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <table mat-table [dataSource]="metas" class="w-full">
              <ng-container matColumnDef="vendedor">
                <th mat-header-cell *matHeaderCellDef>Vendedor</th>
                <td mat-cell *matCellDef="let m">{{ m.nombreVendedor }}</td>
              </ng-container>

              <ng-container matColumnDef="periodo">
                <th mat-header-cell *matHeaderCellDef>Periodo</th>
                <td mat-cell *matCellDef="let m">{{ m.periodoNombre }}</td>
              </ng-container>

              <ng-container matColumnDef="fechas">
                <th mat-header-cell *matHeaderCellDef>Fechas</th>
                <td mat-cell *matCellDef="let m">
                  {{ m.fechaInicio | date:'shortDate' }} - {{ m.fechaFin | date:'shortDate' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="metaMonetaria">
                <th mat-header-cell *matHeaderCellDef>Meta Monetaria</th>
                <td mat-cell *matCellDef="let m" class="font-semibold text-green-600">{{ m.metaMonetaria | currency }}</td>
              </ng-container>

              <ng-container matColumnDef="metaCantidad">
                <th mat-header-cell *matHeaderCellDef>Meta Unidades</th>
                <td mat-cell *matCellDef="let m" class="font-semibold text-blue-600">{{ m.metaCantidad }}</td>
              </ng-container>

              <ng-container matColumnDef="acciones">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let m">
                  <button mat-icon-button color="warn" (click)="eliminarMeta(m)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </mat-card-content>
        </mat-card>
      </div>
    </div>

    @if (mostrarDialogo) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <mat-card class="!rounded-2xl !w-96">
          <mat-card-content class="p-6">
            <h2 class="text-xl font-bold mb-4">Asignar Nueva Meta</h2>
            <mat-form-field appearance="outline" class="!w-full !mb-4">
              <mat-label>Vendedor</mat-label>
              <mat-select [(ngModel)]="formulario.usuarioId" required>
                @for (v of vendedores; track v.id) {
                  <mat-option [value]="v.id">{{ v.nombreCompleto }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="!w-full !mb-4">
              <mat-label>Meta Monetaria</mat-label>
              <input matInput [(ngModel)]="formulario.metaMonetaria" type="number" required>
            </mat-form-field>
            <mat-form-field appearance="outline" class="!w-full !mb-4">
              <mat-label>Meta en Unidades</mat-label>
              <input matInput [(ngModel)]="formulario.metaCantidad" type="number" required>
            </mat-form-field>
            <div class="flex justify-end gap-3">
              <button mat-button (click)="mostrarDialogo = false">Cancelar</button>
              <button mat-raised-button color="primary" (click)="asignarMeta()">Asignar</button>
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
  formulario = { usuarioId: 0, periodoId: 1, metaMonetaria: 0, metaCantidad: 0 };

  constructor(private api: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.api.getVendedores().subscribe({ next: (data) => this.vendedores = data });
    this.cargarMetas();
  }

  cargarMetas(): void {
    this.api.getMetas(this.vendedorFiltro || undefined).subscribe({ next: (data) => this.metas = data });
  }

  asignarMeta(): void {
    if (!this.formulario.usuarioId || !this.formulario.metaMonetaria || !this.formulario.metaCantidad) {
      this.snackBar.open('Complete todos los campos', 'Cerrar', { duration: 3000 }); return;
    }
    this.api.asignarMeta(this.formulario).subscribe({
      next: () => { this.snackBar.open('Meta asignada', 'Cerrar', { duration: 3000 }); this.mostrarDialogo = false; this.cargarMetas(); },
      error: () => this.snackBar.open('Error al asignar meta', 'Cerrar', { duration: 3000 })
    });
  }

  eliminarMeta(m: Meta): void {
    if (confirm('¿Eliminar esta meta?')) {
      this.api.getMetas().subscribe();
    }
  }
}
