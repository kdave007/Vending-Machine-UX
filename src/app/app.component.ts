import { Component, OnInit } from '@angular/core';
import { GlobalTomDataService } from './services/global-tom-data.service';
import { LANGUAGES } from "./core/mock/language";

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  styleUrls: ['app.component.scss'],
  templateUrl: './app.component.html',
})
export class AppComponent {  
  languages = LANGUAGES;
  tomObject: any;
  
  subscription : Subscription;
  
  title = 'TOM';

  constructor(private tomService : GlobalTomDataService){    
  }

  ngOnInit(){
    this.subscription = this.tomService.cast.subscribe(tomSubject => this.tomObject = tomSubject);
    this.tomObject.randomValue=15;
    this.tomService.updateTom(this.tomObject);
  }

  //ngAfterContentInit(){
    //if (this.isElectron) {
      //var self = this;

      /*
      this.port.on('readable', function () {
        console.log('Data1:', self.port.read());
      })*/

      
      
    //}
  //}

  setLanguage(lang: any){
    this.tomObject.language = lang;
  }
}
