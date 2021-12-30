import { Component, OnInit } from '@angular/core';
import { GalleryService } from 'src/app/services/front/gallery.service';
import { Gallery } from '../../../models/gallery.model';

@Component({
  selector: 'app-watch-gallery',
  templateUrl: './watch-gallery.component.html',
  styleUrls: ['./watch-gallery.component.css']
})
export class WatchGalleryComponent implements OnInit {

  constructor(
    private galleryS:GalleryService
  ) { }

  ngOnInit(): void {

  }

  getGallery(){
    this.galleryS.getGallery('lana-ivans').subscribe( (data:any)=>{
      console.log(data);
      
    })
  }

}
