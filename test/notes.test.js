'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server.js')
const Note = require('../models/note');
const seedNotes = require('../db/seed/notes');

const expect = chai.expect;
chai.use(chaiHttp);


describe('Reality Check', () => {

  it('true should be true', () => {
    expect(true).to.be.true;
  });
  
  it('2 + 2 should equal 4', () => {
    expect(2 + 2).to.equal(4);
  });
  
});