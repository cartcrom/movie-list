using System;
using System.Collections.Generic;

namespace movie_list.Models
{
    public class Movie
    {
        public int id { get; set; }
        public string title { get; set; }
        public int year { get; set; }
        public string imdbID { get; set; }
        public string poster { get; set; }
        public int rating { get; set; }
    }

    public class MovieList
    {
        public int id { get; set; }
        public string name { get; set; }
        public IEnumerable<Movie> movies { get; set; }
    }
}