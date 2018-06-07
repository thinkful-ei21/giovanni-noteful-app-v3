'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');
const Note = require('../models/note');



/* ========== GET/READ ALL ITEM ========== */
router.get('/', (req, res, next) => {

  const {searchTerm, folderId, tagId} = req.query;

  let filter = {};

  if (searchTerm) {
    filter = { $or : [{title: {$regex: searchTerm}},{content: {$regex: searchTerm}}]
    };
  }
  if(folderId) {
    filter.folderId = folderId;
  }

  Note.find(filter).sort({ updatedAt: 'desc' })
    .then(response => !response ? next() : res.json(response))
    .catch(err => next(err));

});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {

  const noteId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(noteId)){
    const err = new Error('Invalid ID');
    err.status = 400;
    return next(err);
  }

  // console.log('note id is:',noteId);
  Note.findById(noteId)
    .then(response => !response ? next() : res.json(response))
    .catch(err => next(err));

});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {

  const { title, content, folderId, tags} = req.body;

  const newNote = { title, content};
  folderId && mongoose.Types.ObjectId.isValid(folderId)? newNote.folderId = folderId : {};
  if (!newNote.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  Note.create(newNote)
    .then(result => {
      console.log('returning this object:', result);
      res.location(`http://${req.headers.host}/notes/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      next(err);
    });

});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {

  const noteId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(noteId)){
    const err = new Error('Invalid ID');
    err.status = 400;
    return next(err);
  }

  const folderId = req.body.folderId;
  const updateObj = {};
  const updateableFields = ['title', 'content'];
 
  folderId && mongoose.Types.ObjectId.isValid(folderId)? updateObj.folderId = folderId : {};
   
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

  const options = {upsert : true, new :true};
  Note.findByIdAndUpdate(noteId, updateObj, options)
    .then(result => {
      res.json(result);
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      next(err);
    });
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {

  const noteId = req.params.id;
  
  Note.findByIdAndRemove(noteId)
    .then(() => res.status(204).end())
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      next(err);
    });
});

module.exports = router;