import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private keycloak: Keycloak;
  private loggedIn = false;

  constructor() {
    this.keycloak = new Keycloak({
      url: 'http://localhost:8080',
      realm: 'kpis-realm',
      clientId: 'api-kpis-client'
    });
  }

async init(): Promise<boolean> {
  try {
    console.log('🔑 Iniciando Keycloak...');
    
    const authenticated = await this.keycloak.init({
      onLoad: 'check-sso',
      checkLoginIframe: false,
      pkceMethod: false  // ← ✅ DESACTIVAR PKCE
    });
    this.debugToken();
    
    this.loggedIn = authenticated;
    console.log('✅ Keycloak initialized:', authenticated);
    console.log('🔑 Token existe:', !!this.keycloak.token);
    return authenticated;
  } catch (error) {
    console.error('❌ Error inicializando Keycloak:', error);
    return false;
  }
}

  login(): void {
    console.log('🔐 Iniciando login...');
    console.log('📍 Redirect URI:', window.location.origin);
    
    this.keycloak.login({
      redirectUri: window.location.origin + '/dashboard',
      prompt: 'login'  // Forzar login siempre
    });
  }

  logout(): void {
    this.keycloak.logout({ 
      redirectUri: window.location.origin + '/dashboard'
    });
  }

  getToken(): string | undefined {
    const token = this.keycloak.token;
    console.log('🔑 getToken() llamado:', token ? 'TOKEN EXISTE' : 'NO HAY TOKEN');
    return token;
  }

  isLoggedIn(): boolean {
    const logged = this.loggedIn && !!this.keycloak.token;
    console.log('🔐 isLoggedIn():', logged);
    return logged;
  }

  getUsername(): string {
    return this.keycloak.tokenParsed?.['preferred_username'] || '';
  }

  hasRole(role: string): boolean {
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

  // Método adicional para debug
  debug(): void {
    console.log('=== KEYCLOAK DEBUG ===');
    console.log('loggedIn:', this.loggedIn);
    console.log('token:', this.keycloak.token ? 'EXISTS' : 'NULL');
    console.log('tokenParsed:', this.keycloak.tokenParsed);
    console.log('authenticated:', this.keycloak.authenticated);
    console.log('=====================');
  }
  debugToken(): void {
  if (this.keycloak.tokenParsed) {
    console.log('=== TOKEN DEBUG ===');
    console.log('realm_access.roles:', this.keycloak.tokenParsed.realm_access?.roles);
    console.log('resource_access:', this.keycloak.tokenParsed.resource_access);
    console.log('==================');
  }
}
}