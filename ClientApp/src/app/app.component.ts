import { Component, OnInit } from '@angular/core';
import { MovieListDataService } from './movie-list/movie-list-data.service';
import { MovieList } from './models/Movie';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'movie-list';

  movieLists: MovieList[];
  currentList: MovieList;
  listNames = [];

  constructor(private data: MovieListDataService) {}

  ngOnInit(): void {
    this.data.getLists().subscribe(result => {
      this.movieLists = result;
      this.currentList = this.movieLists[0];

      this.movieLists.forEach(x => {
        this.listNames.push(x.name);
      });

    }, error => console.error(error));
  }

  changeList(i: number) {
    this.currentList = this.movieLists[i];
  }

  createList() {
    this.data.createList().subscribe(result => {

      if (result > 0) {
        this.movieLists.push(<MovieList> {id: result, name: 'unnamed', movies: []});
        this.currentList = this.movieLists[this.movieLists.length - 1];
        this.listNames.push(this.currentList.name);
      }
      else {
        alert('List Creation Error');
      }
    });
  }
}
