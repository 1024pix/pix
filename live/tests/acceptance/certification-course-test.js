import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { startApp, destroyApp } from '../helpers/application';
import { authenticateAsSimpleUser } from '../helpers/testing';
import defaultScenario from '../../mirage/scenarios/default';

describe('Acceptance | Certification | Start Course', function() {

  let application;

  beforeEach(function() {
    application = startApp();
    defaultScenario(server);
  });

  afterEach(function() {
    destroyApp(application);
  });

  describe('start certification course', function() {

    it('should start a certification course (display course id for the moment)', async function() {
      // given
      authenticateAsSimpleUser();

      // when
      await visit('/test-de-certification');

      // then
      expect(currentURL()).to.equal('/test-de-certification');
      expect(find('.certification-course__course-id').length).to.equal(1);
    });
  });

});
