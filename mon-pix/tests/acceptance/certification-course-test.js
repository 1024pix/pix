import { click, currentURL, fillIn, find } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateByEmail } from '../helpers/authentification';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Certification | Start Course', function() {

  setupApplicationTest();
  setupMirage();

  let user;

  beforeEach(function() {
    defaultScenario(this.server);
  });

  describe('Start a certification course', function() {

    context('When user is not logged in', function() {

      beforeEach(async function() {
        user = server.create('user', 'withEmail');
        await visitWithAbortedTransition('/certifications');
      });

      it('should redirect to login page', function() {
        // then
        expect(currentURL()).to.match(/connexion/);
      });

    });

    context('When user is logged in', function() {

      context('When user is not certifiable', function() {

        beforeEach(async function() {
          user = server.create('user', 'withEmail', 'notCertifiable');
          await authenticateByEmail(user);
          const currentUser = this.owner.lookup('service:currentUser');
          await currentUser.load();
          await currentUser.user.get('certificationProfile');
          currentUser.user.get('certificationProfile').set('isCertifiable', false);
          return visitWithAbortedTransition('/certifications');
        });

        it('should render the not certifiable template', function() {
          expect(find('.certification-not-certifiable__title').textContent.trim()).to.equal('Votre profil n\'est pas encore certifiable.');
        });

      });

      context('When user is certifiable', function() {

        beforeEach(async function() {
          user = server.create('user', 'withEmail', 'certifiable');
          await authenticateByEmail(user);
          return visitWithAbortedTransition('/certifications');
        });

        context('when user forget to fill a field', function() {
          beforeEach(async function() {
            await visitWithAbortedTransition('/certifications');

            // when
            await fillIn('#certificationJoinerSessionId', '1');
            await fillIn('#certificationJoinerFirstName', 'Laura');
            await fillIn('#certificationJoinerDayOfBirth', '04');
            await fillIn('#certificationJoinerMonthOfBirth', '01');
            await fillIn('#certificationJoinerYearOfBirth', '1990');
            await click('.certification-joiner__attempt-next-btn');
          });

          it('should display an error message', function() {
            // then
            expect(find('.certification-course-page__errors').textContent.trim()).to.equal('Oups ! Nous ne parvenons pas à vous trouver.\nVérifiez vos informations afin de continuer ou prévenez le surveillant.');
          });
        });

        context('when no candidate with given info has been registered in the given session', function() {
          beforeEach(async function() {
            // when
            await fillIn('#certificationJoinerSessionId', '1');
            await fillIn('#certificationJoinerFirstName', 'Laura');
            await fillIn('#certificationJoinerLastName', 'PasInscrite');
            await fillIn('#certificationJoinerDayOfBirth', '04');
            await fillIn('#certificationJoinerMonthOfBirth', '01');
            await fillIn('#certificationJoinerYearOfBirth', '1990');
            await click('.certification-joiner__attempt-next-btn');
          });

          it('should display an error message', function() {
            // then
            expect(find('.certification-course-page__errors').textContent.trim()).to.equal('Oups ! Nous ne parvenons pas à vous trouver.\nVérifiez vos informations afin de continuer ou prévenez le surveillant.');
          });
        });

        context('when several candidates with given info are found in the given session', function() {
          beforeEach(async function() {
            // when
            await fillIn('#certificationJoinerSessionId', '1');
            await fillIn('#certificationJoinerFirstName', 'Laura');
            await fillIn('#certificationJoinerLastName', 'PlusieursMatchs');
            await fillIn('#certificationJoinerDayOfBirth', '04');
            await fillIn('#certificationJoinerMonthOfBirth', '01');
            await fillIn('#certificationJoinerYearOfBirth', '1990');
            await click('.certification-joiner__attempt-next-btn');
          });

          it('should display an error message', function() {
            // then
            expect(find('.certification-course-page__errors').textContent.trim()).to.equal('Oups ! Nous ne parvenons pas à vous trouver.\nVérifiez vos informations afin de continuer ou prévenez le surveillant.');
          });
        });

        context('when user has already been linked to another candidate in the session', function() {
          beforeEach(async function() {
            // when
            await fillIn('#certificationJoinerSessionId', '1');
            await fillIn('#certificationJoinerFirstName', 'Laura');
            await fillIn('#certificationJoinerLastName', 'UtilisateurLiéAutre');
            await fillIn('#certificationJoinerDayOfBirth', '04');
            await fillIn('#certificationJoinerMonthOfBirth', '01');
            await fillIn('#certificationJoinerYearOfBirth', '1990');
            await click('.certification-joiner__attempt-next-btn');
          });

          it('should display an error message', function() {
            // then
            expect(find('.certification-course-page__errors').textContent.trim()).to.equal('Oups ! Nous ne parvenons pas à vous trouver.\nVérifiez vos informations afin de continuer ou prévenez le surveillant.');
          });
        });

        context('when candidate has already been linked to another user in the session', function() {
          beforeEach(async function() {
            // when
            await fillIn('#certificationJoinerSessionId', '1');
            await fillIn('#certificationJoinerFirstName', 'Laura');
            await fillIn('#certificationJoinerLastName', 'CandidatLiéAutre');
            await fillIn('#certificationJoinerDayOfBirth', '04');
            await fillIn('#certificationJoinerMonthOfBirth', '01');
            await fillIn('#certificationJoinerYearOfBirth', '1990');
            await click('.certification-joiner__attempt-next-btn');
          });

          it('should display an error message', function() {
            // then
            expect(find('.certification-course-page__errors').textContent.trim()).to.equal('Oups ! Nous ne parvenons pas à vous trouver.\nVérifiez vos informations afin de continuer ou prévenez le surveillant.');
          });
        });

        context('when user is already linked to this candidate', function() {
          beforeEach(async function() {
            // given
            this.server.schema.certificationCandidates.create({
              id: 1,
              firstName: 'Laura',
              lastName: 'CandidatLiéUtilisateur',
              sessionId: 1,
              birthdate: '1990-01-04',
            });
            // when
            await fillIn('#certificationJoinerSessionId', '1');
            await fillIn('#certificationJoinerFirstName', 'Laura');
            await fillIn('#certificationJoinerLastName', 'CandidatLiéUtilisateur');
            await fillIn('#certificationJoinerDayOfBirth', '04');
            await fillIn('#certificationJoinerMonthOfBirth', '01');
            await fillIn('#certificationJoinerYearOfBirth', '1990');
            await click('.certification-joiner__attempt-next-btn');
          });

          it('should render the component to provide the access code', function() {
            // then
            expect(find('.certification-start-page__title')).to.exist;
          });
        });

        context('when user is successfuly linked to the candidate', function() {
          beforeEach(async function() {
            // when
            await fillIn('#certificationJoinerSessionId', '1');
            await fillIn('#certificationJoinerFirstName', 'Laura');
            await fillIn('#certificationJoinerLastName', 'Bravo');
            await fillIn('#certificationJoinerDayOfBirth', '04');
            await fillIn('#certificationJoinerMonthOfBirth', '01');
            await fillIn('#certificationJoinerYearOfBirth', '1990');
            await click('.certification-joiner__attempt-next-btn');
          });

          it('should render the component to provide the access code', function() {
            // then
            expect(find('.certification-start-page__title')).to.exist;
          });
        });

        context('when user enter a correct code session', function() {
          beforeEach(async function() {
            // when
            await fillIn('#certificationJoinerSessionId', '1');
            await fillIn('#certificationJoinerFirstName', 'Laura');
            await fillIn('#certificationJoinerLastName', 'Bravo');
            await fillIn('#certificationJoinerDayOfBirth', '04');
            await fillIn('#certificationJoinerMonthOfBirth', '01');
            await fillIn('#certificationJoinerYearOfBirth', '1990');
            await click('.certification-joiner__attempt-next-btn');
            await fillIn('#certificationStarterSessionCode', 'ABCD12');
            await click('.certification-course-page__submit_button');
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
              expect(currentURL()).to.equal('/certifications/certification-course-id/results');
            });
          });
        });

        context('When stop and relaunch the certification course', function() {

          it('should be redirected on the second challenge of an assessment', async function() {
            // given
            await fillIn('#certificationJoinerSessionId', '1');
            await fillIn('#certificationJoinerFirstName', 'Laura');
            await fillIn('#certificationJoinerLastName', 'Bravo');
            await fillIn('#certificationJoinerDayOfBirth', '04');
            await fillIn('#certificationJoinerMonthOfBirth', '01');
            await fillIn('#certificationJoinerYearOfBirth', '1990');
            await click('.certification-joiner__attempt-next-btn');
            await fillIn('#certificationStarterSessionCode', '10ue1');
            await click('.certification-course-page__submit_button');

            await click('.challenge-actions__action-skip');
            await visitWithAbortedTransition('/profil');
            // when
            await visitWithAbortedTransition('/certifications/certification-course-id');

            // then
            expect(currentURL()).to.match(/assessments\/\d+\/challenges\/recLt9uwa2dR3IYpi/);
          });
        });
      });
    });
  });
});
