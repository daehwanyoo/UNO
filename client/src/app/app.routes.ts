import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { LobbyComponent } from './lobby/lobby.component';
import { CardComponent } from './card/card.component';

export const routes: Routes = [
  { path: 'uno', component: LandingPageComponent },
  { path: 'uno/lobby', component: LobbyComponent },
  { path: 'uno/card', component: CardComponent },
  { path: '', redirectTo: '/uno', pathMatch: 'full' },
];
