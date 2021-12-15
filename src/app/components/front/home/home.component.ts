import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { VideoService } from '../../../services/front/video.service';
import { GalleryService } from '../../../services/front/gallery.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  loading = true;
  sending = false;
  videos:any[];
  galleries:any[];
  tags:any[];
  constructor(private VideoS:VideoService,
    private activatedR:ActivatedRoute,
    private router:Router,
    private GalleryS:GalleryService) { }

  ngOnInit(): void {
    this.getVideos();
    this.getGalleries(6);
  }

  filterTag(tag_id){
    this.router.navigateByUrl("/videos?tag="+tag_id);
  }

  ngAfterViewInit(): void {
    this.loading = false;
  }

  getVideos(){
    this.sending = true;

    this.VideoS.videos("","",6).subscribe( (data:any)=>{
      console.log(data.search);
      this.videos = data.videos;
      this.tags = data.tags;
      this.sending = false;
    })
  }

  getGalleries(limit:any = ""){
    this.sending = true;
    this.GalleryS.galleries(limit,"").subscribe( (data:any)=>{
      console.log(data.search);
      this.galleries = data.galleries;
      // this.tags = data.tags;
      this.sending = false;
    })
  }
}
