import { NgModule }     from '@angular/core';
import { CommonModule } from '@angular/common'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';

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
} from '@nebular/theme';

import { SettingsComponent } from './settings.component';
import { FeaturesComponent } from './views/features/features.component';
import { PaymentComponent }  from './views/payment/payment.component';
import { AdsComponent }      from './views/ads/ads.component';
import { NutritionFactsComponent} from './views/features/nutrition-facts/nutrition-facts.component';

@NgModule({
  imports: [
   // NbThemeModule.forRoot({ name: 'default' }),
    NbCardModule,
    NbUserModule,
    NbButtonModule,
    NbTabsetModule,
    NbActionsModule,
    NbRadioModule,
    NbSelectModule,
    NbListModule,
    NbIconModule,
    CommonModule,
    NbLayoutModule,
    NbContextMenuModule,
    NbMenuModule,
    NbStepperModule,
    NbPopoverModule    
  ],
  declarations: [
    SettingsComponent,
    FeaturesComponent,
    PaymentComponent,
    AdsComponent,
    NutritionFactsComponent
  ],
})
export class SettingsModule { }
