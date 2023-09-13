import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'
import { Ng5SliderModule } from 'ng5-slider';
import { DataTablesModule } from 'angular-datatables';

import {
  NbThemeModule,
  NbActionsModule,
  NbButtonModule,
  NbCardModule,
  NbTabsetModule,
  NbUserModule,
  NbRadioModule,
  NbSelectModule,
  NbListModule,
  NbIconModule,
  NbLayoutModule,
  NbContextMenuModule,
  NbMenuModule,
  NbStepperModule,
  NbPopoverModule,
  NbCheckboxModule,
  NbDialogModule,
} from '@nebular/theme';

import { MaintenanceComponent } from './maintenance.component';

@NgModule({
  imports: [
    NbCardModule,
    NbUserModule,
    NbButtonModule,
    NbTabsetModule,
    NbActionsModule,
    NbRadioModule,
    NbSelectModule,
    NbListModule,
    NbIconModule,
    NbButtonModule,
    CommonModule,
    NbLayoutModule,
    NbContextMenuModule,
    NbMenuModule,
    NbStepperModule,
    NbPopoverModule,
    NbCheckboxModule,
    Ng5SliderModule,
    DataTablesModule,
    NbDialogModule.forChild(),
  ],
  declarations: [
    MaintenanceComponent
  ],
})
export class MaintenanceModule { }
