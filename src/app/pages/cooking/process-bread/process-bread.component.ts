import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-process-bread',
  templateUrl: './process-bread.component.html',
  styleUrls: ['./process-bread.component.scss']
})
export class ProcessBreadComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    setTimeout(function(){
       console.log("TOASTING"); 
       setTimeout(function(){
          console.log("TOPPING"); 
          setTimeout(function(){
            console.log("FINISH"); 
          }, 3000); //TOASTING
        }, 3000);//topping
      }, 6000);//finish
          
    
  }

}
