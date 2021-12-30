import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/front/home/home.component';
import { MyAccountComponent } from './components/front/my-account/my-account.component';
import { MySalesImagesComponent } from './components/front/my-sales-images/my-sales-images.component';
import { MySalesComponent } from './components/front/my-sales/my-sales.component';
import { MyShoppingComponent } from './components/front/my-shopping/my-shopping.component';
import { AddGalleryComponent } from './components/front/add-gallery/add-gallery.component';
import { AddVideoComponent } from './components/front/add-video/add-video.component';
import { WatchVideoComponent } from './components/front/watch-video/watch-video.component';
import { VideosComponent } from './components/front/videos/videos.component';
import { GallerryComponent } from './components/front/gallerry/gallerry.component';
import { CompleteDataComponent } from './components/front/complete-data/complete-data.component';
import { WatchGalleryComponent } from './components/front/watch-gallery/watch-gallery.component';


const routes: Routes = [
  { path: '', pathMatch: 'full', component:HomeComponent },
  { path: 'videos', pathMatch: 'full', component:VideosComponent },
  { path: 'galeria-de-fotos', pathMatch: 'full', component:GallerryComponent },
  { path: 'mi-cuenta', pathMatch: 'full', component:MyAccountComponent },
  { path: 'completar-datos', pathMatch: 'full', component:CompleteDataComponent },
  { path: 'mis-compras', pathMatch: 'full', component:MyShoppingComponent },
  { path: 'mis-ventas/videos', pathMatch: 'full', component:MySalesComponent },
  { path: 'mis-ventas/videos/agregar-nuevo', pathMatch: 'full', component:AddVideoComponent },
  { path: 'mis-ventas/videos/editar/:id', pathMatch: 'full', component:AddVideoComponent },
  { path: 'mis-ventas/galeria-de-fotos', pathMatch: 'full', component:MySalesImagesComponent },
  { path: 'mis-ventas/galeria-de-fotos/agregar-galeria', pathMatch: 'full', component:AddGalleryComponent },
  { path: 'mis-ventas/galeria-de-fotos/editar-galeria/:id', pathMatch: 'full', component:AddGalleryComponent },
  { path: 'ver-video/:slug', pathMatch: 'full', component:WatchVideoComponent },
  { path: 'ver-galeria/:id', pathMatch: 'full', component:WatchGalleryComponent },

  { path: '**', pathMatch: 'full', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled',initialNavigation: 'enabled' })],
  exports: [RouterModule]
})

export class AppRoutingModule { }
