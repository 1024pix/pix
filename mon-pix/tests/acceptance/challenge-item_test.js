import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { getPageTitle } from 'ember-page-title/test-support';
import { authenticate } from '../helpers/authentication';
// eslint-disable-next-line no-restricted-imports
import { click, find, triggerEvent } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';

module('Acceptance | Displaying a challenge of any type', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let assessment;

  [{ challengeType: 'QROC' }, { challengeType: 'QROCM' }, { challengeType: 'QCM' }, { challengeType: 'QCU' }].forEach(
    function (data) {
      module(`when ${data.challengeType} challenge is focused`, function () {
        test('should display a specific page title', async function (assert) {
          // given
          assessment = server.create('assessment', 'ofCompetenceEvaluationType');
          server.create('challenge', 'forCompetenceEvaluation', data.challengeType, 'withFocused');

          // when
          await visit(`/assessments/${assessment.id}/challenges/0`);

          // then
          assert.ok(getPageTitle().includes('Mode focus'));
        });

        module('when user has not answered the question', function () {
          module('when user has not seen the challenge tooltip yet', function (hooks) {
            hooks.beforeEach(async function () {
              // given
              const user = server.create('user', 'withEmail', {
                hasSeenFocusedChallengeTooltip: false,
              });
              await authenticate(user);

              assessment = server.create('assessment', 'ofCompetenceEvaluationType');
              server.create('challenge', 'forCompetenceEvaluation', data.challengeType, 'withFocused');

              // when
              await visit(`/assessments/${assessment.id}/challenges/0`);
            });

            test('should display a tooltip', async function (assert) {
              // then
              assert.dom('.tooltip-tag__information').exists();
            });

            test('should display an info alert with dashed border and overlay', async function (assert) {
              // when
              const challengeItem = find('.challenge-item');
              await triggerEvent(challengeItem, 'mouseleave', { relatedTarget: challengeItem });

              // then
              assert.dom('.challenge__info-alert--show').exists();
              assert.dom('.challenge-item--focused').exists();
              assert.dom('.challenge__focused-out-overlay').exists();
            });

            module('when user closes tooltip', function (hooks) {
              hooks.beforeEach(async function () {
                // given
                assessment = server.create('assessment', 'ofCompetenceEvaluationType');
                server.create('challenge', 'forCompetenceEvaluation', data.challengeType, 'withFocused');

                // when
                await visit(`/assessments/${assessment.id}/challenges/0`);
                await click('.tooltip-tag-information__button');
              });

              test('should hide a tooltip', async function (assert) {
                // then
                assert.dom('#challenge-statement-tag--tooltip').doesNotExist();
              });

              test('should enable input and buttons', async function (assert) {
                // then
                assert.ok(find('.challenge-actions__action-skip').getAttribute('aria-disabled').includes('false'));
                assert.ok(find('.challenge-actions__action-validate').getAttribute('aria-disabled').includes('false'));
                assert.notOk(find('[data-test="challenge-response-proposal-selector"]').getAttribute('disabled'));
              });

              test('should display a warning alert', async function (assert) {
                // when
                await triggerEvent(document, 'focusedout');

                // then
                assert.dom('[data-test="alert-message-focused-out-of-window"]').exists();
              });

              test('should display an info alert with dashed border and overlay', async function (assert) {
                // when
                const challengeItem = find('.challenge-item');
                await triggerEvent(challengeItem, 'mouseleave', { relatedTarget: challengeItem });

                // then
                assert.dom('.challenge__info-alert--could-show').exists();
                assert.dom('.challenge-item--focused').exists();
                assert.dom('.challenge__focused-out-overlay').exists();
              });

              test('should display only the warning alert when it has been triggered', async function (assert) {
                // given
                const challengeItem = find('.challenge-item');
                await triggerEvent(challengeItem, 'mouseleave', { relatedTarget: challengeItem });

                assert.dom('.challenge__info-alert--could-show').exists();
                assert.dom('.challenge-item--focused').exists();
                assert.dom('.challenge__focused-out-overlay').exists();

                // when
                await triggerEvent(document, 'focusedout');

                // then
                assert.dom('.challenge__info-alert--could-show').doesNotExist();
                assert.dom('[data-test="alert-message-focused-out-of-window"]').exists();
                assert.dom('.challenge-item--focused').exists();
                assert.dom('.challenge__focused-out-overlay').exists();
              });
            });
          });

          module('when user has already seen challenge tooltip', function (hooks) {
            hooks.beforeEach(async function () {
              const user = server.create('user', 'withEmail', {
                hasSeenFocusedChallengeTooltip: true,
              });
              await authenticate(user);

              assessment = server.create('assessment', 'ofCompetenceEvaluationType');
              server.create('challenge', 'forCompetenceEvaluation', data.challengeType, 'withFocused');

              await visit(`/assessments/${assessment.id}/challenges/0`);
            });

            test('should hide the tooltip', async function (assert) {
              // then
              assert.dom('#challenge-statement-tag--tooltip').doesNotExist();
            });

            test('should enable input and buttons', async function (assert) {
              // then
              assert.ok(find('.challenge-actions__action-skip').getAttribute('aria-disabled').includes('false'));
              assert.ok(find('.challenge-actions__action-validate').getAttribute('aria-disabled').includes('false'));
              assert.notOk(find('[data-test="challenge-response-proposal-selector"]').getAttribute('disabled'));
            });
          });
        });

        module('when user has already answered the question', function () {
          test('should not display the overlay, dashed-border and warning messages', async function (assert) {
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
            assert.dom('.challenge__info-alert--could-show').doesNotExist();
            assert.dom('.challenge__focused-out-overlay').doesNotExist();
            assert.dom('.challenge-actions__focused-out-of-window').doesNotExist();
            assert.dom('.challenge-actions__already-answered').exists();
          });
        });

        module('when user has focused out of the window', function (hooks) {
          hooks.beforeEach(async function () {
            // given
            const user = server.create('user', 'withEmail', {
              hasSeenFocusedChallengeTooltip: true,
            });
            await authenticate(user);
          });

          module('when assessment is of type certification', function (hooks) {
            hooks.beforeEach(async function () {
              const focusedCertificationChallengeWarningManager = this.owner.lookup(
                'service:focused-certification-challenge-warning-manager',
              );
              focusedCertificationChallengeWarningManager.reset();

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
              const screen = await visit(`/assessments/${assessment.id}/challenges/0`);
              await click(screen.getByRole('button', { name: 'Je suis prêt' }));
              await triggerEvent(document, 'focusedout');
            });

            test('should display the certification warning alert', async function (assert) {
              // then
              assert.dom('[data-test="certification-focused-out-error-message"]').exists();
              assert.dom('[data-test="default-focused-out-error-message"]').doesNotExist();
            });

            test('should add failure to the page title', async function (assert) {
              // then
              assert.ok(getPageTitle().includes('Échoué'));
            });
          });

          module('when assessment is not of type certification', function (hooks) {
            hooks.beforeEach(async function () {
              // given
              assessment = server.create('assessment', 'ofCompetenceEvaluationType');
              server.create('challenge', 'forCompetenceEvaluation', data.challengeType, 'withFocused');

              await visit(`/assessments/${assessment.id}/challenges/0`);

              // when
              await triggerEvent(document, 'focusedout');
            });

            test('should display the default warning alert', async function (assert) {
              // then
              assert.dom('[data-test="default-focused-out-error-message"]').exists();
              assert.dom('[data-test="certification-focused-out-error-message"]').doesNotExist();
            });

            test('should not add failure to the page title', async function (assert) {
              // then
              assert.notOk(getPageTitle().includes('Échoué'));
            });
          });
        });

        module('when user has already focusedout the challenge', function (hooks) {
          hooks.beforeEach(async function () {
            // given
            const user = server.create('user', 'withEmail', {
              hasSeenFocusedChallengeTooltip: true,
            });
            await authenticate(user);
            assessment = server.create('assessment', 'ofCompetenceEvaluationType', 'withCurrentChallengeUnfocus');
            server.create('challenge', 'forCompetenceEvaluation', data.challengeType, 'withFocused');

            // when
            await visit(`/assessments/${assessment.id}/challenges/0`);
          });

          test('should enable input and buttons', async function (assert) {
            // then
            assert.ok(find('.challenge-actions__action-skip').getAttribute('aria-disabled').includes('false'));
            assert.ok(find('.challenge-actions__action-validate').getAttribute('aria-disabled').includes('false'));
            assert.notOk(find('[data-test="challenge-response-proposal-selector"]').getAttribute('disabled'));
          });

          test('should display the warning alert to say it has been focusedouted', async function (assert) {
            // then
            assert.dom('[data-test="default-focused-out-error-message"]').exists();
          });
        });

        module('when user has focused out of the window and leaves the challenge', function (hooks) {
          hooks.beforeEach(async function () {
            const user = server.create('user', 'withEmail', {
              hasSeenFocusedChallengeTooltip: true,
            });
            await authenticate(user);
          });

          module('when user goes to another assessment', function () {
            test('should not display a warning alert saying it has been focused out', async function (assert) {
              // given
              const assessment1 = server.create(
                'assessment',
                'ofCompetenceEvaluationType',
                'withCurrentChallengeUnfocus',
              );
              const assessment2 = server.create('assessment', 'ofCompetenceEvaluationType');
              server.create('challenge', 'forCompetenceEvaluation', data.challengeType, 'withFocused');
              await visit(`/assessments/${assessment1.id}/challenges/0`);

              // when
              await triggerEvent(document, 'focusedout');
              await click('.assessment-banner__home-link');
              await visit(`/assessments/${assessment2.id}/challenges/0`);

              // then
              assert.dom('[data-test="default-focused-out-error-message"]').doesNotExist();
            });
          });

          module('when user returns to the same assessment', function () {
            test('should display a warning alert saying it has been focused out', async function (assert) {
              // given
              const assessment = server.create('assessment', 'ofCompetenceEvaluationType');
              server.create('challenge', 'forCompetenceEvaluation', data.challengeType, 'withFocused');
              await visit(`/assessments/${assessment.id}/challenges/0`);

              // when
              await triggerEvent(document, 'focusedout');
              await click('.assessment-banner__home-link');
              await visit(`/assessments/${assessment.id}/challenges/0`);

              // then
              assert.dom('[data-test="default-focused-out-error-message"]').exists();
            });
          });
        });
      });

      [
        { challengeType: 'QROC' },
        { challengeType: 'QROCM' },
        { challengeType: 'QCM' },
        { challengeType: 'QCU' },
      ].forEach(function (data) {
        module(`when ${data.challengeType} challenge is not focused`, function () {
          // eslint-disable-next-line qunit/no-identical-names
          module('when user has not answered the question', function () {
            module('when user has not seen the challenge tooltip yet', function (hooks) {
              hooks.beforeEach(async function () {
                // given
                const user = server.create('user', 'withEmail', {
                  hasSeenOtherChallengesTooltip: false,
                });
                await authenticate(user);

                assessment = server.create('assessment', 'ofCompetenceEvaluationType');
                server.create('challenge', 'forCompetenceEvaluation', data.challengeType);

                // when
                await visit(`/assessments/${assessment.id}/challenges/0`);
              });

              test('should display a tooltip', async function (assert) {
                // then
                assert.dom('.tooltip-tag__information').exists();
              });

              module('when user closes tooltip', function (hooks) {
                hooks.beforeEach(async function () {
                  // given
                  assessment = server.create('assessment', 'ofCompetenceEvaluationType');
                  server.create('challenge', 'forCompetenceEvaluation', data.challengeType);

                  // when
                  await visit(`/assessments/${assessment.id}/challenges/0`);
                  await click('.tooltip-tag-information__button');
                });

                test('should hide a tooltip', async function (assert) {
                  // then
                  assert.dom('#challenge-statement-tag--tooltip').doesNotExist();
                });

                test('should enable input and buttons', async function (assert) {
                  // then
                  assert.ok(find('.challenge-actions__action-skip').getAttribute('aria-disabled').includes('false'));
                  assert.ok(
                    find('.challenge-actions__action-validate').getAttribute('aria-disabled').includes('false'),
                  );
                  assert.notOk(find('[data-test="challenge-response-proposal-selector"]').getAttribute('disabled'));
                });
              });
            });

            module('when user has already seen challenge tooltip', function (hooks) {
              hooks.beforeEach(async function () {
                const user = server.create('user', 'withEmail', {
                  hasSeenOtherChallengesTooltip: true,
                });
                await authenticate(user);

                assessment = server.create('assessment', 'ofCompetenceEvaluationType');
                server.create('challenge', 'forCompetenceEvaluation', data.challengeType);

                await visit(`/assessments/${assessment.id}/challenges/0`);
              });

              test('should hide the overlay and tooltip', async function (assert) {
                // then
                assert.dom('.challenge__overlay').doesNotExist();
                assert.dom('#challenge-statement-tag--tooltip').doesNotExist();
              });

              test('should enable input and buttons', async function (assert) {
                // then
                assert.ok(find('.challenge-actions__action-skip').getAttribute('aria-disabled').includes('false'));
                assert.ok(find('.challenge-actions__action-validate').getAttribute('aria-disabled').includes('false'));
                assert.notOk(find('[data-test="challenge-response-proposal-selector"]').getAttribute('disabled'));
              });
            });
          });

          // eslint-disable-next-line qunit/no-identical-names
          module('when user has already answered the question', function () {
            test('should not display the overlay, dashed-border and warning messages', async function (assert) {
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
                  'withFocused',
                ),
              });

              // when
              await visit(`/assessments/${assessment.id}/challenges/0`);
              const challengeItem = find('.challenge-item');
              await triggerEvent(challengeItem, 'mouseleave');

              // then
              assert.dom('.challenge__info-alert--could-show').doesNotExist();
              assert.dom('.challenge__focused-out-overlay').doesNotExist();
              assert.dom('.challenge-actions__focused-out-of-window').doesNotExist();
              assert.dom('.challenge-actions__already-answered').exists();
            });
          });

          test('should not display warning block', async function (assert) {
            // given
            assessment = server.create('assessment', 'ofCompetenceEvaluationType');
            server.create('challenge', 'forCompetenceEvaluation', data.challengeType);

            // when
            await visit(`/assessments/${assessment.id}/challenges/0`);

            // then
            assert.dom('.challenge__info-alert').doesNotExist();
          });

          module('when user has focused out of document', function (hooks) {
            hooks.beforeEach(async function () {
              // given
              const user = server.create('user', 'withEmail');
              await authenticate(user);
              assessment = server.create('assessment', 'ofCompetenceEvaluationType');
              server.create('challenge', 'forCompetenceEvaluation', data.challengeType);

              // when
              await visit(`/assessments/${assessment.id}/challenges/0`);
            });

            test('should not display instructions', async function (assert) {
              // then
              assert.dom('.focused-challenge-instructions-action__confirmation-button').doesNotExist();
            });

            test('should not display a warning alert', async function (assert) {
              // when
              await triggerEvent(document, 'focusedout');
              // then
              assert.dom('.challenge-actions__focused-out-of-window').doesNotExist();
            });
          });
        });
      });
    },
  );

  module('when assessment is certification', function () {
    module('when there are several focused challenges in a row', function () {
      test('should display the focus page once', async function (assert) {
        // given
        const user = server.create('user', 'withEmail');
        await authenticate(user);

        const focusedCertificationChallengeWarningManager = this.owner.lookup(
          'service:focused-certification-challenge-warning-manager',
        );
        focusedCertificationChallengeWarningManager.reset();

        assessment = server.create('assessment', 'ofCertificationType');
        server.create('challenge', 'forCertification', 'QCM', 'withFocused');
        server.create('challenge', 'forCertification', 'QCM', 'withFocused');

        const certificationCourse = server.create('certification-course', {
          accessCode: 'ABCD12',
          sessionId: 1,
          nbChallenges: 2,
          firstName: 'Laura',
          lastName: 'Bravo',
        });
        assessment = certificationCourse.assessment;

        // when
        const screen = await visit(`/assessments/${assessment.id}/challenges/0`);

        // then
        assert.dom(screen.getByText('Mode focus')).exists();
        await click(screen.getByRole('button', { name: 'Je suis prêt' }));

        // when
        await click(screen.getByRole('button', { name: 'Je passe et je vais à la prochaine question' }));

        // then
        assert.dom(screen.queryByText('Mode focus')).doesNotExist();
      });
    });

    module('when there is a non focus challenge between two focused challenges', function () {
      test('should display the focus page twice', async function (assert) {
        // given
        const user = server.create('user', 'withEmail');
        await authenticate(user);

        const focusedCertificationChallengeWarningManager = this.owner.lookup(
          'service:focused-certification-challenge-warning-manager',
        );
        focusedCertificationChallengeWarningManager.reset();

        assessment = server.create('assessment', 'ofCertificationType');
        server.create('challenge', 'forCertification', 'QCM', 'withFocused');
        server.create('challenge', 'forCertification', 'QCM');
        server.create('challenge', 'forCertification', 'QCM', 'withFocused');

        const certificationCourse = server.create('certification-course', {
          accessCode: 'ABCD12',
          sessionId: 1,
          nbChallenges: 2,
          firstName: 'Laura',
          lastName: 'Bravo',
        });
        assessment = certificationCourse.assessment;

        // when
        const screen = await visit(`/assessments/${assessment.id}/challenges/0`);
        await click(screen.getByRole('button', { name: 'Je suis prêt' }));
        await click(screen.getByRole('button', { name: 'Je passe et je vais à la prochaine question' }));

        // then
        assert.dom(screen.queryByText('Mode focus')).doesNotExist();

        // when
        await click(screen.getByRole('button', { name: 'Je passe et je vais à la prochaine question' }));

        // then
        assert.dom(screen.getByText('Mode focus')).exists();
      });
    });
  });
});
