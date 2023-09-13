import {Component, OnInit, OnDestroy} from '@angular/core';
import { Router }                     from '@angular/router';
import { Subscription }               from 'rxjs';

import { GlobalTomDataService } from '../../services/global-tom-data.service';
import {TomData}                from '../../core/templates/main';


@Component({
  selector: 'app-settings',
  styleUrls: ['./settings.component.scss'],
  templateUrl: './settings.component.html',
})

export class SettingsComponent implements OnInit,OnDestroy {  
  tomObject;
  subscription : Subscription;

  constructor(private tomService : GlobalTomDataService,private router: Router) { }

  ngOnInit() {
   // this.tomObject = new TomData();
    this.subscription = this.tomService.cast.subscribe(tomSubject => {
      //console.log("settings tom : ",tomSubject)
      this.tomObject = tomSubject;
    });
  }

  cookingRoute(){
    //console.log("routing to cooking");
    this.router.navigate(['/pages/cooking']);
   // console.log("cooking changed randomValue to 2");
    this.tomObject.randomValue = "2";
    this.tomService.updateTom(this.tomObject);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
