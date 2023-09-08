
import { useEffect, useState } from "react";
import StarRating from "./StarRating";
import axios from "axios";

const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "cd7e5882"
export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  // prop drilling => is to bath props lifting up upon the tree component we use component composition to solve this problem
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  // this empty array that means the effect we just specified here will only run on mount 

  // useEffect(function(){
  //   fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=interstellar`)
  //   .then(res => res.json())
  //   .then((data) => setMovies(data.Search))
  // },[])

  function handleSelectMovie(id) {
    setSelectedId(selectedId => id === selectedId ? null : id)
  }

  function handleCloseMovie() {
    setSelectedId(null)
  }
  function handleAddWatched(movie) {
    setWatched(watched => [...watched, movie])
  }
function handleDeleteWatched(id){
  setWatched((watched) => watched.filter(movie => movie.imdbID !== id ))
}



  useEffect(function () {
    const controller = new AbortController()
    async function fetchMovies() {
      try {
        setIsLoading(true)
        setError('')
        const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,{signal:controller.signal})
        if (!res.ok) throw new Error('Something went wrong with fetching movies')
        const data = await res.json()
        if (data.Response === "false") throw new Error('movie not found')
        setMovies(data.Search)
        setError('')
      } catch (err) {
        
        if(err.name !== "AbortErroe"){
          setError(err.message)
          console.log(err.message)
        }
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    if (query.length < 3) {
      setMovies([])
      setError('')
      return
    }
    handleCloseMovie()
    fetchMovies()

    return function (){
      controller.abort()
    }
  }, [query])




  /*the same code using axios
  useEffect(function(){
    axios.get(`http://www.omdbapi.com/?apikey=${KEY}&s=interstellar`)
    .then(res => res.data)
    .then((data) => setMovies(data.Search))
  },[])*/



  return (
    <>
      <NavBar >
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main >
        {/* explicit prop anther solotion as component composition required to pass element as a prop
      <Box movies={movies} element ={<MovieList movies={movies}/>}/>  */}
        <Box movies={movies}>
          {/* {isLoading? <Loader/>:<MovieList movies={movies}/>} */}
          {isLoading && <Loader />}
          {!isLoading && !error && <MovieList movies={movies} onSelectMovie={handleSelectMovie} />}
          {error && <ErrorMessage message={error} />}
        </Box>
        {/* <WatchedBox/> */}
        <Box movies={movies}>
          {selectedId ? <MovieDetails selectedId={selectedId} onCloseMovie={handleCloseMovie} onAddWatched={handleAddWatched} watched={watched} /> :
            <> <WatchedSummary watched={watched} />
              <ul className="list">
                {watched.map((movie) => (
                  <WatchedMovieList movie={movie} key={movie.imdbID} onDelete={handleDeleteWatched}/>
                ))}
              </ul>
            </>}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return (
    <p className="loader">loading ...</p>
  )
}
function ErrorMessage({ message }) {
  return (
    <p className="error"><span>⛔</span>{message}</p>
  )
}
function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  )
}
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  )
}

function Search({ query, setQuery }) {

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  )
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  )
}



function Main({ children }) {

  return (
    <main className="main">
      {children}
    </main>
  )
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && (
        children
      )}
    </div>
  )
}


function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  )
}
function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  )
}

function MovieDetails({ selectedId, onCloseMovie,onAddWatched,watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState('');
  const isWatched = watched.map(movie => movie.imdbID).includes(selectedId);
  const watchedUserRating  = watched.find(movie => movie.imdbID === selectedId)?.userRating;
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
    };
    onAddWatched(newWatchedMovie)
    onCloseMovie()
  }

  useEffect(function () {
    async function getMovieDetails() {
      setIsLoading(true)
      const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`)
      const data = await res.json()
      setMovie(data)
      setIsLoading(false)
    }
    getMovieDetails()
  }, [selectedId])



useEffect(function(){
  if(!title) return;
  document.title =`Movie | ${title}`;
    // clean up function 
  return function(){
    document.title = 'UsePopcorn';
    /*closure in javascript means that th function will
    remember all the variables that present at the time
    and the place data function was created*/

    // console.log(`clean up effect for movie ${title}`)
  }
},[title])


// closing by the escape key
useEffect(
  function(){

    function callback(e){
      if(e.code === "Escape"){
        onCloseMovie()
      }
    }

  document.addEventListener('keydown',callback)
  // cleanup 
  return function(){
    document.addEventListener('keydown',callback)
  }
},[onCloseMovie])

  return (
    <div className="details">
      {isLoading ? <Loader /> :
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>&larr;</button>
            <img src={poster} alt={`Poster of ${movie} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>{released} &bull; {runtime}</p>
              <p>{genre}</p>
              <p><span>⭐</span>{imdbRating} IMDB Rating</p>
            </div>
          </header>
          <section>
            <div className="rating">
            {!isWatched ? (
                <>
                  <StarRating
                    maxStar={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to list
                    </button>
                  
                </>
              ) : (
                <p>
                  You rated with movie {watchedUserRating}<span>⭐️</span>
                </p>
              )}
            </div>
            <p><em>{plot}</em></p>
            <p>Starring {actors}</p>
            <p>Directed By {director}</p>
          </section></>}
    </div>
  )
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  )
}
function WatchedMovieList({ movie ,onDelete}) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button className="btn-delete" onClick={()=> onDelete(movie.imdbID)}> x</button>
      </div>
    </li>
  )
}