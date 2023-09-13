import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NbMenuModule, NbTabsetModule, NbLayoutModule, NbThemeModule, NbStepperModule, NbCardModule, NbPopoverModule, NbButtonModule} from '@nebular/theme';

import { PagesComponent } from './pages.component';
import { WelcomeModule } from './welcome/welcome.module';
import { CookingModule } from './cooking/cooking.module';
import { SettingsModule } from './settings/settings.module';
import { PagesRoutingModule } from './pages-routing.module';
import { MaintenanceModule } from './maintenance/maintenance.module';

@NgModule({
  imports: [
    NbTabsetModule,
    NbLayoutModule,
    NbThemeModule,
    NbCardModule,
    NbPopoverModule,
    NbButtonModule,

    CommonModule,

    PagesRoutingModule,
    NbMenuModule,
    WelcomeModule,
    CookingModule,
    SettingsModule,   
    MaintenanceModule,
    NbStepperModule,    
  ],
  declarations: [
    PagesComponent,
  ],
})
export class PagesModule {
}
