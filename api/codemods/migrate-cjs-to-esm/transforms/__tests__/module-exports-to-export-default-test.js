'use strict';

const { defineTest } = require('jscodeshift/dist/testUtils');
defineTest(__dirname, 'module-exports-to-export-default', null, 'module-exports-to-export-default-test');
defineTest(__dirname, 'module-exports-to-export-default', null, 'module-exports-to-export-default-test2');
