import {
  afterEach,
  beforeEach,
  describe,
  it
} from 'mocha';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | Page | Terms of service', function() {

  let application;

  beforeEach(function() {
    application = startApp();
  });

  afterEach(function() {
    destroyApp(application);
  });

  it('should be accessible from "/conditions-generales-d-utilisation"', function() {

    visit('/conditions-generales-d-utilisation');

    return andThen(() => {
      findWithAssert('.terms-of-service-page');
    });
  });

});
