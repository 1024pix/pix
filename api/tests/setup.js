'use strict';

// Global variables used int tests.
global.nock = require('nock');
nock.disableNetConnect();

global.sinon = require('sinon');
global.chai = require('chai');
global.expect = global.chai.expect;
