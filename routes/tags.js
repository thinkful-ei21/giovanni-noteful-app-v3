'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Folder = require('../models/folder');
const Note = require('../models/note');
const Tag = require('../models/tag');


router.get('/', (req,res,next)=>{

  Tag.find().sort({name: 'desc'})
    .then(response => !response ? next() : res.json(response))
    .catch(err => next(err));
});

router.get('/:id', (req,res,next)=>{
  const tagId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(tagId)){
    const err = new Error('Invalid ID');
    err.status = 400;
    return next(err);
  }

  Tag.findById(tagId)
    .then(response => !response ? next() : res.json(response))
    .catch(err => next(err));
});

router.post('/', (req,res,next)=>{
  const {name} = req.body;

  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  Tag.create({'name':name})
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });

});

router.put('/:id', (req,res,next)=>{
  const tagId = req.params.id;
  const {name} = req.body;

  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  if (!mongoose.Types.ObjectId.isValid(tagId)){
    const err = new Error('Invalid ID');
    err.status = 400;
    return next(err);
  }

  Tag.findByIdAndUpdate(tagId, {'name': name}, {upsert : true, new :true})
    .then(result => res.json(result))
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });

});

router.delete('/:id', (req,res,next)=>{
  const tagId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(tagId)){
    const err = new Error('Invalid ID');
    err.status = 400;
    return next(err);
  }
  Promise.all([
    Tag.findByIdAndRemove(tagId),
    Note.updateMany(
      {'tags': tagId}, {$pull: {'tags':tagId}}
    )
  ])
    .then(() => res.status(204).end())
    .catch(err => next(err));

});







module.exports = router;