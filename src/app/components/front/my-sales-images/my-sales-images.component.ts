import { Component, OnInit } from '@angular/core';
import { GalleryService } from '../../../services/front/gallery.service';
import { Gallery } from '../../../models/gallery.model';


import { User } from '../../../models/user.model';
import { AuthService } from 'src/app/services/front/auth.service';

@Component({
  selector: 'app-my-sales-images',
  templateUrl: './my-sales-images.component.html',
  styleUrls: ['./my-sales-images.component.css']
})
export class MySalesImagesComponent implements OnInit {
  sending = false;
  loading = true;
  galleries:any = [];
  userAuth:User;
  constructor(private galleryS:GalleryService,
    private auth:AuthService) { }

  ngOnInit(): void {
    this.userAuth = this.auth.getAuth();
    this.getGalleries();
  }

  getGalleries(){
    this.galleryS.galleriesUser(this.userAuth.id).subscribe((data:any)=>{
      this.galleries = data;
      this.loading = false;
    })
  }
}
