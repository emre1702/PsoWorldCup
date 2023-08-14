import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import {
  provideServerRendering,
} from '@angular/platform-server';
import { appConfig } from './app.config';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideClientHydration } from '@angular/platform-browser';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideClientHydration(),
    provideNoopAnimations(),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
