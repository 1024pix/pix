import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import startApp from 'pix-live/tests/helpers/start-app';
import destroyApp from 'pix-live/tests/helpers/destroy-app';

describe('Acceptance | series', function() {

  let application;

  beforeEach(function() {
    application = startApp();
  });

  afterEach(function() {
    destroyApp(application);
  });

  it('I can access to the historic of the weekly courses series by the url /defis-pix', function() {
    visit('/defis-pix');

    return andThen(() => {
      expect(currentURL()).to.equal('/defis-pix');
    });
  });
});
