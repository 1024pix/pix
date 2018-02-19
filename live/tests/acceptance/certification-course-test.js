import { afterEach, beforeEach, describe, it } from 'mocha';
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

    context('When user is logged in', function() {

      beforeEach(async function() {
        authenticateAsSimpleUser();
        await visit('/certifications?code=10ue1');
      });

      it('should be redirected on the first challenge of an assessment', function() {
        // then
        expect(currentURL()).to.match(/assessments\/1\/challenges\/receop4TZKvtjjG0V/);
      });

      it('should navigate to next challenge when we click pass', async function() {
        // when
        await click('.challenge-actions__action-skip-text');

        // then
        expect(currentURL()).to.match(/assessments\/1\/challenges\/recLt9uwa2dR3IYpi/);
      });

      context('after skipping the all three challenges of the certification course', function() {

        it('should navigate to redirect to certification result page at the end of the assessment', async function() {
          // given
          await click('.challenge-actions__action-skip');
          await click('.challenge-actions__action-skip');

          // when
          await click('.challenge-item-warning__confirm-btn');
          await click('.challenge-actions__action-skip');

          // then
          expect(currentURL()).to.equal('/certifications/certification-number/results');
        });

      });

    });

    context('When stop and relaunch the certification course', function() {

      it('should be redirected on the second challenge of an assessment', async function() {
        // given
        authenticateAsSimpleUser();
        await visit('/certifications?code=10ue1');
        await click('.challenge-actions__action-skip');
        await visit('/compte');

        // when
        await visit('/certifications/certification-number');

        // then
        expect(currentURL()).to.match(/assessments\/\d+\/challenges\/recLt9uwa2dR3IYpi/);
      });

    });
  });
});
