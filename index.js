console.log("starting up!!");

const express = require('express');
const methodOverride = require('method-override');
const pg = require('pg');

// Initialise postgres client
const configs = {
  user: 'apooshoo',
  password: 'neilgaiman1',
  host: '127.0.0.1',
  database: 'tunr_db',
  port: 5432,
};

const pool = new pg.Pool(configs);

pool.on('error', function (err) {
  console.log('idle client error', err.message, err.stack);
});

/**
 * ===================================
 * Configurations and set up
 * ===================================
 */

// Init express app
const app = express();


app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use(methodOverride('_method'));


// Set react-views to be the default view engine
const reactEngine = require('express-react-views').createEngine();
app.set('views', __dirname + '/views');
app.set('view engine', 'jsx');
app.engine('jsx', reactEngine);

/**
 * ===================================
 * Routes
 * ===================================
 */

//index page, link to home
app.get('/', (request, response) => {
    let queryString = `SELECT * FROM artists`;
    pool.query(queryString, (err, result) => {
        if (err){
            console.log(err.stack);
        } else{
            let info = result.rows;
            let data = {
                artistsData: info
            };
            response.render('home', data);
        }
    })

});

//show page, link to each-artist
app.get('/artist', (request, response) => {
    //search artists by id
    let id = parseInt(request.query.search);
    console.log(id);

    let queryString = `SELECT * FROM artists WHERE id = ${id}`;
    pool.query(queryString, (err, result) => {
        if (err){
            console.log(err.stack);
        } else {
            response.render('each-artist', result.rows);
        }
    })

})

app.get('/new', (request, response) => {
  // respond with HTML page with form to create new pokemon
  response.render('new');
});







/**
 * ===================================
 * Listen to requests on port 3000
 * ===================================
 */
const server = app.listen(3000, () => console.log('~~~ Tuning in to the waves of port 3000 ~~~'));

let onClose = function(){

  console.log("closing");

  server.close(() => {

    console.log('Process terminated');

    pool.end( () => console.log('Shut down db connection pool'));
  })
};

process.on('SIGTERM', onClose);
process.on('SIGINT', onClose);