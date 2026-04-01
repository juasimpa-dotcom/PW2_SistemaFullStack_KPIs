import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export interface KpiVendedor {
  ingresoTotal: number;
  cantidadVentas: number;
  cantidadServicios: number;
  ticketPromedio: number;
  porcentajeCumplimiento: number;
  porcentajeUnidades: number;
  metaMonetaria: number;
  metaCantidad: number;
  ritmoAvance: number;
  proyeccionCierre: number;
  diasTotales: number;
  diasTranscurridos: number;
}

export interface RankingVendedor {
  vendedorId: number;
  nombreVendedor: string;
  ingresoTotal: number;
  metaMonetaria: number;
  porcentajeAvance: number;
  cantidadVentas: number;
}

export interface ServicioVendido {
  nombreServicio: string;
  cantidadVendida: number;
  totalVendido: number;
}

export interface ResumenEquipo {
  ingresoTotal: number;
  cantidadVentas: number;
  cantidadServicios: number;
  ticketPromedio: number;
  totalVendedores: number;
  metaTotal: number;
  promedioAvance: number;
}

export interface Usuario {
  id: number;
  keycloakId: string;
  nombreCompleto: string;
  correo: string;
  rol: string;
  activo: boolean;
  fechaCreacion: string;
}

export interface Meta {
  id: number;
  usuarioId: number;
  nombreVendedor: string;
  periodoId: number;
  periodoNombre: string;
  fechaInicio: string;
  fechaFin: string;
  metaMonetaria: number;
  metaCantidad: number;
}

export interface Venta {
  id: number;
  cliente: string;
  monto: number;
  unidades: number;
  fecha: string;
  estado: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = 'http://localhost:5128/api';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` });
  }

  // KPIs
  getKpisVendedor(fechaInicio: string, fechaFin: string): Observable<KpiVendedor> {
    return this.http.get<KpiVendedor>(`${this.baseUrl}/kpis/vendedor?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, { headers: this.getHeaders() });
  }

  getKpisVendedorPorId(vendedorId: number, fechaInicio: string, fechaFin: string): Observable<KpiVendedor> {
    return this.http.get<KpiVendedor>(`${this.baseUrl}/kpis/vendedor/${vendedorId}?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, { headers: this.getHeaders() });
  }

  getRankingEquipo(fechaInicio: string, fechaFin: string): Observable<RankingVendedor[]> {
    return this.http.get<RankingVendedor[]>(`${this.baseUrl}/kpis/ranking-equipo?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, { headers: this.getHeaders() });
  }

  getServiciosMasVendidos(fechaInicio: string, fechaFin: string, vendedorId?: number): Observable<ServicioVendido[]> {
    let url = `${this.baseUrl}/kpis/servicios-mas-vendidos?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
    if (vendedorId) url += `&vendedorId=${vendedorId}`;
    return this.http.get<ServicioVendido[]>(url, { headers: this.getHeaders() });
  }

  getVendedoresEnRiesgo(fechaInicio: string, fechaFin: string): Observable<RankingVendedor[]> {
    return this.http.get<RankingVendedor[]>(`${this.baseUrl}/kpis/vendedores-en-riesgo?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, { headers: this.getHeaders() });
  }

  getResumenEquipo(fechaInicio: string, fechaFin: string): Observable<ResumenEquipo> {
    return this.http.get<ResumenEquipo>(`${this.baseUrl}/kpis/resumen-equipo?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, { headers: this.getHeaders() });
  }

  // Usuarios
  getVendedores(buscar?: string): Observable<Usuario[]> {
    let url = `${this.baseUrl}/usuarios`;
    if (buscar) url += `?buscar=${buscar}`;
    return this.http.get<Usuario[]>(url, { headers: this.getHeaders() });
  }

  crearVendedor(data: { keycloakId: string; nombreCompleto: string; correo: string }): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.baseUrl}/usuarios`, data, { headers: this.getHeaders() });
  }

  actualizarVendedor(id: number, data: { nombreCompleto: string; correo: string; activo: boolean }): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseUrl}/usuarios/${id}`, data, { headers: this.getHeaders() });
  }

  eliminarVendedor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/usuarios/${id}`, { headers: this.getHeaders() });
  }

  // Metas
  getMetas(vendedorId?: number): Observable<Meta[]> {
    let url = `${this.baseUrl}/metas`;
    if (vendedorId) url += `?vendedorId=${vendedorId}`;
    return this.http.get<Meta[]>(url, { headers: this.getHeaders() });
  }

  asignarMeta(data: { usuarioId: number; periodoId: number; metaMonetaria: number; metaCantidad: number }): Observable<Meta> {
    return this.http.post<Meta>(`${this.baseUrl}/metas`, data, { headers: this.getHeaders() });
  }

  // Ventas
  getMisVentas(fechaInicio?: string, fechaFin?: string): Observable<Venta[]> {
    let url = `${this.baseUrl}/ventas/mis-ventas`;
    const params: string[] = [];
    if (fechaInicio) params.push(`fechaInicio=${fechaInicio}`);
    if (fechaFin) params.push(`fechaFin=${fechaFin}`);
    if (params.length) url += '?' + params.join('&');
    return this.http.get<Venta[]>(url, { headers: this.getHeaders() });
  }

  registrarVenta(data: { clienteId: number; montoTotal: number; cantidadServicios?: number }): Observable<Venta> {
    return this.http.post<Venta>(`${this.baseUrl}/ventas`, data, { headers: this.getHeaders() });
  }

  // Perfil
  getMiPerfil(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/ventas/mi-perfil`, { headers: this.getHeaders() });
  }
}
