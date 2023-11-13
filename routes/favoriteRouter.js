// Create favoriteRouter: In the routes folder, create a new file named favoriteRouter.js.

// Import/Export: Using the require function, import the express module, then also import the local file-based modules you have made: cors, authenticate, and Favorite (from the models folder), using the appropriate paths. Create the favoriteRouter using the express.Router() method as you have done in other router modules. Then be sure to export  favoriteRouter.

const express = require("express");
const Favorite = require("../models/favorite");
const authenticate = require("../authenticate");
const cors = require("./cors");

const favoriteRouter = express.Router();

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.find()
      .populate("users", "campsites")
      .then((favorites) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(favorites);
      });
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id }).then((favorite) => {
      if (favorite) {
        req.body.forEach((campsite) => {
          if (!favorite.campsites.includes(campsite._id)) {
            favorite.campsites.push(campsite._id);
          }
        });
        favorite
          .save()
          .then((favorite) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorite);
          })
          .catch((err) => next(err));
      } else {
        // favorite does not exist, we need to create the favorite, then logic is the same afterwards
        Favorite.create({ user: req.user._id }).then((newFavorite) => {
          req.body.forEach((campsite) => {
            if (!newFavorite.campsites.includes(campsite._id)) {
              newFavorite.campsites.push(campsite._id);
            }
          });
          newFavorite
            .save()
            .then((newFavorite) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(newFavorite);
            })
            .catch((err) => next(err));
        });
      }
    });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.setHeader("Content-Type", "text/plain");
    res.end("PUT operation not supported on /favorites");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({ user: req.user._id })
      .then((fav) => {
        if (fav) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(fav);
        } else {
          res.setHeader("Content-Type", "text/plain");
          res.end("You do not have any favorites to delete.");
        }
      })
      .catch((err) => next(err));
  });


favoriteRouter
  .route("/:campsiteId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.setHeader("Content-Type", "text/plain");
    res.end(
      "GET requests not supported on this route /favorites/:campsiteId"
    );
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id }).then((favorite) => {

      if (!favorite) {
        Favorite.create({ user: req.user._id })
          .then((newFavorite) => {
            if (!newFavorite.campsites.includes(req.params.campsiteId)) {
              newFavorite.campsites.push(req.params.campsiteId);
              newFavorite
                .save()
                .then((favorite) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(favorite);
                })
                .catch((err) => next(err));
            } else {
              res.statusCode = 200;
              res.header("Content-Type", "text/plain");
              res.end("campsite already in favorites");
            }
          })
          .catch((err) => next(err));
      } else {
        if (!favorite.campsites.includes(req.params.campsiteId)) {
          favorite.campsites.push(req.params.campsiteId);
          favorite
            .save()
            .then((favorite) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            })
            .catch((err) => next(err));
        } else {        
          res.statusCode = 200;
          res.header("Content-Type", "text/plain");
          res.end("campsite already in favorites");
        }
      }
    });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.setHeader("Content-Type", "text/plain");
    res.end("PUT operation not supported on /favorites/:campsiteId");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  
    Favorite.findOne({ user: req.user._id }).then((favorite) => {
      if (favorite) {
        const index = favorite.campsites.indexOf(req.params.campsiteId);
       
        if (index >= 0) {
          favorite.campsites.splice(index, 1);
          favorite
            .save()
            .then((favorite) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            })
            .catch((err) => next(err));
        } else {
        
          res.statusCode = 200;
          res.setHeader("Content-Type", "text/plain");
          res.end("no favorite to delete!");
        }
      }
    });
  });

module.exports = favoriteRouter;


