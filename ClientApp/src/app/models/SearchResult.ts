// omdb results are unfortunately not camelCase;
// they will be mapped before being added to a movie list
interface MovieResult {
    Title: string;
    Year: string;
    imdbID: string;
    Poster: string;
}
  
interface SearchResult {
    Search: MovieResult[];
    totalResults: number;
    Response: boolean;
}

export { SearchResult };
export { MovieResult };