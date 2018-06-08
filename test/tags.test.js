'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { TEST_MONGODB_URI } = require('../config');
const app = require('../server.js');
const Note = require('../models/note');
const Tag = require('../models/tag');
const seedNotes = require('../db/seed/notes');
const seedTags = require('../db/seed/tags');

const expect = chai.expect;
chai.use(chaiHttp);



describe('tags router', () => {

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });
      
  beforeEach(function () {
    return Note.insertMany(seedNotes)
      .then(()=> Tag.insertMany(seedTags));
  });
      
  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });
      
  after(function () {
    return mongoose.disconnect();
  });


  describe('GET /api/tags', function(){

    it('/ should return a JSON object containing an array of tags',()=>{
      return Promise.all([
        Tag.find(),
        chai.request(app).get('/api/tags/')
      ]).then(([data, res]) =>{
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('array');
        expect(res.body).to.have.length(data.length);
      });
    });

    it('/ [ID]should return the Tag object with the corresponding ID',()=>{
      const sampleId = '222222222222222222222202';
      return Promise.all([
        Tag.findById(sampleId),
        chai.request(app).get(`/api/tags/${sampleId}`)
      ]).then(([data, res]) =>{
        expect(res).to.have.status(200);
        expect(data.name).to.be.equal(res.body.name);
        expect(data.id).to.be.equal(res.body.id);
      });
    });
  });

  describe('POST /api/tags', function(){
    it('/ should create and return a new item when provided valid data', ()=> {
      const newTag = {name: 'rigid'};
        
      let res;
      return chai.request(app)
        .post('/api/tags')
        .send(newTag)
        .then(_res =>{
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body.name).to.equal('rigid');
          return Tag.findById(res.body.id);
        })
        .then(data => {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
        });
    });
  });

  describe('PUT /api/tags', function(){

    it('/ [ID ]should update and return an item at a given ID', function () {
      const updItem = {'name': 'something else'};
      const itemId = '222222222222222222222202';

      let res;
        
      return chai.request(app)
        .put(`/api/tags/${itemId}`)
        .send(updItem)
        .then( _res => {
          res = _res;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.name).to.equal('something else');
            
          return Tag.findById(itemId);
        })
        .then(data => {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
  });

  describe('DELETE /api/tags', function(){
    it('should remove a tag with the given ID, and remove all references to that tag in Notes', function(){
      const itemId = '222222222222222222222202';

      return chai.request(app)
        .del(`/api/tags/${itemId}`)
        .then(function (res) {
          expect(res).to.have.status(204);          
          return Tag.findById(itemId);
        })
        .then(data => {
          expect(data).to.be.equal(null);
          return Note.find({tags: itemId});
        })
        .then(data => {
          expect(data).to.be.a('array');
          expect(data.length).to.equal(0);
        });
    });
  });
});