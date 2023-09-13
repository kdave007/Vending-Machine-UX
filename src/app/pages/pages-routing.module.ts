import { RouterModule, Routes } from '@angular/router';
import { NgModule }             from '@angular/core';

import { PagesComponent } from './pages.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { CookingComponent } from './cooking/cooking.component';
import { SettingsComponent } from './settings/settings.component';
import { MaintenanceComponent} from './maintenance/maintenance.component';
import { ProcessBreadComponent } from './cooking/process-bread/process-bread.component';

const routes: Routes = [{
  path: '',
  component: PagesComponent,
  children: [
    {
      path: 'welcome',
      component: WelcomeComponent,
    },
    {
      path: 'settings',
      component: SettingsComponent,
    },
    {
      path: 'cooking',
      component: CookingComponent,
    },
    {
      path: 'process-bread',
      component: ProcessBreadComponent,
    },
    {
      path: 'maintenance',
      component: MaintenanceComponent,
    },
    {
      path: '',
      redirectTo: 'maintenance', //'welcome',
      pathMatch: 'full',
    },
    {
      path: '**',
      component: WelcomeComponent,
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  //imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}
