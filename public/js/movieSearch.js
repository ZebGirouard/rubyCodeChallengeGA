// Make sure page is fully loaded before script
document.addEventListener("DOMContentLoaded", function(event) {
    
    var apiCall = function(titleOrAll) {
        var xhr = new XMLHttpRequest();
        if (titleOrAll === "allMovies") {
            // Get search text from text box
            var movieSearchQuery = encodeURIComponent(document.getElementById('movieSearchText').value);
            xhr.open("GET", "https://www.omdbapi.com/?type=movie&s="+movieSearchQuery, true);
        }
        else {
            var movieTitleQuery = titleOrAll;
            xhr.open("GET", "https://www.omdbapi.com/?type=movie&t="+movieTitleQuery, true);   
        }
        xhr.onload = function (event) {
            if (xhr.readyState == 4 && xhr.status == 200) {
                // Successfull API Response  
                var noMoviesFound = JSON.parse(xhr.responseText).Error;
                var multipleMovieResults = JSON.parse(xhr.responseText).Search;
                // Print an error if no movies found...
                if (noMoviesFound) {
                    printAllMovies([{Title: noMoviesFound}]);
                }
                // an array if searching for many...
                else if (multipleMovieResults) {
                    printAllMovies(multipleMovieResults);
                }
                // and single object if searching for one.
                else {
                    var singleMovie = JSON.parse(xhr.responseText);
                    printOneMovie(singleMovie);
                }
            }
        };
        xhr.send(null);
    };
    
    var getMovieList = function(event) {
        // Prevent page from reloading on submit
        event.preventDefault();
        // Perform API Call to OMDB 
        apiCall("allMovies");
    };
    
    var getMovieDetails = function(event) {
        //Get Movie Title from Link HTML
        var movieTitle = event.srcElement.innerHTML;
        // Perform API Call to OMDB
        apiCall(movieTitle);
    };

    var uniqid = function(str) {
        var len = str.length;
        var chars = [];
        for (var i = 0; i < len; i++) {
            chars[i] = str[Math.floor((Math.random() * len))];
        }
        return chars.join('');
    };

    var addToFavorites = function(event) {
        //Grab title to add to favorites from Title link next to it
        var favoriteTitle = event.path[1].lastChild.innerHTML;
        var oid = uniqid(favoriteTitle);
        var objectToSave = JSON.stringify({Title: favoriteTitle, oid: oid});
        //Post title to favorites URL so it can be added to persistent list
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/favorites", true);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.onreadystatechange = function () { 
            if (xhr.readyState == 4 && xhr.status == 200) {
                console.log(xhr.responseText);
                var json = JSON.parse(xhr.responseText);
                alert(json.Title + " added to favorites.");
            }
        };
        xhr.send(objectToSave);
    };

    var printOneMovie = function(movieObject) {
        var movieDetails = document.createElement("UL");        // Create a <ul> element to list movie details
        // Create a bullet node for each movie detail
        for (var i in movieObject) {
            var movieDetail = document.createElement("LI"); 
            movieDetail.innerHTML = i + ": " + movieObject[i];
            movieDetails.appendChild(movieDetail);                                // Append the movie detail to the list            
        }
        var movieDisplay = document.getElementById('movieDisplay');
        movieDisplay.replaceChild(movieDetails, movieDisplay.firstChild);                    // Put the list inside the movieDisplay div             
    }; 
    
    var printAllMovies = function(arrayOfMovies) {
        var movieList = document.createElement("UL");   // Create a <ul> element to list movies
        //Handle case where no movies match search criteria
        if (arrayOfMovies[0].Title == "Movie not found!") {
            movieList.innerHTML = "Movie not found!";
        } 
        else {
            for (var i = 0; i < arrayOfMovies.length; i++) {
                var movieTitle = arrayOfMovies[i].Title;
                // Create a bullet node for each movie in the list
                var movie = document.createElement("LI");
                //Append favorite button for each movie
                var favoriteButton = document.createElement("BUTTON");
                favoriteButton.setAttribute("class", "star buttons formItems");
                favoriteButton.innerHTML = "Add to Favorites";
                movie.appendChild(favoriteButton);
                //Append movie link for each movie
                var movieLink = document.createElement("A");
                movieLink.setAttribute('href', "#");
                movieLink.innerHTML = movieTitle;
                movie.appendChild(movieLink);
                //Add Listeners to get movie details and add favorites
                if(movieLink.addEventListener){
                    movieLink.addEventListener("click", getMovieDetails, false);  //For Modern Browsers
                    favoriteButton.addEventListener("click", addToFavorites, false);
                }
                else if(movieLink.attachEvent){
                    movieLink.attachEvent("onclick", getMovieDetails);            //For Old IE Compatibility
                    favoriteButton.attachEvent("onclick", addToFavorites);
                }
                movieList.appendChild(movie);                                // Append the movie to the list
            }            
        }

        var movieDisplay = document.getElementById('movieDisplay');
        if (movieDisplay.firstChild) {
            movieDisplay.replaceChild(movieList, movieDisplay.firstChild); //Replace any existing movie list
        }
        else {
            movieDisplay.appendChild(movieList);                    // Put the list inside the movieDisplay div             
        }
    };
    
    //Add listener to send text in HTML form to OMDB on submit
    var movieSearchForm = document.getElementById("movieSearchForm");    
    if(movieSearchForm.addEventListener){
        movieSearchForm.addEventListener("submit", getMovieList, false);  //For Modern Browsers
    }
    else if(movieSearchForm.attachEvent){
        movieSearchForm.attachEvent("onsubmit", getMovieList);            //For Old IE Compatibility
    }
});