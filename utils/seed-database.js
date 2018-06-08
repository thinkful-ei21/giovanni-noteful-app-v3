'use strict';

const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');
const Note = require('../models/note');
const Folder = require('../models/folder');
const Tag = require('../models/tag');

const seedNotes = require('../db/seed/notes');
const seedFolders = require('../db/seed/folders');
const seedTags = require('../db/seed/tags');


mongoose.connect(MONGODB_URI)
  .then(() => mongoose.connection.db.dropDatabase())
  .then(()=>{
    return Promise.all([
      Note.insertMany(seedNotes)
        .then(results => console.info(`Inserted ${results.length} Notes`)),
      Folder.insertMany(seedFolders)
        .then(results => console.info(`Inserted ${results.length} Folders`)),
      Tag.insertMany(seedTags)
        .then(results => console.info(`Inserted ${results.length} Tags`))
    ]);
  })
  
  // .then(() => Note.insertMany(seedNotes))
  // .then(results => {
  //   console.info(`Inserted ${results.length} Notes`);
  // })
  // .then(() => Folder.insertMany(seedFolders))
  // .then(results => {
  //   console.info(`Inserted ${results.length} Folders`);
  // })
  .then(()=>{
    Folder.createIndexes;
  })
  .then(()=>{
    Tag.createIndexes;
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.error(err);
  });