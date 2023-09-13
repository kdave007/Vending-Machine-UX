import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-nutrition-facts',
  templateUrl: './nutrition-facts.component.html',
  styleUrls: ['./nutrition-facts.component.scss']
})
export class NutritionFactsComponent implements OnInit {
  @Input('flavoursInput') flavour:any;

  constructor() { }

  ngOnInit() {
  }

}
