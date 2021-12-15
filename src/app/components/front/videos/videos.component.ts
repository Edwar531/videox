import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VideoService } from 'src/app/services/front/video.service';

@Component({
  selector: 'app-videos',
  templateUrl: './videos.component.html',
  styleUrls: ['./videos.component.css']
})

export class VideosComponent implements OnInit {
  loading = false;
  sending = false;
  videos:any[];
  tags:any[];
  search;
  tag;

  constructor(private VideoS:VideoService,
    private activatedR:ActivatedRoute,
    private router:Router,) { }

  ngOnInit(): void {
    this.activatedR.queryParams.subscribe(params => {
      this.search = params.search;
      this.tag = params.tag;

      if(this.search){
        this.getVideos("search",this.search);
      }else if(this.tag){
        this.getVideos("tag",this.tag);
      }else{
        this.getVideos("","");
      }
    });
  }

  getVideos(typeFilter:string,search:any=""){
    this.sending = true;
    this.VideoS.videos(typeFilter,search).subscribe( (data:any)=>{
      console.log(data);

      this.videos = data.videos;
      this.tags = data.tags;
      this.sending = false;
    })
  }

  filterTag(tag_id){
    this.router.navigateByUrl("/videos?tag="+tag_id);
  }
}
