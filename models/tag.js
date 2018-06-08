'use strict';

const mongoose = require('mongoose');

const tagsSchema = new mongoose.Schema({
  name: {type: String, required: true, unique: true}
}, {timestamps: true});

tagsSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
  }
});
  
  
module.exports = mongoose.model('Tag', tagsSchema, 'tags');
