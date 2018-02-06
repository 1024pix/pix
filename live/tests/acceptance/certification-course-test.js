import {
  afterEach,
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
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

  describe('Start a certification course', function() {

    context('When user is not logged in', function() {

      beforeEach(async function() {
        await visit('/certifications?code=10ue1');
      });

      it('should redirect to login page', function() {
        // then
        expect(currentURL()).to.match(/connexion/);
      });

    });

    context.skip('When user is logged in', function() {

      beforeEach(async function() {
        authenticateAsSimpleUser();
        await visit('/certifications?code=10ue1');
      });

      it('should be redirected on the first challenge of an assessment', function() {
        // then
        expect(currentURL()).to.match(/assessments\/\d+\/challenges\/1/);
      });

      it('should navigate to next challenge when we click pass', async function() {
        // when
        await click('.challenge-actions__action-skip-text');

        // then
        expect(currentURL()).to.match(/assessments\/\d+\/challenges\/2/);
      });

      it('should navigate to redirect to certification result page at the end of the assessment', async function() {
        // given
        await click('.challenge-actions__action-skip');

        // when
        await click('.challenge-actions__action-skip');

        // then
        expect(currentURL()).to.equal('/certifications/certification-number/results');
      });

    });

    context.skip('When stop and relaunch the certification course', function() {

      it('should be redirected on the second challenge of an assessment', async function() {
        // given
        await visit('/certifications?code=10ue1');
        await click('.challenge-actions__action-skip-text');
        await visit('/compte');

        // when
        await visit('/certifications/certification-number');

        // then
        expect(currentURL()).to.match(/assessments\/\d+\/challenges\/2/);
      });

    });
  });
});
