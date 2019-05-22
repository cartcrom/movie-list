import { Component, Output, OnInit, EventEmitter } from '@angular/core';
import { SearchService } from './search.service';
import { FormControl } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { debounceTime } from 'rxjs/operators';
import { distinctUntilChanged } from 'rxjs/operators';
import { switchMap } from 'rxjs/operators';
import { Movie } from '../models/Movie';
import { SearchResult } from '../models/SearchResult';
import { MovieResult } from '../models/SearchResult';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})

export class SearchComponent implements OnInit {
  results: any[] = [];
  searchField: FormControl = new FormControl();

  // Emits the selected movie once enter is pressed.
  @Output() onComplete: EventEmitter<Movie> = new EventEmitter();

  constructor(private searchService: SearchService) {}

  ngOnInit() {
    this.searchField.valueChanges
    .pipe(
      // Ignores input less than 3 characters long
      filter(query => query.length > 2),
      // Waits for 200ms pause
      debounceTime(200),
      // Ignores duplicate values
      distinctUntilChanged(),
      // Cancels previous requests & switches if an updated value comes through
      switchMap(query => this.searchService.search(query))
    )
    .subscribe((response: SearchResult) => this.parseResponse(response));
  }

  // Maps a MovieResult object, (no camelcase), to a Movie object (camelcase)
  mapResult(result: MovieResult): Movie {
    return <Movie> {id: -1, title: result.Title, year: parseInt(result.Year), imdbID: result.imdbID, poster: result.Poster, rating: -1 };
  }

  // Discards empty results and fixes issues with poster URLs
  parseResponse(results: SearchResult): void {
    this.results = [];
    // If no results were found, return.
    if (results.Response === false)
      return;

    // Display no more than 8 results
    for (let i = 0; i <= 8 && i < results.totalResults; i++) {
      // OMDb returns 'N/A' if there is no movie poster available
      if (results.Search[i].Poster === 'N/A')
        results.Search[i].Poster = '../assets/empty-poster.png'; // Use default if no poster is available
      else if (results.Search[i].Poster.substr(4,1) != 's')
        results.Search[i].Poster = results.Search[i].Poster.replace('http:','https:'); // Use https instead of http
      this.results.push(results.Search[i]);
    }
  }

  selectResult(i: number) {
    // Map MovieResult object to normal Movie object and then emit it to movie list
    this.onComplete.emit(this.mapResult(this.results[i]));
    // Reset search field & list for next entry
    this.searchField.patchValue('');
    this.results = [];
  }
}
