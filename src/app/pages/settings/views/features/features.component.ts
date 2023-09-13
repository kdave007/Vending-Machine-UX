import { Component, OnInit, OnDestroy } from '@angular/core';
import { GlobalTomDataService } from '../../../../services/global-tom-data.service';
import { Subscription } from 'rxjs';

import {FLAVOURS} from '../../../../core/mock/flavours';
import {TOASTED}  from '../../../../core/mock/toasted-levels';
import {TomData, SLICES} from '../../../../core/templates/main';
import {FlavourList} from '../../../../core/templates/flavour';
import {TEXT} from './language/mock';

import {Toasted_List} from "../../../../core/templates/toasted";

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss']
})
export class FeaturesComponent implements OnInit, OnDestroy {
  flavours = FLAVOURS;
  toasted  = TOASTED;
  translate = TEXT;
  flavour;

  subscription : Subscription;
  randomV = 100;
  tomObject: TomData;

  constructor(private tomService : GlobalTomDataService) { }

  ngOnInit() {
    this.subscription = this.tomService.cast.subscribe(tomSubject => {
      this.tomObject=tomSubject;
    });
  }

  ngAfterViewInit() {
    this.setDefault();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  setDefault(){

    // Default toast level
    let elementToastLv = document.getElementById( Toasted_List.Toasted_M.toString() );
    elementToastLv.classList.toggle("card-selected");
  }

  clickedTopping(toppingId){
    let element: any = document.getElementById(toppingId);
    let validTopping: boolean = false;

    for (let sliceIndex = 0; sliceIndex < SLICES.SLICES_MAX ; sliceIndex++) {

      for (let flavourIndex = 0; flavourIndex < this.tomObject.slice[sliceIndex].flavour.maxFlavours; flavourIndex++) {
        
        if(this.tomObject.slice[sliceIndex].flavour.flavours[flavourIndex].id == toppingId){
          this.tomObject.slice[sliceIndex].flavour.flavours[flavourIndex].id = FlavourList.Flavour_NA;
          validTopping = true;
          break;
        }
        else if(this.tomObject.slice[sliceIndex].flavour.flavours[flavourIndex].id == FlavourList.Flavour_NA){
          this.tomObject.slice[sliceIndex].flavour.flavours[flavourIndex].id = toppingId;
          validTopping = true;
          break;
        }
      }
    }

    if(validTopping){
      element.classList.toggle("card-selected");
      this.tomService.updateTom(this.tomObject);
    }
  }

  clickedToastLevel(levelId){
    for (let toast of this.toasted) {
      let element = document.getElementById( toast.info.id.toString() );
      
      if(element.classList.contains("card-selected")){
        element.classList.remove("card-selected");
      }
    }    

    let element = document.getElementById( levelId );
    element.classList.toggle("card-selected");

    for (let sliceIndex = 0; sliceIndex < SLICES.SLICES_MAX; sliceIndex++) {
      this.tomObject.slice[sliceIndex].toasted.id = levelId;
    }

    this.tomService.updateTom(this.tomObject);
  }
}
