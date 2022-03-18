import { beforeEach, describe, it } from 'mocha';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { getPageTitle } from 'ember-page-title/test-support';
import { authenticateByEmail } from '../helpers/authentication';
import { expect } from 'chai';
import { click, find, triggerEvent, visit } from '@ember/test-helpers';

describe('Acceptance | Displaying a challenge of any type', () => {
  setupApplicationTest();
  setupMirage();

  let assessment;

  [{ challengeType: 'QROC' }, { challengeType: 'QROCM' }, { challengeType: 'QCM' }, { challengeType: 'QCU' }].forEach(
    function (data) {
      describe(`when ${data.challengeType} challenge is focused`, function () {
        it('should display a specific page title', async function () {
          // given
          assessment = server.create('assessment', 'ofCompetenceEvaluationType');
          server.create('challenge', 'forCompetenceEvaluation', data.challengeType, 'withFocused');

          // when
          await visit(`/assessments/${assessment.id}/challenges/0`);

          // then
          expect(getPageTitle()).to.contain('Mode focus');
        });

        describe('when user has not answered the question', function () {
          describe('when user has not seen the challenge tooltip yet', function () {
            beforeEach(async () => {
              // given
              const user = server.create('user', 'withEmail', {
                hasSeenFocusedChallengeTooltip: false,
              });
              await authenticateByEmail(user);

              assessment = server.create('assessment', 'ofCompetenceEvaluationType');
              server.create('challenge', 'forCompetenceEvaluation', data.challengeType, 'withFocused');

              // when
              await visit(`/assessments/${assessment.id}/challenges/0`);
            });

            it('should display a tooltip', async () => {
              // then
              expect(find('.tooltip-tag__information')).to.exist;
            });

            it('should display an info alert with dashed border and overlay', async function () {
              // when
              const challengeItem = find('.challenge-item');
              await triggerEvent(challengeItem, 'mouseleave', { relatedTarget: challengeItem });

              // then
              expect(find('.challenge__info-alert--show')).to.exist;
              expect(find('.challenge-item--focused')).to.exist;
              expect(find('.challenge__focused-out-overlay')).to.exist;
            });

            describe('when user closes tooltip', () => {
              beforeEach(async function () {
                // given
                assessment = server.create('assessment', 'ofCompetenceEvaluationType');
                server.create('challenge', 'forCompetenceEvaluation', data.challengeType, 'withFocused');

                // when
                await visit(`/assessments/${assessment.id}/challenges/0`);
                await click('.tooltip-tag-information__button');
              });

              it('should hide a tooltip', async () => {
                // then
                expect(find('#challenge-statement-tag--tooltip')).to.not.exist;
              });

              it('should enable input and buttons', async () => {
                // then
                expect(find('.challenge-actions__action-skip').getAttribute('disabled')).to.not.exist;
                expect(find('.challenge-actions__action-validate').getAttribute('disabled')).to.not.exist;
                expect(find('[data-test="challenge-response-proposal-selector"]').getAttribute('disabled')).to.not
                  .exist;
              });

              it('should display a warning alert', async function () {
                // when
                await triggerEvent(document, 'focusedout');

                // then
                expect(find('[data-test="alert-message-focused-out-of-window"]')).to.exist;
              });

              it('should display an info alert with dashed border and overlay', async function () {
                // when
                const challengeItem = find('.challenge-item');
                await triggerEvent(challengeItem, 'mouseleave', { relatedTarget: challengeItem });

                // then
                expect(find('.challenge__info-alert--could-show')).to.exist;
                expect(find('.challenge-item--focused')).to.exist;
                expect(find('.challenge__focused-out-overlay')).to.exist;
              });

              it('should display only the warning alert when it has been triggered', async function () {
                // given
                const challengeItem = find('.challenge-item');
                await triggerEvent(challengeItem, 'mouseleave', { relatedTarget: challengeItem });

                expect(find('.challenge__info-alert--could-show')).to.exist;
                expect(find('.challenge-item--focused')).to.exist;
                expect(find('.challenge__focused-out-overlay')).to.exist;

                // when
                await triggerEvent(document, 'focusedout');

                // then
                expect(find('.challenge__info-alert--could-show')).to.not.exist;
                expect(find('[data-test="alert-message-focused-out-of-window"]')).to.exist;
                expect(find('.challenge-item--focused')).to.exist;
                expect(find('.challenge__focused-out-overlay')).to.exist;
              });
            });
          });

          describe('when user has already seen challenge tooltip', function () {
            beforeEach(async () => {
              const user = server.create('user', 'withEmail', {
                hasSeenFocusedChallengeTooltip: true,
              });
              await authenticateByEmail(user);

              assessment = server.create('assessment', 'ofCompetenceEvaluationType');
              server.create('challenge', 'forCompetenceEvaluation', data.challengeType, 'withFocused');

              await visit(`/assessments/${assessment.id}/challenges/0`);
            });

            it('should hide the tooltip', async function () {
              // then
              expect(find('#challenge-statement-tag--tooltip')).to.not.exist;
            });

            it('should enable input and buttons', async function () {
              // then
              expect(find('.challenge-actions__action-skip').getAttribute('disabled')).to.not.exist;
              expect(find('.challenge-actions__action-validate').getAttribute('disabled')).to.not.exist;
              expect(find('[data-test="challenge-response-proposal-selector"]').getAttribute('disabled')).to.not.exist;
            });
          });
        });

        describe('when user has already answered the question', function () {
          it('should not display the overlay, dashed-border and warning messages', async function () {
            // given
            assessment = server.create('assessment', 'ofCompetenceEvaluationType');
            server.create('answer', {
              value: 'Reponse',
              result: 'ko',
              assessment,
              challenge: server.create('challenge', 'forCompetenceEvaluation', `${data.challengeType}`, 'withFocused'),
            });

            // when
            await visit(`/assessments/${assessment.id}/challenges/0`);
            const challengeItem = find('.challenge-item');
            await triggerEvent(challengeItem, 'mouseleave');

            // then
            expect(find('.challenge__info-alert--could-show')).to.not.exist;
            expect(find('.challenge__focused-out-overlay')).to.not.exist;
            expect(find('.challenge-actions__focused-out-of-window')).to.not.exist;
            expect(find('.challenge-actions__already-answered')).to.exist;
          });
        });

        describe('when user has focused out of the window', function () {
          beforeEach(async function () {
            // given
            const user = server.create('user', 'withEmail', {
              hasSeenFocusedChallengeTooltip: true,
            });
            await authenticateByEmail(user);
          });

          describe('when assessment is of type certification', function () {
            beforeEach(async function () {
              // given
              assessment = server.create('assessment', 'ofCertificationType');
              server.create('challenge', 'forCertification', data.challengeType, 'withFocused');

              const certificationCourse = server.create('certification-course', {
                accessCode: 'ABCD12',
                sessionId: 1,
                nbChallenges: 1,
                firstName: 'Laura',
                lastName: 'Bravo',
              });
              assessment = certificationCourse.assessment;

              await visit(`/assessments/${assessment.id}/challenges/0`);
              await click('.focused-certification-challenge-instructions-action__confirmation-button');

              // when
              await triggerEvent(document, 'focusedout');
            });

            it('should display the certification warning alert', async function () {
              // then
              expect(find('[data-test="certification-focused-out-error-message"]')).to.exist;
              expect(find('[data-test="default-focused-out-error-message"]')).not.to.exist;
            });

            it('should add failure to the page title', async function () {
              // then
              expect(getPageTitle()).to.contain('Échoué');
            });
          });

          describe('when assessment is not of type certification', function () {
            beforeEach(async function () {
              // given
              assessment = server.create('assessment', 'ofCompetenceEvaluationType');
              server.create('challenge', 'forCompetenceEvaluation', data.challengeType, 'withFocused');

              await visit(`/assessments/${assessment.id}/challenges/0`);

              // when
              await triggerEvent(document, 'focusedout');
            });

            it('should display the default warning alert', async function () {
              // then
              expect(find('[data-test="default-focused-out-error-message"]')).to.exist;
              expect(find('[data-test="certification-focused-out-error-message"]')).not.to.exist;
            });

            it('should not add failure to the page title', async function () {
              // then
              expect(getPageTitle()).to.not.contain('Échoué');
            });
          });
        });

        describe('when user has already focusedout the challenge', function () {
          beforeEach(async () => {
            // given
            const user = server.create('user', 'withEmail', {
              hasSeenFocusedChallengeTooltip: true,
            });
            await authenticateByEmail(user);
            assessment = server.create('assessment', 'ofCompetenceEvaluationType', 'withCurrentChallengeUnfocus');
            server.create('challenge', 'forCompetenceEvaluation', data.challengeType, 'withFocused');

            // when
            await visit(`/assessments/${assessment.id}/challenges/0`);
          });

          it('should enable input and buttons', async () => {
            // then
            expect(find('.challenge-actions__action-skip').getAttribute('disabled')).to.not.exist;
            expect(find('.challenge-actions__action-validate').getAttribute('disabled')).to.not.exist;
            expect(find('[data-test="challenge-response-proposal-selector"]').getAttribute('disabled')).to.not.exist;
          });

          it('should display the warning alert to say it has been focusedouted', async function () {
            // then
            expect(find('[data-test="default-focused-out-error-message"]')).to.exist;
          });
        });
      });

      [
        { challengeType: 'QROC' },
        { challengeType: 'QROCM' },
        { challengeType: 'QCM' },
        { challengeType: 'QCU' },
      ].forEach(function (data) {
        describe(`when ${data.challengeType} challenge is not focused`, function () {
          describe('when user has not answered the question', function () {
            describe('when user has not seen the challenge tooltip yet', function () {
              beforeEach(async () => {
                // given
                const user = server.create('user', 'withEmail', {
                  hasSeenOtherChallengesTooltip: false,
                });
                await authenticateByEmail(user);

                assessment = server.create('assessment', 'ofCompetenceEvaluationType');
                server.create('challenge', 'forCompetenceEvaluation', data.challengeType);

                // when
                await visit(`/assessments/${assessment.id}/challenges/0`);
              });

              it('should display a tooltip', async () => {
                // then
                expect(find('.tooltip-tag__information')).to.exist;
              });

              describe('when user closes tooltip', () => {
                beforeEach(async function () {
                  // given
                  assessment = server.create('assessment', 'ofCompetenceEvaluationType');
                  server.create('challenge', 'forCompetenceEvaluation', data.challengeType);

                  // when
                  await visit(`/assessments/${assessment.id}/challenges/0`);
                  await click('.tooltip-tag-information__button');
                });

                it('should hide a tooltip', async () => {
                  // then
                  expect(find('#challenge-statement-tag--tooltip')).to.not.exist;
                });

                it('should enable input and buttons', async () => {
                  // then
                  expect(find('.challenge-actions__action-skip').getAttribute('disabled')).to.not.exist;
                  expect(find('.challenge-actions__action-validate').getAttribute('disabled')).to.not.exist;
                  expect(find('[data-test="challenge-response-proposal-selector"]').getAttribute('disabled')).to.not
                    .exist;
                });
              });
            });

            describe('when user has already seen challenge tooltip', function () {
              beforeEach(async () => {
                const user = server.create('user', 'withEmail', {
                  hasSeenOtherChallengesTooltip: true,
                });
                await authenticateByEmail(user);

                assessment = server.create('assessment', 'ofCompetenceEvaluationType');
                server.create('challenge', 'forCompetenceEvaluation', data.challengeType);

                await visit(`/assessments/${assessment.id}/challenges/0`);
              });

              it('should hide the overlay and tooltip', async function () {
                // then
                expect(find('.challenge__overlay')).to.not.exist;
                expect(find('#challenge-statement-tag--tooltip')).to.not.exist;
              });

              it('should enable input and buttons', async function () {
                // then
                expect(find('.challenge-actions__action-skip').getAttribute('disabled')).to.not.exist;
                expect(find('.challenge-actions__action-validate').getAttribute('disabled')).to.not.exist;
                expect(
                  find('[data-test="challenge-response-proposal-selector"]').getAttribute('disabled')
                ).to.not.exist;
              });
            });
          });

          describe('when user has already answered the question', function () {
            it('should not display the overlay, dashed-border and warning messages', async function () {
              // given
              assessment = server.create('assessment', 'ofCompetenceEvaluationType');
              server.create('answer', {
                value: 'Reponse',
                result: 'ko',
                assessment,
                challenge: server.create(
                  'challenge',
                  'forCompetenceEvaluation',
                  `${data.challengeType}`,
                  'withFocused'
                ),
              });

              // when
              await visit(`/assessments/${assessment.id}/challenges/0`);
              const challengeItem = find('.challenge-item');
              await triggerEvent(challengeItem, 'mouseleave');

              // then
              expect(find('.challenge__info-alert--could-show')).to.not.exist;
              expect(find('.challenge__focused-out-overlay')).to.not.exist;
              expect(find('.challenge-actions__focused-out-of-window')).to.not.exist;
              expect(find('.challenge-actions__already-answered')).to.exist;
            });
          });

          it('should not display warning block', async function () {
            // given
            assessment = server.create('assessment', 'ofCompetenceEvaluationType');
            server.create('challenge', 'forCompetenceEvaluation', data.challengeType);

            // when
            await visit(`/assessments/${assessment.id}/challenges/0`);

            // then
            expect(find('.challenge__info-alert')).to.not.exist;
          });

          describe('when user has focused out of document', function () {
            beforeEach(async function () {
              // given
              const user = server.create('user', 'withEmail');
              await authenticateByEmail(user);
              assessment = server.create('assessment', 'ofCompetenceEvaluationType');
              server.create('challenge', 'forCompetenceEvaluation', data.challengeType);

              // when
              await visit(`/assessments/${assessment.id}/challenges/0`);
            });

            it('should not display instructions', async function () {
              // then
              expect(find('.focused-challenge-instructions-action__confirmation-button')).to.not.exist;
            });

            it('should not display a warning alert', async function () {
              // when
              await triggerEvent(document, 'focusedout');
              // then
              expect(find('.challenge-actions__focused-out-of-window')).to.not.exist;
            });
          });
        });
      });
    }
  );
});
