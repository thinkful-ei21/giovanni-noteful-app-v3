'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');
const Folder = require('../models/folder');

router.get('/', (req, res, next) => {

  Folder.find().sort({ updatedAt: 'desc' })
    .then(response => res.json(response))
    .catch(err => next(err));
});


router.get('/:id', (req, res, next)=>{
  const folderId = req.params.id;

  Folder.findById(folderId)
    .then(response => res.json(response))
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
    .then(result => res.status(201).json(result))
    .catch(err => next(err));
});

router.put('/:id', (req, res, next)=>{
  const folderId = req.params.id;
  const {name} = req.body;

  Folder.findByIdAndUpdate(folderId, {'name': name}, {upsert : true, new :true})
    .then(result => res.json(result))
    .catch(err => next(err));
    
});

router.delete('/:id', (req, res, next) =>{
  const folderId = req.params.id;
    
  Folder.findByIdAndRemove(folderId)
    .then(() => res.status(204).end())
    .catch(err => next(err));
});


module.exports = router;