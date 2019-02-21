import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | Page | Inscription', function() {

  let application;

  beforeEach(function() {
    application = startApp();
  });

  afterEach(function() {
    destroyApp(application);
  });

  it('should contain a link to "Terms of service" page', function() {

    visit('/inscription');

    andThen(() => {
      const $termsOfServiceLink = findWithAssert('.signup-form__cgu .link');
      return expect($termsOfServiceLink.attr('href').trim()).to.equal('https://pix.fr/conditions-generales-d-utilisation');
    });
  });

});
