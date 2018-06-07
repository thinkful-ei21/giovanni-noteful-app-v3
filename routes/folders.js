'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Folder = require('../models/folder');
const Note = require('../models/note');


router.get('/', (req, res, next) => {

  Folder.find().sort({ updatedAt: 'desc' })
    .then(response => !response ? next() : res.json(response))
    .catch(err => next(err));
});


router.get('/:id', (req, res, next)=>{
  const folderId = req.params.id;

  Folder.findById(folderId)
    .then(response => !response ? next() : res.json(response))
    .catch(err => next(err));
});



router.post('/', (req,res, next) => {

  const {name} = req.body;

  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  Folder.create({'name': name})
    .then(result => res.location(`http://${req.headers.host}/folders/${result.id}`).status(201).json(result))
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });
});

router.put('/:id', (req, res, next)=>{
  const folderId = req.params.id;
  const {name} = req.body;

  Folder.findByIdAndUpdate(folderId, {'name': name}, {upsert : true, new :true})
    .then(result => res.json(result))
    .catch(err => next(err));
    
});

router.delete('/:id', (req, res, next) =>{
  const delId = req.params.id;
    
  Promise.all([
    Folder.findByIdAndRemove(delId),
    Note.updateMany({folderId: delId},{folderId: null}) ])
    .then(() => res.status(204).end())
    .catch(err => next(err));
});


module.exports = router;