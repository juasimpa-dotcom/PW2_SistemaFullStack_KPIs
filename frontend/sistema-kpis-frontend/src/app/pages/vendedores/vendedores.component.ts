import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService, Usuario } from '../../core/services/api.service';

@Component({
  selector: 'app-vendedores',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatTableModule, MatDialogModule, MatFormFieldModule, MatInputModule, FormsModule, MatSnackBarModule, MatChipsModule, MatTooltipModule],
  template: `
    <div class="min-h-screen bg-gray-100 p-6">
      <div class="max-w-7xl mx-auto">
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">Gestionar Vendedores</h1>
            <p class="text-gray-500">CRUD completo de vendedores del equipo</p>
          </div>
          <button mat-raised-button color="primary" (click)="abrirDialogoCrear()" class="!rounded-full">
            <mat-icon>person_add</mat-icon>
            Nuevo Vendedor
          </button>
        </div>

        @if (error) {
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
            <mat-icon class="text-red-500">error</mat-icon>
            {{ error }}
          </div>
        }

        <mat-card class="!rounded-2xl !shadow-lg">
          <mat-card-content class="p-6">
            <mat-form-field appearance="outline" class="!w-80">
              <mat-label>Buscar vendedor</mat-label>
              <input matInput [(ngModel)]="buscar" (input)="filtrarVendedores()" placeholder="Nombre o correo...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            @if (loading) {
              <div class="flex justify-center py-8">
                <mat-icon class="animate-spin text-gray-400">sync</mat-icon>
                <span class="ml-2 text-gray-500">Cargando vendedores...</span>
              </div>
            } @else if (vendedoresFiltrados.length === 0) {
              <div class="text-center py-12 text-gray-500">
                <mat-icon class="text-6xl mb-4 text-gray-300">person_off</mat-icon>
                <p class="text-lg">No hay vendedores registrados</p>
                <p class="text-sm">Crea tu primer vendedor con el botón "Nuevo Vendedor"</p>
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table mat-table [dataSource]="vendedoresFiltrados" class="w-full">
                  <ng-container matColumnDef="nombre">
                    <th mat-header-cell *matHeaderCellDef>Nombre</th>
                    <td mat-cell *matCellDef="let v">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                          {{ v.nombreCompleto.charAt(0) }}
                        </div>
                        <span class="font-medium">{{ v.nombreCompleto }}</span>
                      </div>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="correo">
                    <th mat-header-cell *matHeaderCellDef>Correo</th>
                    <td mat-cell *matCellDef="let v">
                      <span class="text-gray-600">{{ v.correo }}</span>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="rol">
                    <th mat-header-cell *matHeaderCellDef>Rol</th>
                    <td mat-cell *matCellDef="let v">
                      <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {{ v.rol }}
                      </span>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="estado">
                    <th mat-header-cell *matHeaderCellDef>Estado</th>
                    <td mat-cell *matCellDef="let v">
                      <span class="px-3 py-1 rounded-full text-sm font-medium" [class]="v.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                        {{ v.activo ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="acciones">
                    <th mat-header-cell *matHeaderCellDef>Acciones</th>
                    <td mat-cell *matCellDef="let v">
                      <button mat-icon-button color="primary" (click)="abrirDialogoEditar(v)" matTooltip="Editar" class="!mr-1">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button [color]="v.activo ? 'warn' : 'primary'" (click)="toggleEstado(v)" [matTooltip]="v.activo ? 'Desactivar' : 'Activar'">
                        <mat-icon>{{ v.activo ? 'block' : 'check_circle' }}</mat-icon>
                      </button>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-gray-50"></tr>
                </table>
              </div>
            }
          </mat-card-content>
        </mat-card>
      </div>
    </div>

    @if (mostrarDialogo) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" (click)="cerrarDialogo()">
        <mat-card class="!rounded-2xl !w-[450px]" (click)="$event.stopPropagation()">
          <mat-card-content class="p-6">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <mat-icon class="text-white">{{ editando ? 'edit' : 'person_add' }}</mat-icon>
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-800">{{ editando ? 'Editar' : 'Nuevo' }} Vendedor</h2>
                <p class="text-sm text-gray-500">{{ editando ? 'Actualiza los datos del vendedor' : 'Registra un nuevo vendedor en el sistema' }}</p>
              </div>
            </div>

            <mat-form-field appearance="outline" class="!w-full !mb-4">
              <mat-label>Nombre Completo</mat-label>
              <input matInput [(ngModel)]="formulario.nombreCompleto" required placeholder="Ej: Juan Pérez">
              <mat-icon matSuffix>person</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="!w-full !mb-4">
              <mat-label>Correo Electrónico</mat-label>
              <input matInput [(ngModel)]="formulario.correo" type="email" required placeholder="juan@ejemplo.com">
              <mat-icon matSuffix>email</mat-icon>
            </mat-form-field>

            @if (editando) {
              <div class="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
                <div class="flex items-center gap-2 text-blue-700 text-sm">
                  <mat-icon class="text-blue-500">info</mat-icon>
                  <span>El vendedor ya existe en Keycloak. Solo se actualizan los datos básicos.</span>
                </div>
              </div>
            } @else {
              <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                <div class="flex items-center gap-2 text-amber-700 text-sm">
                  <mat-icon class="text-amber-500">warning</mat-icon>
                  <span>El vendedor será creado en la BD local. Debe existir también en Keycloak.</span>
                </div>
              </div>
            }

            <div class="flex justify-end gap-3 mt-6">
              <button mat-button (click)="cerrarDialogo()" class="!text-gray-600">Cancelar</button>
              <button mat-raised-button color="primary" (click)="guardar()" [disabled]="!esFormularioValido()" class="!rounded-lg">
                <mat-icon>{{ editando ? 'save' : 'add' }}</mat-icon>
                {{ editando ? 'Actualizar' : 'Crear Vendedor' }}
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    }
  `
})
export class VendedoresComponent implements OnInit {
  displayedColumns = ['nombre', 'correo', 'rol', 'estado', 'acciones'];
  vendedores: Usuario[] = [];
  vendedoresFiltrados: Usuario[] = [];
  buscar = '';
  mostrarDialogo = false;
  editando = false;
  vendedorEditando: Usuario | null = null;
  loading = false;
  error = '';
  formulario = { nombreCompleto: '', correo: '' };

  constructor(private api: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.cargarVendedores();
  }

  cargarVendedores(): void {
    this.loading = true;
    this.error = '';
    this.api.getVendedores().subscribe({
      next: (data) => {
        this.vendedores = data;
        this.filtrarVendedores();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar vendedores:', err);
        this.error = 'Error al cargar vendedores. Verifica la conexión con el servidor.';
        this.loading = false;
        if (err.status === 403) {
          this.error = 'No tienes permisos para ver vendedores. Solo los supervisores pueden acceder.';
        }
      }
    });
  }

  filtrarVendedores(): void {
    const texto = this.buscar.toLowerCase();
    this.vendedoresFiltrados = this.vendedores.filter(v =>
      v.nombreCompleto.toLowerCase().includes(texto) || v.correo.toLowerCase().includes(texto)
    );
  }

  abrirDialogoCrear(): void {
    this.editando = false;
    this.vendedorEditando = null;
    this.formulario = { nombreCompleto: '', correo: '' };
    this.error = '';
    this.mostrarDialogo = true;
  }

  abrirDialogoEditar(v: Usuario): void {
    this.editando = true;
    this.vendedorEditando = v;
    this.formulario = { nombreCompleto: v.nombreCompleto, correo: v.correo };
    this.error = '';
    this.mostrarDialogo = true;
  }

  cerrarDialogo(): void {
    this.mostrarDialogo = false;
  }

  esFormularioValido(): boolean {
    return !!this.formulario.nombreCompleto.trim() && !!this.formulario.correo.trim() && this.formulario.correo.includes('@');
  }

  guardar(): void {
    if (!this.esFormularioValido()) {
      this.snackBar.open('Completa todos los campos correctamente', 'Cerrar', { duration: 3000 });
      return;
    }

    if (this.editando && this.vendedorEditando) {
      this.api.actualizarVendedor(this.vendedorEditando.id, {
        nombreCompleto: this.formulario.nombreCompleto.trim(),
        correo: this.formulario.correo.trim(),
        activo: this.vendedorEditando.activo
      }).subscribe({
        next: () => {
          this.snackBar.open('Vendedor actualizado correctamente', 'Cerrar', { duration: 3000 });
          this.cerrarDialogo();
          this.cargarVendedores();
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          this.snackBar.open('Error al actualizar vendedor: ' + (err.error?.message || 'Verifica los datos'), 'Cerrar', { duration: 4000 });
        }
      });
    } else {
      this.api.crearVendedor({
        keycloakId: null,
        nombreCompleto: this.formulario.nombreCompleto.trim(),
        correo: this.formulario.correo.trim()
      }).subscribe({
        next: () => {
          this.snackBar.open('Vendedor creado correctamente', 'Cerrar', { duration: 3000 });
          this.cerrarDialogo();
          this.cargarVendedores();
        },
        error: (err) => {
          console.error('Error al crear:', err);
          let mensaje = 'Error al crear vendedor';
          if (err.status === 400 && err.error?.message) {
            mensaje = err.error.message;
          }
          this.snackBar.open(mensaje, 'Cerrar', { duration: 4000 });
        }
      });
    }
  }

  toggleEstado(v: Usuario): void {
    const accion = v.activo ? 'desactivar' : 'activar';
    if (confirm(`¿{{ accion.charAt(0).toUpperCase() + accion.slice(1) }} a ${v.nombreCompleto}?`)) {
      this.api.actualizarVendedor(v.id, {
        nombreCompleto: v.nombreCompleto,
        correo: v.correo,
        activo: !v.activo
      }).subscribe({
        next: () => {
          this.snackBar.open(`Vendedor ${accion}do`, 'Cerrar', { duration: 3000 });
          this.cargarVendedores();
        },
        error: (err) => this.snackBar.open('Error al cambiar estado', 'Cerrar', { duration: 3000 })
      });
    }
  }
}
