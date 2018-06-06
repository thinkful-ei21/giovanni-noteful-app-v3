'use strict';

exports.PORT = process.env.PORT || 8080;
exports.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://dev:098poi@ds255889.mlab.com:55889/noteful-v3';
exports.TEST_MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://dev:098poi@ds251210.mlab.com:51210/test-db';