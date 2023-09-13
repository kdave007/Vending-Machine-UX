import { NgModule } from '@angular/core';
import { RouterModule, Routes } from "@angular/router";
import {
  NbActionsModule,
  NbButtonModule,
  NbCardModule,
  NbTabsetModule,
  NbUserModule,
  NbRadioModule,
  NbSelectModule,
  NbListModule,
  NbIconModule,
} from '@nebular/theme';

import { CookingComponent } from './cooking.component';
import { InsertBreadComponent } from './insert-bread/insert-bread.component';
import { ProcessBreadComponent } from './process-bread/process-bread.component';
import { BreadReadyComponent } from './bread-ready/bread-ready.component';

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
    RouterModule
  ],
  declarations: [
    CookingComponent,
    InsertBreadComponent,
    ProcessBreadComponent,
    BreadReadyComponent,
  ],
})
export class CookingModule { }
