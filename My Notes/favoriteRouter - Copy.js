// Create favoriteRouter: In the routes folder, create a new file named favoriteRouter.js.

// Import/Export: Using the require function, import the express module, then also import the local file-based modules you have made: cors, authenticate, and Favorite (from the models folder), using the appropriate paths. Create the favoriteRouter using the express.Router() method as you have done in other router modules. Then be sure to export  favoriteRouter.

const express = require("express");
const Favorite = require("../models/favorite");
const authenticate = require("../authenticate");
const cors = require("./cors");

const favoriteRouter = express.Router();

// Routes: Set up two routes using favoriteRouter.route('/') and favoriteRouter.route('/:campsiteId').
// Set up CORS:
// Preflight requests to both routes using the .options() method as you have done in the other routers, with the cors.corsWithOptions function as the first middleware in the .options method's argument list, followed by a request handler middleware that simply responds with a status code of 200.
// Chain .get(), .post(), .put(), and .delete() methods to both routes, giving either the cors.cors function (for .get) or the cors.corsWithOptions function (for the rest) as the first middleware in their argument lists.
// Authentication: For the second middleware in the get/post/put/delete routing methods' argument lists, use the authenticate.verifyUser function.
// Handle Requests: Now you will add a final request handling middleware function to each of the get/post/put/delete routing methods for both the /favorites and /favorites/:campsiteId paths. Give the function arguments of req, res, and next as appropriate.
// GET: When the user does a GET operation on '/favorites', retrieve the favorite document for that user using Favorite.find(), passing to the find method the object { user: req.user._id } as its only argument. To the retrieved favorite document, chain two populate() methods to populate the user and campsites refs. To the res object, set an appropriate Content-Type header and a status code of 200. Return the favorite document using the res.json() method with the appropriate argument.
// POST to /favorites: When the user does a POST operation on '/favorites' by including a message in the format of [{"_id":"campsite ObjectId"},  . . . , {"_id":"campsite ObjectId"}] in the body of the message (see Testing section for example), you will check if the user has an associated favorite document. Use Favorite.findOne({user: req.user._id }) for this.
// Then, check if the favorite document exists:
// If so, then you will check which campsites in the request body are already in the campsites array of the favorite document, if any, and you will only add to the document those that are not already there. There are various ways to conduct this check. The use of JavaScript array methods forEach, includes, and push can help you with this task.
// If there is no favorite document for the user, you will create a favorite document for the user and add the campsite IDs from the request body to the campsites array for the document. Save the favorite document, set the response Content-Type header and a status code of 200, and send the response back using res.json() with the favorite document as its argument.
// DELETE to /favorites: When the user performs a DELETE operation on '/favorites', use findOneAndDelete to locate the favorite document corresponding to this user and delete it. For the response, set a status code of 200. If a favorite document was found, then set the Content-Type header to "application/json" and return the favorite document with res.json(). If no favorite document was found, then set the Content-Type header to 'text/plain' and use res.end() to send the response 'You do not have any favorites to delete.'
favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  // GET: When the user does a GET operation on '/favorites', retrieve the favorite document for that user using Favorite.find(),
  // passing to the find method the object { user: req.user._id } as its only argument.
  // To the retrieved favorite document, chain two populate() methods to populate the user and campsites refs.
  // To the res object, set an appropriate Content-Type header and a status code of 200.
  // Return the favorite document using the res.json() method with the appropriate argument.
  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.find()
      .populate("users", "campsites")
      .then((favorites) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(favorites);
      });
  })
  // POST to /favorites: When the user does a POST operation on '/favorites' by including a message in the format of
  // [{"_id":"campsite ObjectId"},  . . . , {"_id":"campsite ObjectId"}] in the body of the message
  // (see Testing section for example), you will check if the user has an associated favorite document.
  // Use Favorite.findOne({user: req.user._id }) for this.
  // Then, check if the favorite document exists:
  // If so, then you will check which campsites in the request body are already in the campsites array of the favorite document,
  // if any, and you will only add to the document those that are not already there. There are various ways to conduct this check.
  // The use of JavaScript array methods forEach, includes, and push can help you with this task.
  // If there is no favorite document for the user, you will create a favorite document for the user and add the campsite IDs
  // from the request body to the campsites array for the document. Save the favorite document, set the response Content-Type header and a status code of 200, and send the response back using res.json() with the favorite document as its argument.
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
          .catch((e) => next(e));
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
            .catch((e) => next(e));
        });
      }
    });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.setHeader("Content-Type", "text/plain");
    res.end("HEY!! PUT operation not supported on /favorites");
  })
  // DELETE to /favorites: When the user performs a DELETE operation on '/favorites',
  // use findOneAndDelete to locate the favorite document corresponding to this user and delete it.
  // For the response, set a status code of 200. If a favorite document was found,
  // then set the Content-Type header to "application/json" and return the favorite document with res.json().
  // If no favorite document was found, then set the Content-Type header to 'text/plain' and
  // use res.end() to send the response 'You do not have any favorites to delete.'
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
      .catch((e) => next(e));
  });

// Building out logic for user to submit favorite campsites through URL instead of the body
favoriteRouter
  .route("/:campsiteId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.setHeader("Content-Type", "text/plain");
    res.end(
      "Yo GET requests not supported on this route /favorites/:campsiteId"
    );
  })
  // POST to /favorites/:campsiteId: When the user performs a POST operation on '/favorites/:campsiteId',
  // use findOne to locate the favorites document for the user. Then you will add the campsite specified in the
  // URL parameter to the favorite.campsites array, if it's not already there.
  // If the campsite is already in the array, then respond with a message saying
  // "That campsite is already in the list of favorites!" If the user has not previously defined any favorites,
  // then you will need to create a new Favorite document for this user and add the campsite to it.
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id }).then((favorite) => {
      // if it's not in the campsite.favorites array, then add the favorite
      if (!favorite) {
        Favorite.create({ user: req.user._id })
          .then((newFavorite) => {
            // if the favorite.campsite array DOES NOT include the campsite in the URL (req.params.campsiteId), then we want to add
            // Otherwise do nothing
            if (!newFavorite.campsites.includes(req.params.campsiteId)) {
              newFavorite.campsites.push(req.params.campsiteId);
              newFavorite
                .save()
                .then((favorite) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(favorite);
                })
                .catch((e) => next(e));
            } else {
              // campsite from URL is already in the favorite.campsites array, send "campsite already in favorites"
              res.statusCode = 200;
              res.header("Content-Type", "text/plain");
              res.end("campsite already in favorites");
            }
          })
          .catch((e) => next(e));
      } else {
        // if in the campsite.favorites array, then do same logic assuming already in array
        if (!favorite.campsites.includes(req.params.campsiteId)) {
          favorite.campsites.push(req.params.campsiteId);
          favorite
            .save()
            .then((favorite) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            })
            .catch((e) => next(e));
        } else {
          // campsite from URL is already in the favorite.campsites array, send "campsite already in favorites"
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
    res.end("HEY!! PUT operation not supported on /favorites/:campsiteId");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // DELETE to /favorites/:campsiteId: When the user performs a DELETE operation on '/favorites/:campsiteId',
    // use findOne to find the favorites document for the user.
    // If it exists, delete the campsite in the URL parameter req.params.campsiteId from its campsites array.
    // There are multiple ways to approach this. Because you are deleting an element from an array and not a single document,
    // you can not use the findOneAndDelete method. Instead, you could use a combination of indexOf and splice methods
    // on the favorite.campsites array to remove the specified campsite. Alternatively, you could use the filter array method.
    // Afterward, save the document then return a response with a status code of 200, a Content-Type header of 'application/json',
    //  and the favorite document.
    // If no favorite document exists, return a response with a Content-Type header of 'text/plain' and a message that
    // there are no favorites to delete.
    Favorite.findOne({ user: req.user._id }).then((favorite) => {
      if (favorite) {
        const index = favorite.campsites.indexOf(req.params.campsiteId);
        // Only want to delete if campsiteId actually exists in array
        if (index >= 0) {
          favorite.campsites.splice(index, 1);
          favorite
            .save()
            .then((favorite) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            })
            .catch((e) => next(e));
        } else {
          // campsiteId doesn't exist, just send message "no favorite to delete!"
          res.statusCode = 200;
          res.setHeader("Content-Type", "text/plain");
          res.end("no favorite to delete!");
        }
      }
    });
  });

module.exports = favoriteRouter;

// Unsupported: For the GET request to '/favorites/:campsiteId' and the PUT request to '/favorites' and '/favorites/:campsiteId', return a response with a status code of 403 and a message that the operation is not supported.
