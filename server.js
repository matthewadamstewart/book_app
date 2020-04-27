'use strict';

require('dotenv').config();

const express = require('express');
const app = express();

const superagent = require('superagent');


const ejs = require('ejs');
app.set('view engine', 'ejs');

const methodOverride = require('method-override');

const pg = require('pg');

const dbClient = new pg.Client(process.env.DATABASE_URL);

dbClient.connect(error => {

  if (error) {
    console.log('Something went wrong with the Database: ' + error);
  } else {
    console.log('Connected to database');
  }
});

const PORT = process.env.PORT;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));


function Book(data) {
  const placeHolderImage = 'https://matthewadamstewart.github.io/portfolio/images/book-not-available.jpg';
  let httpRegex = /^(http:\/\/)/g;
  this.title = data.title ? data.title : 'no title here';
  this.author = data.authors ? data.authors[0] : 'no author';
  this.description = data.description ? data.description : 'no description';
  this.isbn = data.industryIdentifiers ? `ISBN_13 ${data.industryIdentifiers[0].identifier}` : 'no isbn';
  this.image_url = data.imageLinks ? data.imageLinks.smallThumbnail.replace(httpRegex, 'https://') : placeHolderImage;
  this.bookshelf = data.bookshelf ? data.bookshelf : 'no bookshelf';
}

function errorHandler(error, request, response) {
  response.status(500).send('Something went wrong: ' + error);
}


function bookHandler(request, response) {
  let queryType = request.body.search[0];
  let queryTerms = request.body.search[1];
  let url = `https://www.googleapis.com/books/v1/volumes?q=+in${queryTerms}:${queryType}`; //google api
  superagent.get(url)
    .then(results => results.body.items.map(book => new Book(book.volumeInfo)))
    .then(book => response.render('./pages/searches/show', { book: book }))
    .catch(error => {
      errorHandler('book handler error: superagent', request, response);
    });
}



// function displayIndex(request, response) {
//   response.render('./pages/index');
// }

// app.get('/', (request, response) => {
//   displayIndex(request, response)
// });

// function displayNewSearches(request, response) {
//   response.render('./searches/new');
// }
  
// app.get('/searches/new', (request, response) => {
//   displayNewSearches(request, response)
// });

// function bookResultsGatherer(request, response) {
//   let queryType = request.body.toggle;
//   let queryTerms = request.body.query;
//   let url = `https://www.googleapis.com/books/v1/volumes?q=${queryType}:${queryTerms}`;
//   console.log(url);
//   superagent.get(url)
//     .then(results => {
//       let data = results.body.items.map(book => {
//         console.log(book);
//         return new Book({
//           title: book.volumeInfo.title || 'empty',
//           author: book.volumeInfo.authors[0] || 'empty',
//           description: book.volumeInfo.description || 'empty',
//           image: book.volumeInfo.imageLinks.smallThumbnail || 'empty',
//           isbn: book.volumeInfo.industryIdentifiers[0].identifier || 'test',
//           bookshelf: 'empty',
//         });
//       });
//       response.send(data);
//     })
//     .catch(error => {
//       console.log(error);
//       response.send(error);
//     });
// }

// app.post('/searches', (request, response) => {bookResultsGatherer(request, response)});


app.listen(PORT, () => {
  console.log('The port is: ' + PORT)
});
