import { Component } from '@angular/core';

@Component({
  selector: 'app-pages',
  styleUrls: ['pages.component.scss'],
  templateUrl: './pages.component.html',
})
export class PagesComponent {

  /**
   * @brief
   *  Set GUI language 
   * 
   * @param id 
   */
  setLanguage(){
    console.log("id");
  }
}
