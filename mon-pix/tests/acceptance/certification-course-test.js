import { setupMirage } from 'ember-cli-mirage/test-support';
import { click, currentURL, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-mocha';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateByEmail } from '../helpers/authentification';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';
import { fillCertificationJoiner, fillCertificationStarter } from '../helpers/certification';

describe('Acceptance | Certification | Start Certification Course', function() {
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
            await fillCertificationJoiner(
              { sessionId: '1', firstName: 'Laura', lastName: '', dayOfBirth: '04', monthOfBirth: '01', yearOfBirth: '1990' });
          });

          it('should display an error message', function() {
            // then
            expect(find('.certification-course-page__errors').textContent.trim()).to.equal('Oups ! Nous ne parvenons pas à vous trouver.\nVérifiez vos informations afin de continuer ou prévenez le surveillant.');
          });
        });

        context('when no candidate with given info has been registered in the given session', function() {
          beforeEach(async function() {
            // when
            await fillCertificationJoiner(
              { sessionId: '1', firstName: 'Laura', lastName: 'PasInscrite', dayOfBirth: '04', monthOfBirth: '01', yearOfBirth: '1990' });
          });

          it('should display an error message', function() {
            // then
            expect(find('.certification-course-page__errors').textContent.trim()).to.equal('Oups ! Nous ne parvenons pas à vous trouver.\nVérifiez vos informations afin de continuer ou prévenez le surveillant.');
          });
        });

        context('when several candidates with given info are found in the given session', function() {
          beforeEach(async function() {
            // when
            await fillCertificationJoiner(
              { sessionId: '1', firstName: 'Laura', lastName: 'PlusieursMatchs', dayOfBirth: '04', monthOfBirth: '01', yearOfBirth: '1990' });
          });

          it('should display an error message', function() {
            // then
            expect(find('.certification-course-page__errors').textContent.trim()).to.equal('Oups ! Nous ne parvenons pas à vous trouver.\nVérifiez vos informations afin de continuer ou prévenez le surveillant.');
          });
        });

        context('when user has already been linked to another candidate in the session', function() {
          beforeEach(async function() {
            // when
            await fillCertificationJoiner(
              { sessionId: '1', firstName: 'Laura', lastName: 'UtilisateurLiéAutre', dayOfBirth: '04', monthOfBirth: '01', yearOfBirth: '1990' });
          });

          it('should display an error message', function() {
            // then
            expect(find('.certification-course-page__errors').textContent.trim()).to.equal('Oups ! Nous ne parvenons pas à vous trouver.\nVérifiez vos informations afin de continuer ou prévenez le surveillant.');
          });
        });

        context('when candidate has already been linked to another user in the session', function() {
          beforeEach(async function() {
            // when
            await fillCertificationJoiner(
              { sessionId: '1', firstName: 'Laura', lastName: 'CandidatLiéAutre', dayOfBirth: '04', monthOfBirth: '01', yearOfBirth: '1990' });
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
            await fillCertificationJoiner(
              { sessionId: '1', firstName: 'Laura', lastName: 'CandidatLiéUtilisateur', dayOfBirth: '04', monthOfBirth: '01', yearOfBirth: '1990' });
          });

          it('should render the component to provide the access code', function() {
            // then
            expect(find('.certification-start-page__title')).to.exist;
          });
        });

        context('when user is successfuly linked to the candidate', function() {
          beforeEach(async function() {
            // when
            await fillCertificationJoiner(
              { sessionId: '1', firstName: 'Laura', lastName: 'Bravo', dayOfBirth: '04', monthOfBirth: '01', yearOfBirth: '1990' });
          });

          it('should render the component to provide the access code', function() {
            // then
            expect(find('.certification-start-page__title')).to.exist;
          });
        });

        context('when user takes the certification course', function() {
          let certificationCourse;
          let assessment;
          const NB_CHALLENGES = 3;

          beforeEach(function() {
            for (let i = 0; i < NB_CHALLENGES; ++i) {
              server.create('challenge', 'forCertification');
            }
            certificationCourse = server.create('certification-course', {
              accessCode: 'ABCD12',
              sessionId: 1,
              nbChallenges: NB_CHALLENGES
            });
            assessment = certificationCourse.assessment;
          });

          context('when user enter a correct code session', function() {
            beforeEach(async function() {
              // when
              await fillCertificationJoiner(
                { sessionId: '1', firstName: 'Laura', lastName: 'Bravo', dayOfBirth: '04', monthOfBirth: '01', yearOfBirth: '1990' });
              await fillCertificationStarter({ accessCode: 'ABCD12' });
            });

            it('should be redirected on the first challenge of an assessment', async function() {
              // then
              expect(currentURL().startsWith(`/assessments/${assessment.id}/challenges/rec`)).to.be.true;
            });

            it('should navigate to next challenge when we click pass', async function() {
              // when
              await click('.challenge-actions__action-skip-text');

              // then
              expect(currentURL().startsWith(`/assessments/${assessment.id}/challenges/rec`)).to.be.true;
            });

            context('after skipping the all challenges of the certification course', function() {

              it('should navigate to redirect to certification result page at the end of the assessment', async function() {
                // when
                for (let i = 0; i < NB_CHALLENGES; ++i) {
                  await click('.challenge-actions__action-skip');
                }

                // then
                expect(currentURL()).to.equal(`/certifications/${certificationCourse.id}/results`);
              });
            });
          });

          context('When stop and relaunch the certification course', function() {

            it('should be redirected directly on the certification course', async function() {
              // given
              await fillCertificationJoiner(
                { sessionId: '1', firstName: 'Laura', lastName: 'Bravo', dayOfBirth: '04', monthOfBirth: '01', yearOfBirth: '1990' });
              await fillCertificationStarter({ accessCode: 'ABCD12' });

              await click('.challenge-actions__action-skip');
              await visitWithAbortedTransition('/profil');
              // when
              await visitWithAbortedTransition(`/certifications/${certificationCourse.id}`);

              // then
              expect(currentURL().startsWith(`/assessments/${assessment.id}/challenges/rec`)).to.be.true;
            });
          });
        });
      });
    });
  });
});
