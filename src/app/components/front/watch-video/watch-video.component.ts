import { Component, OnInit } from '@angular/core';
import { Video } from '../../../models/video.model';
import { VideoService } from '../../../services/front/video.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-watch-video',
  templateUrl: './watch-video.component.html',
  styleUrls: ['./watch-video.component.css']
})

export class WatchVideoComponent implements OnInit {
  video:Video;
  loading = true;
  sending = false;
  constructor(private videoS: VideoService,
              private ActivatedR: ActivatedRoute,
              private router: Router,


  ) { }

  ngOnInit(): void {
    this.getVideo();
  }

  getVideo(){
    let id = this.ActivatedR.snapshot.paramMap.get('id');
    this.videoS.getVideo(id).subscribe((data:any) => {
      this.video = data;
      this.loading = false;
    })
  }

  filterTag(tag_id){
    this.router.navigateByUrl("/videos?tag="+tag_id);
  }
}
