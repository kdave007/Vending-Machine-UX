import { Component, OnInit, OnDestroy } from '@angular/core';
import { GlobalTomDataService } from '../../../../services/global-tom-data.service';
import { Subscription } from 'rxjs';

import * as $ from 'jquery';

@Component({
  selector: 'app-ads',
  templateUrl: './ads.component.html',
  styleUrls: ['./ads.component.scss']
})
export class AdsComponent implements OnInit, OnDestroy {

  subscription : Subscription;
  tomObject;

  constructor(private tomService : GlobalTomDataService) { }

  ngOnInit() {
    this.subscription = this.tomService.cast.subscribe(tomSubject => this.tomObject = tomSubject);

    $(function() {
      var $videos = $("#playlist li");
      var $video = $("#videoarea");
      var current = 0;
      var max = 7;
      
      function playVideo(video) {
          current = elIndex($videos, video);
          if (current == undefined) {
              return false;
          }
          $video.attr({
              "src": $(video).attr("movieurl"),
              "autoplay": "autoplay",
              "type": "video/mp4",
          })
      }
      
      $video.attr({
          "src": $videos.eq(current).attr("movieurl"),
          "autoplay": "autoplay",
          "type": "video/mp4",
      })
      
      $video.on('ended', function () {
        setTimeout(function(){
          if (current == max) {
            playVideo($videos[0]);
          } else {
            playVideo($videos[current + 1]);
          }
        }, 500);
      });
      
      function elIndex(parent, el) {
          for (var i = 0; i < parent.length; i += 1) {
              if (parent[i] === el) {
                return i;   
              }
          }
          
          return null;
      }
    })
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
