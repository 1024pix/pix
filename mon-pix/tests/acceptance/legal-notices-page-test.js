import {
  afterEach,
  beforeEach,
  describe,
  it
} from 'mocha';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | Page | Legal notices', function() {

  let application;

  beforeEach(function() {
    application = startApp();
  });

  afterEach(function() {
    destroyApp(application);
  });

  it('should be accessible from "/mentions-legales"', function() {

    visit('/mentions-legales');

    return andThen(() => {
      findWithAssert('.legal-notices-page');
    });
  });

});
