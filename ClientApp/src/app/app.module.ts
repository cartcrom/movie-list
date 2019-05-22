import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { MovieListComponent } from './movie-list/movie-list.component';
import { MovieListDataService } from './movie-list/movie-list-data.service';
import { SearchComponent } from './search/search.component';
import { RatingComponent } from './rating/rating.component';

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    MovieListComponent,
    SearchComponent,
    RatingComponent
  ],
  imports: [
    NgbModule,
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [MovieListDataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
