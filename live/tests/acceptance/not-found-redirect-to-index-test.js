import { afterEach, beforeEach, describe, it } from 'mocha';
import { startApp, destroyApp } from '../helpers/application';
import { expect } from 'chai';

describe('Acceptance | Page | Not Found Redirection', () => {

  let application;

  beforeEach(() => {
    application = startApp();
  });

  afterEach(() => {
    destroyApp(application);
  });

  it('should redirect to home page when URL is a nonexistant page', () => {

    visit('/plop');

    return andThen(() => {
      expect(currentURL()).to.eq('/');
    });
  });

});
