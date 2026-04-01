import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService, Usuario } from '../../core/services/api.service';

@Component({
  selector: 'app-vendedores',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatTableModule, MatDialogModule, MatFormFieldModule, MatInputModule, FormsModule, MatSnackBarModule],
  template: `
    <div class="min-h-screen bg-gray-100 p-6">
      <div class="max-w-7xl mx-auto">
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">Gestionar Vendedores</h1>
            <p class="text-gray-500">CRUD de vendedores del equipo</p>
          </div>
          <button mat-raised-button color="primary" (click)="abrirDialogoCrear()">
            <mat-icon>person_add</mat-icon>
            Nuevo Vendedor
          </button>
        </div>

        <mat-card class="!rounded-2xl !shadow-lg">
          <mat-card-content class="p-6">
            <mat-form-field appearance="outline" class="!w-80">
              <mat-label>Buscar vendedor</mat-label>
              <input matInput [(ngModel)]="buscar" (input)="filtrarVendedores()" placeholder="Nombre o correo...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <table mat-table [dataSource]="vendedoresFiltrados" class="w-full">
              <ng-container matColumnDef="nombre">
                <th mat-header-cell *matHeaderCellDef>Nombre</th>
                <td mat-cell *matCellDef="let v">{{ v.nombreCompleto }}</td>
              </ng-container>

              <ng-container matColumnDef="correo">
                <th mat-header-cell *matHeaderCellDef>Correo</th>
                <td mat-cell *matCellDef="let v">{{ v.correo }}</td>
              </ng-container>

              <ng-container matColumnDef="keycloakId">
                <th mat-header-cell *matHeaderCellDef>Keycloak ID</th>
                <td mat-cell *matCellDef="let v" class="text-xs text-gray-500">{{ v.keycloakId }}</td>
              </ng-container>

              <ng-container matColumnDef="estado">
                <th mat-header-cell *matHeaderCellDef>Estado</th>
                <td mat-cell *matCellDef="let v">
                  <span class="px-3 py-1 rounded-full text-sm" [class]="v.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                    {{ v.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="acciones">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let v">
                  <button mat-icon-button color="primary" (click)="abrirDialogoEditar(v)" class="!mr-2">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="eliminarVendedor(v)">
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
            <h2 class="text-xl font-bold mb-4">{{ editando ? 'Editar' : 'Nuevo' }} Vendedor</h2>
            <mat-form-field appearance="outline" class="!w-full !mb-4">
              <mat-label>Nombre Completo</mat-label>
              <input matInput [(ngModel)]="formulario.nombreCompleto" required>
            </mat-form-field>
            <mat-form-field appearance="outline" class="!w-full !mb-4">
              <mat-label>Correo</mat-label>
              <input matInput [(ngModel)]="formulario.correo" type="email" required>
            </mat-form-field>
            @if (!editando) {
              <mat-form-field appearance="outline" class="!w-full !mb-4">
                <mat-label>Keycloak ID (GUID)</mat-label>
                <input matInput [(ngModel)]="formulario.keycloakId" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" required>
              </mat-form-field>
            }
            <div class="flex justify-end gap-3">
              <button mat-button (click)="cerrarDialogo()">Cancelar</button>
              <button mat-raised-button color="primary" (click)="guardar()">
                {{ editando ? 'Actualizar' : 'Crear' }}
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    }
  `
})
export class VendedoresComponent implements OnInit {
  displayedColumns = ['nombre', 'correo', 'keycloakId', 'estado', 'acciones'];
  vendedores: Usuario[] = [];
  vendedoresFiltrados: Usuario[] = [];
  buscar = '';
  mostrarDialogo = false;
  editando = false;
  vendedorEditando: Usuario | null = null;
  formulario = { nombreCompleto: '', correo: '', keycloakId: '' };

  constructor(private api: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit(): void { this.cargarVendedores(); }

  cargarVendedores(): void {
    this.api.getVendedores().subscribe({ next: (data) => { this.vendedores = data; this.filtrarVendedores(); } });
  }

  filtrarVendedores(): void {
    const texto = this.buscar.toLowerCase();
    this.vendedoresFiltrados = this.vendedores.filter(v =>
      v.nombreCompleto.toLowerCase().includes(texto) || v.correo.toLowerCase().includes(texto)
    );
  }

  abrirDialogoCrear(): void {
    this.editando = false;
    this.formulario = { nombreCompleto: '', correo: '', keycloakId: '' };
    this.mostrarDialogo = true;
  }

  abrirDialogoEditar(v: Usuario): void {
    this.editando = true;
    this.vendedorEditando = v;
    this.formulario = { nombreCompleto: v.nombreCompleto, correo: v.correo, keycloakId: '' };
    this.mostrarDialogo = true;
  }

  cerrarDialogo(): void { this.mostrarDialogo = false; }

  guardar(): void {
    if (!this.formulario.nombreCompleto || !this.formulario.correo) {
      this.snackBar.open('Complete todos los campos', 'Cerrar', { duration: 3000 }); return;
    }
    if (this.editando && this.vendedorEditando) {
      this.api.actualizarVendedor(this.vendedorEditando.id, { nombreCompleto: this.formulario.nombreCompleto, correo: this.formulario.correo, activo: this.vendedorEditando.activo })
        .subscribe({ next: () => { this.snackBar.open('Vendedor actualizado', 'Cerrar', { duration: 3000 }); this.cerrarDialogo(); this.cargarVendedores(); } });
    } else {
      if (!this.formulario.keycloakId) { this.snackBar.open('Ingrese el Keycloak ID', 'Cerrar', { duration: 3000 }); return; }
      this.api.crearVendedor({ keycloakId: this.formulario.keycloakId, nombreCompleto: this.formulario.nombreCompleto, correo: this.formulario.correo })
        .subscribe({ next: () => { this.snackBar.open('Vendedor creado', 'Cerrar', { duration: 3000 }); this.cerrarDialogo(); this.cargarVendedores(); } });
    }
  }

  eliminarVendedor(v: Usuario): void {
    if (confirm(`¿Eliminar a ${v.nombreCompleto}?`)) {
      this.api.eliminarVendedor(v.id).subscribe({ next: () => { this.snackBar.open('Vendedor eliminado', 'Cerrar', { duration: 3000 }); this.cargarVendedores(); } });
    }
  }
}
