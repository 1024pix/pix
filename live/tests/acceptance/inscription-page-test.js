import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { startApp, destroyApp } from '../helpers/application';

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

    return andThen(() => {
      const $termsOfServiceLink = findWithAssert('.signup__cgu-link');
      expect($termsOfServiceLink.attr('href').trim()).to.equal('/conditions-generales-d-utilisation');
    });
  });

});
