import { AssertionError, util } from 'chai';
// Utility used to test Chai custom helpers
//
// Inspired by what is done within chai project itself to test assertions
// https://github.com/chaijs/chai/blob/main/test/bootstrap/index.js
export function expectChaiError(fn, val) {
  if (util.type(fn) !== 'Function') throw new AssertionError('Invalid fn');

  try {
    fn();
  } catch (err) {
    switch (util.type(val).toLowerCase()) {
      case 'undefined':
        return;
      case 'string':
        return expect(err.message).to.equal(val);
      case 'regexp':
        return expect(err.message).to.match(val);
      case 'object':
        return Object.keys(val).forEach(function (key) {
          expect(err).to.have.property(key).and.to.deep.equal(val[key]);
        });
    }

    throw new AssertionError('Invalid val');
  }

  throw new AssertionError('Expected an error');
}
