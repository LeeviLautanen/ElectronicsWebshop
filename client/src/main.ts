import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import localeFi from '@angular/common/locales/fi';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localeFi);

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
