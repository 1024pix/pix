import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | a5 - La page des tests adaptatifs', function () {

  let application;

  beforeEach(function () {
    application = startApp();
    visit('/placement-tests');
  });

  afterEach(function () {
    destroyApp(application);
  });

  it('a5.0 est accessible depuis "/placement-tests"', function () {
    expect(currentURL()).to.equal('/placement-tests');
  });

  describe('a5.1 contient une section', function () {

    it('a5.1.1 avec la liste des tests', function () {
      findWithAssert('.placement-tests-page-courses__course-list');
    });
  });
});
