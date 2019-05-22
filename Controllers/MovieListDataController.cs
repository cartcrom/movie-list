using System;
using System.Data;
using System.Data.SqlClient;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using movie_list.Models;

namespace movie_list.Controllers
{
    [Route("api/[controller]")]
    public class MovieListData : Controller
    {
        // Returns all movies lists in the database
        [HttpGet("[action]")]
        public IEnumerable<MovieList> GetUserLists()
        {
            List<MovieList> movieLists = new List<MovieList>();

            try
            {
                string cmd =
                    "select * " +
                    "from MovieLists ";

                SQL.ExecuteCommand(cmd, (SqlCommand command) => 
                {
                    using (SqlDataReader reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            Int32 listID = reader.GetInt32(0);
                            movieLists.Add(new MovieList {
                                id = listID,
                                name = reader.GetString(1),
                                movies = GetList(listID)
                            });
                        }
                    }
                });
                return movieLists;
            }
            catch (SqlException e)
            {
                Console.WriteLine(e.ToString());
                Console.ReadLine();

                return null;
            }
        }

        // Gets a specific list that matches input listID
        [HttpGet("[action]/{listID}")]
        public IEnumerable<Movie> GetList(int listID)
        {
            List<Movie> movies = new List<Movie>();
            try
            {
                // Uses joint table to find movies in a given list
                string cmd = 
                    "select MovieID, title, year, imdbID, poster, rating " +
                    "from MovieLists " +
                    "left join MovieListMovies " +
                    "on MovieListMovies.FK_ListID = MovieLists.ListID " +
                    "left join Movies " +
                    "on Movies.MovieID = MovieListMovies.FK_MovieID " +
                    "where ListID = @listID ";

                SQL.ExecuteCommand(cmd, (SqlCommand command) => 
                {
                    command.Parameters.Add("@listID", SqlDbType.Int).Value = listID;
                    using (SqlDataReader reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            if(!reader.IsDBNull(0))
                            {
                                movies.Add(new Movie {
                                id = reader.GetInt32(0),
                                title = reader.GetString(1),
                                year = reader.GetInt32(2),
                                imdbID = reader.GetString(3),
                                poster = reader.GetString(4),
                                rating = reader.GetInt32(5)
                                });
                            }
                        }
                    }
                });
                return movies;
            }
            catch (SqlException e)
            {
                Console.WriteLine(e.ToString());
                Console.ReadLine();

                return null;
            }
        }

        // Adds a new list with the name 'unnamed' to the table of movie lists
        [HttpPost("[action]")]
        public int CreateList()
        {
            int returnID = 0;
            try
            {
                // @@IDENTITY - The most recent ID creatied int the DB
                string cmd = 
                    "INSERT INTO MovieLists (name) " +
                    "values ('unnamed') " +
                    "SELECT CAST(@@IDENTITY AS INT) AS 'Identity' ";

                SQL.ExecuteCommand(cmd, (SqlCommand command) =>
                {
                    SqlDataReader reader = command.ExecuteReader();
                    if (reader.Read())
                    {
                        // Return newly created lists's ID
                        returnID = reader.GetInt32(0);
                    }
                    reader.Close();
                });
                 // Returning 0 signals insertion error;
                return returnID;
            }
            catch (SqlException e)
            {
                Console.WriteLine(e.ToString());
                Console.ReadLine();

                // Returning -1 signals error
                return -1;
            }
        }

        // Adds a movie to a list, creating a new movie item if this movie has not been uploaded before
        [HttpPost("[action]/{listID}")]
        public int AddToList([FromBody]Movie movie, int listID)
        {
            // TODO: Call OMDb API here to confirm that input movies imdbID is legitimate, else refuse insert
            // and return error.

            int returnID = 0;
            try
            {
                // Create a new joint table entry between input movie and input list.
                // If this table has not been seen before, create it into the movie table.
                string cmd = 
                    "IF NOT EXISTS (select 1 from Movies where imdbID = @imdbID) BEGIN " +
                    "INSERT INTO Movies (title, year, imdbID, poster, rating) " +
                    "values (@title, @year, @imdbID, @poster, @rating) " +
                    "SELECT CAST(@@IDENTITY AS INT) AS 'Identity' " +
                    "INSERT INTO MovieListMovies values (@listID, @@IDENTITY) END " +
                    "ELSE BEGIN " +
                    "INSERT INTO MovieListMovies values (@listID, (SELECT MovieID FROM Movies WHERE imdbID = @imdbID)) " +
                    "SELECT MovieID FROM Movies WHERE imdbID = @imdbID END ";

                SQL.ExecuteCommand(cmd, (SqlCommand command) =>
                {
                    command.Parameters.Add("@title", SqlDbType.VarChar, 50).Value = movie.title;
                    command.Parameters.Add("@year", SqlDbType.Int).Value = movie.year;
                    command.Parameters.Add("@imdbID", SqlDbType.VarChar, 9).Value = movie.imdbID;
                    command.Parameters.Add("@poster", SqlDbType.VarChar, 400).Value = movie.poster;
                    command.Parameters.Add("@rating", SqlDbType.Int).Value = movie.rating;
                    command.Parameters.Add("@listID", SqlDbType.Int).Value = listID;

                    SqlDataReader reader = command.ExecuteReader();
                    if (reader.Read())
                    {
                        // Return newly created movie's ID
                        returnID = reader.GetInt32(0);
                    }
                    reader.Close();
                });
                 // Returning 0 signals the movie was already in the list
                return returnID;
            }
            catch (SqlException e)
            {
                Console.WriteLine(e.ToString());
                Console.ReadLine();

                // Returning -1 signals error
                return -1;
            }
        }

        // Deletes a movie from a movie list, but the movie remains in the database for concurrent or later use.
        [HttpDelete("[action]/{movieID}/{listID}")]
        public int DeleteFromList(int movieID, int listID)
        {
            try
            {
                SQL.ExecuteCommand("DELETE FROM MovieListMovies WHERE FK_ListID = @listID and FK_MovieID = @movieID", 
                (SqlCommand command) => {
                    command.Parameters.Add("@listID", SqlDbType.Int).Value = listID;
                    command.Parameters.Add("@movieID", SqlDbType.Int).Value = movieID;
                    command.ExecuteReader();
                });
                return movieID;
            }
            catch (SqlException e)
            {
                Console.WriteLine(e.ToString());
                Console.ReadLine();
                return -1;
            }
        }

        // Changes the name of a list matching input ID
        [HttpPut("[action]/{newName}/{listID}")]
        public int ChangeListName(string newName, int listID)
        {
            // Return error if client is adding a name that is too short or too long
            if (newName.Length < 3 || newName.Length > 25)
                return 0;

            try
            {
                string cmd = "UPDATE MovieLists SET name = @newName where ListID = @ListID ";
                
                SQL.ExecuteCommand(cmd,
                (SqlCommand command) => {
                    command.Parameters.Add("@newName", SqlDbType.VarChar, 25).Value = newName;
                    command.Parameters.Add("@listID", SqlDbType.Int).Value = listID;
                    command.ExecuteReader();
                });
                return 1;
            }
            catch (SqlException e)
            {
                Console.WriteLine(e.ToString());
                Console.ReadLine();

                // Returning 0 signals error
                return 0;
            }
        }

        // Updates the rating of a movie matching the input ID with the input rating
        [HttpPut("[action]/{newRating}/{movieID}")]
        public int UpdateMovieRating(int newRating, int movieID)
        {
            try
            {
                string cmd = "UPDATE Movies SET rating = @newRating where MovieID = @MovieID ";
                
                SQL.ExecuteCommand(cmd,
                (SqlCommand command) => {
                    command.Parameters.Add("@newRating", SqlDbType.Int).Value = newRating;
                    command.Parameters.Add("@MovieID", SqlDbType.Int).Value = movieID;
                    command.ExecuteReader();
                });
                return 1;
            }
            catch (SqlException e)
            {
                Console.WriteLine(e.ToString());
                Console.ReadLine();

                // Returning 0 signals error
                return 0;
            }
        }

        // Static methods for previous http endpoints to call in order to access SQL data
        static class SQL
        {
            public static SqlConnection GetConnection() {
                SqlConnectionStringBuilder builder = new SqlConnectionStringBuilder();
                builder.DataSource = "movie-list.database.windows.net"; 
                builder.UserID = "cartercromer";            
                builder.Password = "Patience!";     
                builder.InitialCatalog = "movie-list";

                return(new SqlConnection(builder.ConnectionString));
            }

            // Rather than repeating the connection and command code, this method is called to initialize
            // connection and command, and then returns control to caller via input callback function
            public static void ExecuteCommand(string sql, Action<SqlCommand> callback) {
                using (SqlConnection connection = GetConnection())
                {
                    connection.Open();       
                    using (SqlCommand command = new SqlCommand(sql, connection))
                        callback(command);
                    
                }
            }
        }
    }
}
