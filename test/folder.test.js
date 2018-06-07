'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { TEST_MONGODB_URI } = require('../config');
const app = require('../server.js');
const Note = require('../models/note');
const Folder = require('../models/folder');
const seedNotes = require('../db/seed/notes');
const seedFolders = require('../db/seed/folders');

const expect = chai.expect;
chai.use(chaiHttp);



describe('folders router', () => {

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });
      
  beforeEach(function () {
    return Note.insertMany(seedNotes)
      .then(()=> Folder.insertMany(seedFolders));
  });
      
  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });
      
  after(function () {
    return mongoose.disconnect();
  });


  describe('GET /api/folders', function(){

    it('/ should return a JSON object containing an array of folders',()=>{
      return Promise.all([
        Folder.find(),
        chai.request(app).get('/api/folders')
      ]).then(([data, res]) =>{
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('array');
        expect(res.body).to.have.length(data.length);
      });
    });

    it('/ [ID]should return the folder object with the corresponding ID',()=>{
      const sampleId = '111111111111111111111102';
      return Promise.all([
        Folder.findById(sampleId),
        chai.request(app).get(`/api/folders/${sampleId}`)
      ]).then(([data, res]) =>{
        expect(res).to.have.status(200);
        expect(data.name).to.be.equal(res.body.name);
        expect(data.id).to.be.equal(res.body.id);
      });
    });
  });

  describe('POST /api/folders', function(){
    it('/ should create and return a new item when provided valid data', ()=> {
      const newFolder = {name: 'rigid'};
        
      let res;
      return chai.request(app)
        .post('/api/folders')
        .send(newFolder)
        .then(_res =>{
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body.name).to.equal('rigid');
          return Folder.findById(res.body.id);
        })
        .then(data => {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
        });
    });
  });

  describe('PUT /api/folders', function(){

    it('/ [ID ]should update and return an item at a given ID', function () {
      const updItem = {'name': 'something else'};
      const itemId = '111111111111111111111103';

      let res;
        
      return chai.request(app)
        .put(`/api/folders/${itemId}`)
        .send(updItem)
        .then( _res => {
          res = _res;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.name).to.equal('something else');
            
          return Folder.findById(itemId);
        })
        .then(data => {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
  });

  describe('DELETE /api/folders', function(){
    const itemId = '111111111111111111111103';

    return chai.request(app)
      .del(`/api/notes/${itemId}`)
      .then(function (res) {
        expect(res).to.have.status(204);          
        return Folder.findById(itemId);
      })
      .then(data => {
        expect(data).to.be.equal(null);
      });
  });


});