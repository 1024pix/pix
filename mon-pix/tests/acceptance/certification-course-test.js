import { click, fillIn, currentURL } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateAsSimpleUser } from '../helpers/testing';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Certification | Start Course', function() {
  setupApplicationTest();
  setupMirage();

  beforeEach(function() {
    defaultScenario(this.server);
  });

  describe('Start a certification course', function() {

    context('When user is not logged in', function() {

      beforeEach(async function() {
        await visitWithAbortedTransition('/certifications');
      });

      it('should redirect to login page', function() {
        // then
        expect(currentURL()).to.match(/connexion/);
      });

    });

    context('When user is logged in', function() {

      beforeEach(async function() {
        await authenticateAsSimpleUser();
        await visitWithAbortedTransition('/certifications');
      });
      context('when user enter a correct code session', function() {
        beforeEach(async function() {
          // when
          await fillIn('#session-code', 'ABCD12');
          await click('.certification-course-page__submit_button');
        });

        it('should propose to enter the session Code', async function() {
          // then
          expect(currentURL()).to.match(/assessments\/1\/challenges\/receop4TZKvtjjG0V/);

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
    });
    context('When stop and relaunch the certification course', function() {

      it('should be redirected on the second challenge of an assessment', async function() {
        // given
        await authenticateAsSimpleUser();
        await visitWithAbortedTransition('/certifications');
        await fillIn('#session-code', '10ue1');
        await click('.certification-course-page__submit_button');

        await click('.challenge-actions__action-skip');
        await visitWithAbortedTransition('/compte');

        // when
        await visitWithAbortedTransition('/certifications/certification-number');

        // then
        expect(currentURL()).to.match(/assessments\/\d+\/challenges\/recLt9uwa2dR3IYpi/);
      });

    });
  });
});
