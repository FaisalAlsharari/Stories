// Express docs: http://expressjs.com/en/api.html
const express = require('express')

// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for examples
const Comment = require('../models/comment')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', {
  session: false
})

// instantiate a router (mini app that only handles routes)
const router = express.Router()


router.get('/', function (req, res) {
  res.send({
    message: 'Home Page test'
  });
});


// Get All comment
router.get('/comments', function (req, res) {
  Comment.find()
    // Return all comment as an Array
    .then(function (comment) {
      res.status(200).json({
        comment: comment
      });
    })
    // Catch any errors that might occur
    .catch(function (error) {
      res.status(500).json({
        error: error
      });
    });
});
//---------------------------------------------------------------------
router.post('/stories/:story_id/comments', requireToken, (req, res, next) => {
  // set owner of new comment to be current user
  req.body.comment.owner = req.user.id
  req.body.comment.commentedAt = req.params.story_id
  console.log('body of comment',req.body.comment)
  Comment.create(req.body.comment)
    // respond to succesful `create` with status 201 and JSON of new "comment"
    .then(comment => {
      res.status(201).json({
        comment: comment.toObject()
      })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(next)
})


// router.post('/stories/:story_id/comments', function(req, res) {
//   Story.findById(req.params.story_id)
//     .then(function(story) {
//       console.log(story);
//       if(story) {
//         req.body.comment.owner = req.user.id
//         Comment.create(req.body.comment)
//         // respond to succesful `create` with status 201 and JSON of new "comment"
//         .then(comment => {
//           res.status(201).json({
//             comment: comment.toObject()
//           })
//         })
//         // if an error occurs, pass it off to our error handler
//         // the error handler needs the error message and the `res` object so that it
//         // can send an error message back to the client
//         .catch(next)
//       } else {
//         // If we couldn't find a document with the matching ID
//         res.status(404).json({
//           error: {
//             name: 'DocumentNotFoundError',
//             message: 'The provided ID doesn\'t match any documents'
//           }
//         });
//       }
//     })
//     // Catch any errors that might occur
//     .catch(function(error) {
//       res.status(500).json({ error: error });
//     });
// });

//----------------------------------------------------------------------


// CREATE
// POST /comment
router.post('/comments', requireToken, (req, res, next) => {
  // set owner of new comment to be current user
  console.log(req.body)
  req.body.comment.owner = req.user.id

  Comment.create(req.body.comment)
    // respond to succesful `create` with status 201 and JSON of new "comment"
    .then(comment => {
      res.status(201).json({
        comment: comment.toObject()
      })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(next)
})



// UPDATE
// PATCH /examples/5a7db6c74d55bc51bdf39793
router.patch('/comments/:id', requireToken, removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.comment.owner

  Comment.findById(req.params.id)
    .then(handle404)
    .then(comment => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      requireOwnership(req, comment)

      // pass the result of Mongoose's `.update` to the next `.then`
      return comment.update(req.body.comment)
    })
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// DESTROY
// DELETE /examples/5a7db6c74d55bc51bdf39793
router.delete('/stories/:story_id/comments/:comment_id', requireToken, (req, res, next) => {
  Comment.findById(req.params.comment_id)
    .then(handle404)
    .then(comment => {
      // throw an error if current user doesn't own `example`
      requireOwnership(req, comment)
      // delete the example ONLY IF the above didn't throw
      comment.remove()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})



module.exports = router