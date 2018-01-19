import {
  afterEach,
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

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
