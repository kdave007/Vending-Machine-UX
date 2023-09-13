import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { GlobalTomDataService } from '../../../../services/global-tom-data.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

import * as eva from 'eva-icons';
import * as $ from 'jquery';

import Keyboard from 'simple-keyboard';

@Component({
  selector: 'app-payment',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit,OnDestroy {
  subscription : Subscription;
  tomObject;

  value = "";
  keyboard: Keyboard;
  
  constructor(private router: Router, private tomService : GlobalTomDataService) { }

  ngOnInit() {
   
    this.subscription =this.tomService.cast.subscribe(tomSubject => {
      this.tomObject=tomSubject;
    });

    eva.replace({
      width:20,
      height:20
    });

    let self = this;

        // Payment button
        $(function() {
          var btn = $(".pay-btn");
          
          btn.on("click", function() {
            
            $(this).addClass('pay-btn-progress');
            setTimeout(function() {
              btn.addClass('pay-btn-fill')
            }, 500);
            
            setTimeout(function() {
              btn.removeClass('pay-btn-fill')
            }, 4100);
            
            setTimeout(function() {
              btn.addClass('pay-btn-complete');
    
              setTimeout(function() {
                self.router.navigate(['/pages/cooking']);
              },2000);
    
            }, 4100);
          
          });
        })
  }

  ngAfterViewInit() {
    this.keyboard = new Keyboard({
      onChange: input => this.onChange(input),
      onKeyPress: button => this.onKeyPress(button),
      layout: {
        'default': [
          '0 1 2 3 5 6 7 8 9 a b c d e f',
          'g h i j k l m n o p q r s t u',
          'v w x y z {bksp} {enter}'
        ]
      },
      maxLength: 20,
      display: {
        '{bksp}': 'delete',
        '{enter}': 'enter',
      }
    });
  }
  onChange = (input: string) => {
    this.value = input;
    //console.log("Input changed", input);
  };

  onKeyPress = (button: string) => {
    //console.log("Button pressed", button);

    /**
     * If you want to handle the shift and caps lock buttons
     */
    if (button === "{shift}" || button === "{lock}") this.handleShift();
  };

  onInputChange = (event: any) => {
    this.keyboard.setInput(event.target.value);
  };

  handleShift = () => {
    let currentLayout = this.keyboard.options.layoutName;
    let shiftToggle = currentLayout === "default" ? "shift" : "default";

    this.keyboard.setOptions({
      layoutName: shiftToggle
    });
  };

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}