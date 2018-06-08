'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { TEST_MONGODB_URI } = require('../config');
const app = require('../server.js');
const Note = require('../models/note');
const seedNotes = require('../db/seed/notes');
const Folder = require('../models/folder');
const seedFolders = require('../db/seed/folders');
const Tag = require('../models/tag');
const seedTags = require('../db/seed/tags');



const expect = chai.expect;
chai.use(chaiHttp);


describe('notes router', () => {

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });
    
  beforeEach(function () {
    return Note.insertMany(seedNotes)
      .then(()=> Folder.insertMany(seedFolders))
      .then(()=> Tag.insertMany(seedTags));
  });
    
  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });
    
  after(function () {
    return mongoose.disconnect();
  });

  describe('GET /api/notes', function () {

    it('/ should return a JSON object containing an array of notes', ()=>{
      return Promise.all([
        Note.find(),
        chai.request(app).get('/api/notes')
      ])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });

    it('/ [ID] should return a note object with the correct ID', ()=>{
      return Promise.all([
        Note.find({'_id': '000000000000000000000001'}),
        chai.request(app).get('/api/notes/000000000000000000000001')
      ])
        .then(([data, res])=>{
          expect(res).to.have.status(200);
          expect(data[0].title).to.be.equal(res.body.title);
          expect(data[0].id).to.be.equal(res.body.id);
        });
    });

    it('/  with SearchTerm in header should return matching notes',()=>{
      let searchTerm = 'asdf09843v13qve4';
      return Promise.all([
        Note.find({ $or : [{title: {$regex: searchTerm}},{content: {$regex: searchTerm} } ] }),
        chai.request(app).get(`/api/notes/?searchTerm=${searchTerm}`)
      ])
        .then(([data, res])=>{
          expect(res).to.have.status(200);
          expect(data.length).to.be.equal(res.body.length);
        });
    });

  });



  describe('POST /api/notes', function () {
    it('should create and return a new item when provided valid data', function () {
      const newItem = {
        'title': 'The best article about cats ever!',
        'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...',
        'folderId': '111111111111111111111102'
      };

      let res;
      // 1) First, call the API
      return chai.request(app)
        .post('/api/notes')
        .send(newItem)
        .then(function (_res) {
          res = _res;
          
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt', 'folderId','tags');
          // 2) then call the database
          return Note.findById(res.body.id);
        })
        // 3) then compare the API response to the database results
        .then(data => {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
  });

  describe('PUT /api/notes', function () {
    it('/ [ID ]should update and return an item at a given ID', function () {
      const newItem = {
        'title': 'and now for something completely different',
        'content': '..which is to say: this item has changed'
      };
      const itemId = '000000000000000000000000';

      let res;
      
      return chai.request(app)
        .put(`/api/notes/${itemId}`)
        .send(newItem)
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(200);
          //expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt', 'folderId', 'tags');
          
          return Note.findById(itemId);
        })
        .then(data => {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
  });

  describe('DELETE /api/notes', function () {
    it('/ [ID] should remove an item and and return status 204', function () {
      const itemId = '000000000000000000000001';

      return chai.request(app)
        .del(`/api/notes/${itemId}`)
        .then(function (res) {
          expect(res).to.have.status(204);          
          return Note.findById(itemId);
        })
        .then(data => {
          expect(data).to.be.equal(null);
        });
    });
  });

});