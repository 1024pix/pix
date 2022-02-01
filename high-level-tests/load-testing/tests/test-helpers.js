const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
chai.use(require('sinon-chai'));

afterEach(() => {
  sinon.restore();
});

module.exports = {
  expect,
  sinon,
};
