export interface Movie {
    id: number;
    title: string;
    year: number;
    imdbID: string;
    poster: string;
    rating: number;
}

export interface MovieList {
    id: number;
    name: string;
    movies: Movie[];
}
