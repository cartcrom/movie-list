import { Component, Inject, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { MovieListDataService } from './movie-list-data.service';
import { HttpHeaders } from '@angular/common/http';
import { Movie, MovieList } from '../models/Movie';

@Component({
  selector: 'app-movie-list',
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.css'],
})

export class MovieListComponent implements OnInit {

  @Input() list: MovieList;
  @ViewChild('searchBox') searchBox: ElementRef;
  @ViewChild('posterBox') posterBox: ElementRef;
  @ViewChild('confirmName') confirmName: ElementRef;
  currentMovieIndex = 0;

  constructor(private data: MovieListDataService) {}

  ngOnInit(): void {}

  public addMovie(movie: Movie) {
    if (movie == null) {
      alert("INVALID MOVIE");
      return;
    }

    this.closeSearch();
    this.data.addMovie(movie, this.list.id).subscribe(result => {
      // Do not add if return ID is 0 (already in list) or -1 (error)
      if (result > 0) {
        // Newly added movie's ID is returned by server.
        movie.id = result;
        this.list.movies.push(movie);
      }
    }, error => console.error(error));
  }

  public changeName() {

    if (this.list.name.length < 3 || this.list.name.length > 25) {
      alert('Name must be no smaller than 3 characters and no longer than 25 characters');
      return;
    }

    this.data.changeName(this.list.name,  this.list.id).subscribe(result => {
      if (!result)
        alert("Name Change Error");
      this.hideConfirm();
    }, error => console.error(error));
  }

  public updateRating(rating: number, movieID: number) {

    if (rating < 0 || rating > 5) {
      alert('Rating Range Error');
      return;
    }

    this.data.updateRating(rating, movieID).subscribe(result => {
      if (!result)
        alert("Rating Change Error");
    }, error => console.error(error));
  }

  public deleteMovie(i: number) {
    this.data.deleteMovie(this.list.movies[i].id, this.list.id).subscribe(result => {
      this.list.movies.splice(i, 1);
    }, error => console.error(error));
  }

  public showSearch() {
    this.searchBox.nativeElement.style.display = 'block';
  }

  public showPoster(i: number) {
    this.currentMovieIndex = i;
    this.posterBox.nativeElement.style.display = 'block';
  }

  public closeSearch() {
    this.searchBox.nativeElement.style.display = 'none';
  }

  public closePoster() {
    this.posterBox.nativeElement.style.display = 'none';
  }

  public showConfirm() {
    this.confirmName.nativeElement.style.display = 'inline';
  }

  public hideConfirm() {
    this.confirmName.nativeElement.style.display = 'none';
  }
}
