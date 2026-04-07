import { Injectable, inject } from '@angular/core';
import Keycloak from 'keycloak-js';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private keycloak: Keycloak;
  private loggedIn = false;
  private initializing = false;
  private http = inject(HttpClient);
  private nombreCompletoBd: string = '';

  constructor() {
    this.keycloak = new Keycloak({
      url: 'http://localhost:8080',
      realm: 'kpis-realm',
      clientId: 'api-kpis-client'
    });
  }

  async init(): Promise<boolean> {
    if (this.initializing) return false;
    this.initializing = true;
    
    try {
      const authenticated = await this.keycloak.init({
        onLoad: 'check-sso',
        checkLoginIframe: false,
        pkceMethod: false
      });
      
      this.loggedIn = authenticated;
      
      if (authenticated) {
        this.debugToken();
        await this.sincronizarUsuario();
      }
      
      return authenticated;
    } catch (error) {
      console.error('Error inicializando Keycloak:', error);
      return false;
    } finally {
      this.initializing = false;
    }
  }

  private async sincronizarUsuario(): Promise<void> {
    try {
      await this.keycloak.updateToken(30);
      const token = this.keycloak.token;
      if (!token) {
        console.warn('No hay token disponible para sincronizar');
        return;
      }
      
      const response = await firstValueFrom(
        this.http.post<any>('http://localhost:5129/api/sync/sync-user', {}, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      );
      console.log('Usuario sincronizado:', response);
      if (response?.nombreCompleto) {
        this.nombreCompletoBd = response.nombreCompleto;
      }
    } catch (error: any) {
      console.error('Error sincronizando usuario:', error);
      if (error?.status === 400) {
        console.error('Error 400 en sync-user. Verifica que el token tenga el claim "sub" de Keycloak');
      }
    }
  }

  login(): void {
    this.keycloak.login({
      redirectUri: window.location.origin + '/dashboard',
      prompt: 'login'
    });
  }

  logout(): void {
    this.keycloak.logout({ 
      redirectUri: window.location.origin + '/home'
    });
  }

  getToken(): string | undefined {
    return this.keycloak.token;
  }

  isLoggedIn(): boolean {
    return this.loggedIn && !!this.keycloak.token;
  }

  getUsername(): string {
    return (this.keycloak.tokenParsed?.['preferred_username'] as string) || 
           (this.keycloak.tokenParsed?.['name'] as string) || 
           (this.keycloak.tokenParsed?.['given_name'] as string) || '';
  }

  getFullName(): string {
    if (this.nombreCompletoBd) return this.nombreCompletoBd;
    
    const name = this.keycloak.tokenParsed?.['name'] as string;
    const givenName = this.keycloak.tokenParsed?.['given_name'] as string;
    const familyName = this.keycloak.tokenParsed?.['family_name'] as string;
    
    if (name) return name;
    if (givenName && familyName) return `${givenName} ${familyName}`;
    if (givenName) return givenName;
    return (this.keycloak.tokenParsed?.['preferred_username'] as string) || '';
  }

  getEmail(): string {
    return (this.keycloak.tokenParsed?.['email'] as string) || '';
  }

  hasRole(role: string): boolean {
    const realmAccess = this.keycloak.tokenParsed?.['realm_access'];
    if (realmAccess?.roles?.includes(role)) return true;
    
    const resourceAccess = this.keycloak.tokenParsed?.resource_access;
    const clientRoles = resourceAccess?.['api-kpis-client']?.roles;
    return clientRoles?.includes(role) || false;
  }

  isSupervisor(): boolean {
    return this.hasRole('supervisor');
  }

  isVendedor(): boolean {
    return this.hasRole('vendedor');
  }

  updateToken(minValidity: number = 10): Promise<boolean> {
    return this.keycloak.updateToken(minValidity);
  }

  debug(): void {
    console.log('=== KEYCLOAK DEBUG ===');
    console.log('loggedIn:', this.loggedIn);
    console.log('token:', this.keycloak.token ? 'EXISTS' : 'NULL');
    console.log('tokenParsed:', this.keycloak.tokenParsed);
    console.log('authenticated:', this.keycloak.authenticated);
    console.log('isSupervisor:', this.isSupervisor());
    console.log('isVendedor:', this.isVendedor());
    console.log('=====================');
  }

  debugToken(): void {
    if (this.keycloak.tokenParsed) {
      console.log('=== TOKEN DEBUG ===');
      console.log('realm_access.roles:', this.keycloak.tokenParsed.realm_access?.roles);
      console.log('resource_access:', this.keycloak.tokenParsed.resource_access);
      console.log('sub:', this.keycloak.tokenParsed.sub);
      console.log('preferred_username:', this.keycloak.tokenParsed['preferred_username']);
      console.log('email:', this.keycloak.tokenParsed['email']);
      console.log('name:', this.keycloak.tokenParsed['name']);
      console.log('==================');
    }
  }
}
