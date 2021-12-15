import { Component, OnInit } from '@angular/core';

import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/front/auth.service';
import { VideoService } from 'src/app/services/front/video.service';
import { InterpretFormRespService } from '../../../services/interpret-form-resp.service';


@Component({
  selector: 'app-my-sales',
  templateUrl: './my-sales.component.html',
  styleUrls: ['./my-sales.component.css']
})
export class MySalesComponent implements OnInit {
  userAuth:User;
  sending = false;
  loading = true;
  videos;
  constructor(private videosS:VideoService,
    private auth:AuthService,
    private InterpretResp:InterpretFormRespService,
    ) { }

  ngOnInit(): void {
    this.userAuth = this.auth.getAuth();
    this.getVideos();
  }

  getVideos(){
    this.videosS.videosUser(this.userAuth?.id).subscribe((resp: any) => {
      this.videos = resp;
      this.loading = false;
    }, err => {
      this.InterpretResp.error(err,"");
      this.loading = false;
    });
  }

}
