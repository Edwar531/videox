import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GalleryService } from 'src/app/services/front/gallery.service';

@Component({
  selector: 'app-gallerry',
  templateUrl: './gallerry.component.html',
  styleUrls: ['./gallerry.component.css']
})
export class GallerryComponent implements OnInit {
  loading = true;
  galleries:any[];
  search:any;
tag:any;
  constructor(private GalleryS:GalleryService,private activatedR:ActivatedRoute) { }

  ngOnInit(): void {

    this.activatedR.queryParams.subscribe(params => {
      this.search = params.search;
      this.tag = params.tag;

      this.getGalleries(null,this.search);
    });
  }

  getGalleries(limit:any,search:any){
    this.loading = true;
    this.GalleryS.galleries(limit,search).subscribe( (data:any)=>{
      console.log(data);

      this.galleries = data.galleries;
      this.loading = false;
    })
  }
}
