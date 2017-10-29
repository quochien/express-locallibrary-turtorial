var mongoose = require('mongoose');
var Genre = require('../models/genre');
var Book = require('../models/book');
var async = require('async');

// Display list of all Genre
exports.genre_list = function(req, res) {
  Genre.find()
    .exec(function(err, list_genres) {
      if (err) { return next(err); }
      res.render('genre_list', { title: 'Genres list', genre_list: list_genres });
    });
};

// Display detail page for a specific Genre
exports.genre_detail = function(req, res) {
  var id = mongoose.Types.ObjectId(req.params.id.trim());

  async.parallel({
    genre: function(callback) {
      Genre.findById(id).exec(callback);
    },
    genre_books: function(callback) {
      Book.find({ 'genre': id }).exec(callback);
    }
  }, function(err, results) {
    if (err) { return next(err); }
    res.render('genre_detail', { title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books });
  });
};

// Display Genre create form on GET
exports.genre_create_get = function(req, res) {
  res.render('genre_form', { title: 'Create Genre' });
};

// Handle Genre create on POST
exports.genre_create_post = function(req, res, next) {
  req.checkBody('name', 'Genre name required').notEmpty();

  req.sanitize('name').escape();
  req.sanitize('name').trim();

  var errors = req.validationErrors();

  var genre = new Genre({ name: req.body.name });

  if (errors) {
    res.render('genre_form', { title: 'Create Genre', genre: genre, errors: errors });
    return;
  }
  else {
    Genre.findOne({ 'name': req.body.name })
      .exec(function(err, found_genre) {
        if (err) { return next(err); }

        if (found_genre) {
          res.redirect(found_genre.url);
        }
        else {
          genre.save(function(err) {
            if (err) { return next(err); }
            res.redirect(genre.url);
          });
        }
      });
  }
};

// Display Genre delete form on GET
exports.genre_delete_get = function(req, res) {
  var id = mongoose.Types.ObjectId(req.params.id.trim());

  async.parallel({
    genre: function(callback) {
      Genre.findById(id).exec(callback);
    },
    genre_books: function(callback) {
      Book.find({ 'genre': id }).exec(callback);
    }
  }, function(err, results) {
    if (err) { return next(err); }

    res.render('genre_delete', { title: 'Delete Genre', genre: results.genre, genre_books: results.genre_books });
  });
};

// Handle Genre delete on POST
exports.genre_delete_post = function(req, res) {
  req.checkBody('genreid', 'Genre id must exist').notEmpty();

  async.parallel({
    genre: function(callback) {
      Genre.findById(req.body.genreid).exec(callback);
    },
    genre_books: function(callback) {
      Book.find({ 'genre': req.body.genreid }).exec(callback);
    }
  }, function(err, results) {
    if (err) { return next(err); }

    if (results.genre_books.length > 0) {
      res.render('genre_delete', { title: 'Delete Genre', genre: results.genre, genre_books: results.genre_books });
      return;
    }
    else {
      Genre.findByIdAndRemove(req.body.genreid, function deleteGenre(err) {
        if (err) { return next(err); }

        res.redirect('/catalog/genres');
      });
    }
  });
};

// Display Genre update form on GET
exports.genre_update_get = function(req, res, next) {
  req.sanitize('id').escape();
  req.sanitize('id').trim();

  Genre.findById(req.params.id).exec(function(err, genre){
    if (err) { return next(err); }

    res.render('genre_form', { title: 'Update Genre', genre: genre });
  });
};

// Handle Genre update on POST
exports.genre_update_post = function(req, res, next) {
  req.checkBody('name', 'Genre name required').notEmpty();
  req.sanitize('name').escape();
  req.sanitize('name').trim();

  var genre = new Genre({
    name: req.body.name,
    _id: req.params.id
  });

  var errors = req.validationErrors();
  if (errors) {
    res.render('genre_form', { title: 'Update Genre', genre: genre });
    return;
  }
  else {
    Genre.findByIdAndUpdate(req.params.id, genre, {}, function(err, the_genre) {
      if (err) { return next(err); }
      res.redirect(the_genre.url);
    });
  }
};
