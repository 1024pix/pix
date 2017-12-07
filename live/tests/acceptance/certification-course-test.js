import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { startApp, destroyApp } from '../helpers/application';
import { authenticateAsSimpleUser } from '../helpers/testing';
import defaultScenario from '../../mirage/scenarios/default';

describe.skip('Acceptance | Certification | Start Course', function() {

  let application;

  beforeEach(function() {
    application = startApp();
    defaultScenario(server);

    authenticateAsSimpleUser();
  });

  afterEach(function() {
    destroyApp(application);
  });

  describe('start certification course', function() {

    context('When starting a certification course', function() {

      beforeEach(async function() {
        await visit('/test-de-certification');
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

    context('When stop and relaunch the certification course', function() {
      it('should be redirected on the second challenge of an assessment', async function() {
        // given
        await visit('/test-de-certification');
        await click('.challenge-actions__action-skip-text');
        await visit('/compte');

        // when
        await visit('/test-de-certification/certification-number');

        // then
        expect(currentURL()).to.match(/assessments\/\d+\/challenges\/2/);
      });
    });
  });
});
