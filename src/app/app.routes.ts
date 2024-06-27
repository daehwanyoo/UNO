import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { LobbyComponent } from './lobby/lobby.component';

export const routes: Routes = [
  { path: 'uno', component: LandingPageComponent },
  { path: 'uno/lobby', component: LobbyComponent },
  { path: '', redirectTo: '/uno', pathMatch: 'full' },
];
