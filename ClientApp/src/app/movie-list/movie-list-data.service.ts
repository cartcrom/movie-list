import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Movie, MovieList } from '../models/Movie';
import { Observable } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

@Injectable({
    providedIn: 'root'
})

// Provides AppComponent and MovieListComponent with methods to access/edit server data
export class MovieListDataService {
  private dataUrl: string;

  constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
    this.dataUrl = baseUrl + 'api/MovieListData/';
  }

  public getLists(): Observable<MovieList[]> {
    return this.http.get<MovieList[]>(this.dataUrl + 'GetUserLists/');
  }

  public createList(): Observable<number> {
    return this.http.post<number>(this.dataUrl + 'CreateList/', httpOptions);
  }

  public addMovie(movie: Movie, listID: number) {
    return this.http.post<number>(this.dataUrl + 'AddToList/' + listID, movie, httpOptions);
  }

  public changeName(listName: string, listID: number) {
    return this.http.put<number>(this.dataUrl + 'ChangeListName/' + listName + '/' + listID, { data: null }, httpOptions);
  }

  public updateRating(rating: number, movieID: number) {
    return this.http.put<number>(this.dataUrl + 'UpdateMovieRating/' + rating + '/' + movieID, { data: null }, httpOptions);
  }

  public deleteMovie(movieID: number, listID: number) {
    return this.http.delete<number>(this.dataUrl + 'DeleteFromlist/' + movieID + '/' + listID, httpOptions);
  }
}
