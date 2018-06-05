'use strict';

const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');

//find, optionally with search term

// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     const searchTerm = 'lady gaga';
//     let filter = {};

//     if (searchTerm) {
//       filter.title = { $regex: searchTerm };
//     }

//     return Note.find(filter).sort({ updatedAt: 'desc' });
//   })    
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

// find by ID

// mongoose.connect(MONGODB_URI)
//   .then(()=>{
//     const noteId = '000000000000000000000003';
        
//     return Note.findById(noteId);
//   })
//   .then(result => {
//     console.log(result);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

// create new note from object

// mongoose.connect(MONGODB_URI)
//   .then(()=>{
//     const newNote = {
//       title: 'this is the titular title',
//       content: 'this content is exemplary'
//     };

//     return Note.create(newNote);
//   })
//   .then(result => {
//     console.log(result);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });


// find by ID and update

// mongoose.connect(MONGODB_URI)
//   .then(()=>{
//     const noteId = '000000000000000000000003';
//     const updObj = {title: '800 lies about cats'};
//     const options = {upsert : true, new :true};
//     return Note.findByIdAndUpdate(noteId, updObj, options);
//   })
//   .then(result => {
//     console.log(result);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

//delete a note by id

mongoose.connect(MONGODB_URI)
  .then(()=>{
    const noteId = '000000000000000000000003';

    return Note.findByIdAndRemove(noteId);
  })
  .then(result => {
    console.log(result);
  })
  .then(() => {
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });