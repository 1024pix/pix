/* globals describe, beforeEach, afterEach */
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

/*
  FIXME: this doesn't works. I don't know why.

  Expected behavior:
  -0- when `describeVisiting` imported and used in acceptance test
  -1- it is called
  -2- content is called
  -3- tests and describe are mocha function and register the example blocks
  -4- mocha run the tests
  -5- we see the results in the report page

  Observed behavior:
  -0- ok
  -1- ok
  -2- ok
  -3- ok (?)
  -4- nope - tests are not ran
  -5- nope - no reporting

  TODO: investigate and use this for all acceptance tests.

 */

export default function(name) {
  describe("Acceptance | visiting " + name, function() {
    beforeEach(function() {
      this.application = startApp();
    });

    afterEach(function() {
      return destroyApp(this.application);
    });
  });
}
