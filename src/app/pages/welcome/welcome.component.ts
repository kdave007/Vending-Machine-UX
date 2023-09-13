import {Component, OnInit, OnDestroy} from '@angular/core';
import { Router } from '@angular/router';
import { GlobalTomDataService } from '../../services/global-tom-data.service';
import { Subscription } from 'rxjs';

import { TRANSLATE } from './language/mock';

@Component({
  selector: 'app-welcome',
  styleUrls: ['./welcome.component.scss'],
  templateUrl: './welcome.component.html',
})

export class WelcomeComponent implements OnInit,OnDestroy {
  tomObject: any;
  
  subscription : Subscription;
  
  text = TRANSLATE;

  constructor(private router: Router,private tomService : GlobalTomDataService) { }

  ngOnInit() {
    this.tomService.cast.subscribe( tomSubject => { 
      this.tomObject=tomSubject;
    });
    //console.log("im welcome component",this.tomObject.randomValue);

    //console.log(this.tomObject.language);
    //console.log(TRANSLATE.welcomeMsg[0].lang);
    //console.log(TRANSLATE.welcomeMsg[1].lang);
  }

  

  /**
   * @brief
   *  Show muffin settings
   */
  showSettings(){
    this.router.navigate(['/pages/settings']);
  }

  ngOnDestroy(): void{
    //this.subscription.unsubscribe();
  }
  
}
