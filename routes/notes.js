'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');
const Note = require('../models/note');


/* ========== GET/READ ALL ITEM ========== */
router.get('/', (req, res, next) => {

  const {searchTerm, folderId, tagId} = req.query;

  mongoose.connect(MONGODB_URI)
    .then(() => {
      
      let filter = {};

      if (searchTerm) {
        filter = { $or : [{title: {$regex: searchTerm}},{content: {$regex: searchTerm}}]
        };
      }

      return Note.find(filter).sort({ updatedAt: 'desc' });
    })    
    .then(results => {
      res.json(results);
    })
    .then(() => {
      return mongoose.disconnect();
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      next(err);
    });

});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {

  const noteId = req.params.id;

  // console.log('note id is:',noteId);
  mongoose.connect(MONGODB_URI)
    .then(()=>{       
      return Note.findById(noteId);
    })
    .then(result => {
      res.json(result);
    })
    .then(() => {
      return mongoose.disconnect();
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      next(err);
    });

});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {

  const { title, content, folder_id, tags} = req.body;

  const newNote = { title, content};
  // folder_id == true? newNote.folder_id = folder_id : {};

  if (!newNote.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  let noteId;

  mongoose.connect(MONGODB_URI)
    .then(()=>{

      return Note.create(newNote);
    })
    .then(result => {
      console.log('returning this object:', result);
      res.location(`http://${req.headers.host}/notes/${result.id}`).status(201).json(result);
    })
    .then(() => {
      return mongoose.disconnect();
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      next(err);
    });



});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {

  const noteId = req.params.id;
  //  const folder_id = req.body.folder_id;
  const updateObj = {};
  const updateableFields = ['title', 'content'];
 
  //  folder_id == true? updateObj.folder_id = folder_id : {};
  //  let tags= req.body.tags;

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  if (!updateObj.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  mongoose.connect(MONGODB_URI)
    .then(()=>{
      const options = {upsert : true, new :true};
      return Note.findByIdAndUpdate(noteId, updateObj, options);
    })
    .then(result => {
      res.json(result);
    })
    .then(() => {
      return mongoose.disconnect();
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      next(err);
    });

  

});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {

  const noteId = req.params.id;

  mongoose.connect(MONGODB_URI)
    .then(()=>{

      return Note.findByIdAndRemove(noteId);
    })
    .then(result => {
      console.log('deleted?');
      res.status(204).end();
    })
    .then(() => {
      return mongoose.disconnect();
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      next(err);
    });
});

module.exports = router;