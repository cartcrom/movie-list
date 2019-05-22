import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SearchResult } from '../models/SearchResult';

@Injectable({
  providedIn: 'root'
})

export class SearchService {
  clientID = '74129dea';
  baseUrl: string = 'https://www.omdbapi.com/?plot=full&type=movie&apikey=' + this.clientID + '&s=';
  constructor(private http: HttpClient) {}

  public search(queryString: string): Observable<SearchResult>{
    return this.http.get<SearchResult>(this.baseUrl + queryString);
  }
}
