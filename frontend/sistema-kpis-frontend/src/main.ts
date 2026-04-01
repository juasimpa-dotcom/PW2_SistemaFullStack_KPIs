import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import 'zone.js';  // ✅ IMPORTANTE: Esta línea debe estar

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));