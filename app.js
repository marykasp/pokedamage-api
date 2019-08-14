
// document ready
$(function() {
    console.log('App loaded, waiting for submit');
    watchForm();
})

// fetch  options variable- GET method
const fetchOptions = {
    headers: {
        'Content-Type': 'application/json'
    },
    mode: 'cors'
}

// form submit listener
function watchForm() {
    // listen for form submit (hit enter)
    $('form').on('submit', function(event) {
    // prevent browser default form submission
    event.preventDefault();

    // get values from input and remove spaces 
    let types = $('input[type=text').val().replace(/\s/g, '');
    console.log(types);

    // clear the input field 
    $('input[type=text').val('');

    // turn the types entered as a string into an array of strings
    types = types.split(',');
    console.log(types);

    $('.loader').removeClass('hidden');
    
    // fetch data from the types entered
   getTypeData(types);
});

}



function getTypeData(pokeTypes) {
    // map method on array of types to fetch information about each type, will include damage to that type 
    let trainerTypeCalls = pokeTypes.map(function(elem) {
        return fetch(`https://cors-anywhere.herokuapp.com/http://pokeapi.co/api/v2/type/${elem}/`, fetchOptions);
    });
    // map will return an array of promises (fetch method returns a promise)
    console.log(trainerTypeCalls);

    // get json response from types
    // function will also return a promise, takes in the promise form the fetch method
    getPromiseData(trainerTypeCalls)
        .then(result => {
            // returns an array of objects including pokemon damage relations
            console.log(result);
            // fetch out the double damage pokemon
            getDoubleDamagePokemon(result);
        });
}

function getDoubleDamagePokemon(pokemonTypesData) {
    // return a new array containing the info on the pokemon types that deal damage to the pokemon type entered 
    pokemonDamageTypes = pokemonTypesData.map( types => {
        // array of objects
        // redce to flatten the array to get just the objects themselves of the double damage types
        return types.damage_relations.double_damage_from;
    }).flat().map( damage => {
        return fetch(damage.url, fetchOptions);
    });

    // return an array of promises 
    console.log(pokemonDamageTypes);

    getPromiseData(pokemonDamageTypes)
        .then(results => {
            console.log(results);
            buildTeam(results);
        });
}

function buildTeam(pokemon) {
    let team = [];
    // return all of the arrays
    pokemon = pokemon.map(individualPokemon => {
        return individualPokemon.pokemon;
    }).flat().map(individualPokemon => individualPokemon.pokemon);

    // returns an array of objects with each pokemon name and URL (600 total)
    console.log(pokemon);

    // get a total of 6 pokemon from the array, make random
    for(let i = 0; i < 6; i++) {
        team.push(getRandomPokemon(pokemon));
    };
    console.log(team);

    // map through pokemon damage team and get more info about each by fetching the URL- returns a promise then can use handler to handle the results resolved 
    team = team.map(pokemon => {
        return fetch(pokemon.url, fetchOptions);
    });

    getPromiseData(team)
        .then(pokemonData => {
            console.log(pokemonData);
            displayPokemon(pokemonData);
        });
}

function getRandomPokemon(pokemonArray) {
    return pokemonArray[Math.floor(Math.random() * pokemonArray.length)];
}

function displayPokemon(pokemon) {
    let output = '';

    $('.clear-btn').removeClass("hidden");

    pokemon.forEach(function(poke) {
        output += `
        <div class="card">
            <div class="card__image card__image-background">
                <img src="${poke.sprites.front_default}" width="200" height="auto">
            </div>
            <div class="card__type">
                <p class="types">${poke.types[0].type.name}</p>
            </div>
            <div class="card__id">
                ${poke.id}
            </div>
            <div class="card__name">
                <a class="pokedex" href="https://www.pokemon.com/us/pokedex/${poke.name}" target="_blank">${poke.name}</a>
            </div>
            <div class="card__stats clearfix">
                <div class="one-third">
                    <div class="stat stat-speed">${poke.stats[0].base_stat}</div>
                    <div class="stat-value">Speed</div>
                </div>
                <div class="one-third">
                    <div class="stat stat-hp">${poke.stats[5].base_stat}</div>
                    <div class="stat-value">HP</div>
                </div>
                <div class="one-third">
                    <div class="stat stat-attack">${poke.stats[4].base_stat}</div>
                    <div class="stat-value">Attack</div>
                </div>
            </div>
        </div>   `
    });

    $('.wrapper').append(output);
    $('.loader').addClass('hidden');
   
}


/*
1. pass in an array of promises
2. return a promise from this function(resolve, reject)
3. Promise.all is a promsie that takes in the array of promises as an input. THen it gets resolved when all the promises in the array get resolved 
4. pass the promise array from the pokeapi returned data into promise.all
5. parse the response data into a json object
6. need to use map method in order to iterate through the array of promises to use reponse.json()
7. reponse.json() returns a promise, add another then handler which will then resolve the data
- again need to use promise all since the json response is also in an array

*/
function getPromiseData(promises) {
    return new Promise((resolve,reject) => {
        // creates a promise that is resolved with an array
        Promise.all(promises)
            .then(response => {
                // returns a new array of promises 
                return response.map((type) => type.json());   
            })
            .then((data) => {
                //creates a promise that is resolved with an array of results
                Promise.all(data)
                    .then(resolve);
            })
            .catch(reject);
    });
}
