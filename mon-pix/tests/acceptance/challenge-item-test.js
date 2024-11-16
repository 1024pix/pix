import { visit } from '@1024pix/ember-testing-library';
// eslint-disable-next-line no-restricted-imports
import { click, find, triggerEvent } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { getPageTitle } from 'ember-page-title/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticate } from '../helpers/authentication';
import setupIntl from '../helpers/setup-intl';

module('Acceptance | Displaying a challenge of any type', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

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

            test('should display an info alert with dashed border and overlay ', async function (assert) {
              // when
              const focusZone = find('.focus-zone-warning');
              await triggerEvent(focusZone, 'mouseleave', { relatedTarget: focusZone });

              // then
              assert.dom(find('.challenge__info-alert--show')).exists();
              assert.dom(find('.focus-zone-warning--triggered')).exists();
              assert.dom(find('.focus-zone-warning__overlay')).exists();
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
                assert.dom(find('[data-test="alert-message-focused-out-of-window"]')).exists();
              });

              test('should display an info alert with dashed border and overlay', async function (assert) {
                // when
                const focusZone = find('.focus-zone-warning');
                await triggerEvent(focusZone, 'mouseleave', { relatedTarget: focusZone });

                // then
                assert.dom(find('.challenge__info-alert--could-show')).exists();
                assert.dom(find('.focus-zone-warning--triggered')).exists();
                assert.dom(find('.focus-zone-warning__overlay')).exists();
              });

              test('should display only the warning alert when it has been triggered', async function (assert) {
                // given
                const focusZone = find('.focus-zone-warning');
                await triggerEvent(focusZone, 'mouseleave', { relatedTarget: focusZone });

                assert.dom(find('.challenge__info-alert--could-show')).exists();
                assert.dom(find('.focus-zone-warning--triggered')).exists();
                assert.dom(find('.focus-zone-warning__overlay')).exists();

                // when
                await triggerEvent(document, 'focusedout');

                // then
                assert.dom(find('.challenge__info-alert--could-show')).doesNotExist();
                assert.dom(find('[data-test="alert-message-focused-out-of-window"]')).exists();
                assert.dom(find('.focus-zone-warning--triggered')).exists();
                assert.dom(find('.focus-zone-warning__overlay')).exists();
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
            let screen;

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
                version: 2,
              });
              assessment = certificationCourse.assessment;
              screen = await visit(`/assessments/${assessment.id}/challenges/0`);
              await click(screen.getByRole('button', { name: 'Je suis prêt' }));
              await triggerEvent(document, 'focusedout');
            });

            test('should display the certification warning alert', async function (assert) {
              // then
              assert
                .dom(
                  screen.getByText(
                    'Nous avons détecté un changement de page. Votre réponse sera comptée comme fausse. Si vous avez été contraint de changer de page, prévenez votre surveillant et répondez à la question en sa présence.',
                  ),
                )
                .exists();
              assert
                .dom(
                  screen.queryByText(
                    'Nous avons détecté un changement de page. En certification, votre réponse ne serait pas validée.',
                  ),
                )
                .doesNotExist();
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
              assert.dom(find('[data-test="default-focused-out-error-message"]')).exists();
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
              assert.dom(find('.challenge__info-alert--could-show')).doesNotExist();
              assert.dom(find('.challenge__focused-out-overlay')).doesNotExist();
              assert.dom(find('.challenge-actions__focused-out-of-window')).doesNotExist();
              assert.dom(find('.challenge-actions__already-answered')).exists();
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

    module('when a challenge is focused and timed', function () {
      test('should display focus first then timer information page', async function (assert) {
        // given
        const user = server.create('user', 'withEmail');
        await authenticate(user);

        const focusedCertificationChallengeWarningManager = this.owner.lookup(
          'service:focused-certification-challenge-warning-manager',
        );
        focusedCertificationChallengeWarningManager.reset();

        assessment = server.create('assessment', 'ofCertificationType');
        server.create('challenge', 'forCertification', 'QCM', 'withFocused', { timer: 60 });

        const certificationCourse = server.create('certification-course', {
          accessCode: 'ABCD12',
          sessionId: 1,
          nbChallenges: 2,
          firstName: 'Alin',
          lastName: 'Cendy',
        });
        assessment = certificationCourse.assessment;

        // when
        const screen = await visit(`/assessments/${assessment.id}/challenges/0`);

        // then
        assert
          .dom(
            screen.getByRole('heading', {
              name: 'Mode focus',
              level: 1,
            }),
          )
          .exists();

        // when
        await click(screen.getByRole('button', { name: 'Je suis prêt' }));

        // then
        assert
          .dom(
            screen.getByRole('heading', {
              name: 'Vous disposerez de 1 minute pour réussir la question suivante.',
              level: 1,
            }),
          )
          .exists();

        // when
        await click(screen.getByRole('button', { name: `Commencer l'épreuve` }));

        // then
        assert.dom(screen.getByRole('heading', { name: 'Mode Focus', level: 3 })).exists();
        assert.dom(screen.getByText('1:00')).exists();
      });
    });
  });

  module('when assessment is v2 certification', function (hooks) {
    let screen;
    hooks.beforeEach(function () {
      const focusedCertificationChallengeWarningManager = this.owner.lookup(
        'service:focused-certification-challenge-warning-manager',
      );
      focusedCertificationChallengeWarningManager.reset();

      assessment = server.create('assessment', 'ofCertificationType');

      const certificationCourse = server.create('certification-course', {
        accessCode: 'ABCD12',
        sessionId: 1,
        nbChallenges: 1,
        firstName: 'Laura',
        lastName: 'Bravo',
        version: 2,
      });
      assessment = certificationCourse.assessment;
    });

    [{ challengeType: 'QROC' }, { challengeType: 'QROCM' }, { challengeType: 'QCM' }, { challengeType: 'QCU' }].forEach(
      function (data) {
        module(`when ${data.challengeType} challenge is focused`, function (hooks) {
          hooks.beforeEach(function () {
            server.create('challenge', 'forCertification', data.challengeType, 'withFocused');
          });
          module('when user has not answered the question', function () {
            module('when user has not seen the challenge tooltip yet', function (hooks) {
              hooks.beforeEach(async function () {
                // given
                const user = server.create('user', 'withEmail', {
                  hasSeenFocusedChallengeTooltip: false,
                });
                await authenticate(user);
                // when
                screen = await visit(`/assessments/${assessment.id}/challenges/0`);
                await click(screen.getByRole('button', { name: 'Je suis prêt' }));
              });

              test('should display a tooltip', async function (assert) {
                // then
                assert.dom(find('.tooltip-tag__information')).exists();
              });

              test('should display an info alert with dashed border and overlay ', async function (assert) {
                // when
                const focusZone = find('.focus-zone-warning');
                await triggerEvent(focusZone, 'mouseleave', { relatedTarget: focusZone });

                // then
                assert.dom(find('.challenge__info-alert--show')).exists();
                assert.dom(find('.focus-zone-warning--triggered')).exists();
                assert.dom(find('.focus-zone-warning__overlay')).exists();
              });

              module('when user closes tooltip', function (hooks) {
                hooks.beforeEach(async function () {
                  // when
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

                test('should display a warning alert', async function (assert) {
                  // when
                  await triggerEvent(document, 'focusedout');

                  // then
                  assert.dom(find('[data-test="alert-message-focused-out-of-window"]')).exists();
                });

                test('should display an info alert with dashed border and overlay', async function (assert) {
                  // when
                  const focusZone = find('.focus-zone-warning');
                  await triggerEvent(focusZone, 'mouseleave', { relatedTarget: focusZone });

                  // then
                  assert.dom(find('.challenge__info-alert--could-show')).exists();
                  assert.dom(find('.focus-zone-warning--triggered')).exists();
                  assert.dom(find('.focus-zone-warning__overlay')).exists();
                });

                test('should display only the warning alert when it has been triggered', async function (assert) {
                  // given
                  const focusZone = find('.focus-zone-warning');
                  await triggerEvent(focusZone, 'mouseleave', { relatedTarget: focusZone });

                  assert.dom(find('.challenge__info-alert--could-show')).exists();
                  assert.dom(find('.focus-zone-warning--triggered')).exists();
                  assert.dom(find('.focus-zone-warning__overlay')).exists();

                  // when
                  await triggerEvent(document, 'focusedout');

                  // then
                  assert.dom(find('.challenge__info-alert--could-show')).doesNotExist();
                  assert.dom(find('[data-test="alert-message-focused-out-of-window"]')).exists();
                  assert.dom(find('.focus-zone-warning--triggered')).exists();
                  assert.dom(find('.focus-zone-warning__overlay')).exists();
                });
              });
            });
          });
        });
      },
    );

    module('when there is a companion live alert', function () {
      test('should hide feedback button', async function (assert) {
        // given
        const certificationCourse = server.create('certification-course', {
          accessCode: 'ABCD12',
          sessionId: 1,
          nbChallenges: 1,
          firstName: 'Alain',
          lastName: 'Cendy',
          version: 2,
          assessment: server.create('assessment', {
            type: 'CERTIFICATION',
            title: 'assessment COMPANION',
            hasOngoingCompanionLiveAlert: true,
          }),
        });

        assessment = certificationCourse.assessment;
        server.create('challenge', 'forCertification', 'QCM');

        // when
        const screen = await visit(`/assessments/${assessment.id}/challenges/0`);

        // then
        assert.dom(screen.queryByRole('button', { name: 'Signaler un problème avec la question' })).doesNotExist();
      });
    });
  });

  module('when assessment is v3 certification', function () {
    module('when certification is not adjusted', function (hooks) {
      let screen;
      hooks.beforeEach(function () {
        const focusedCertificationChallengeWarningManager = this.owner.lookup(
          'service:focused-certification-challenge-warning-manager',
        );
        focusedCertificationChallengeWarningManager.reset();

        assessment = server.create('assessment', 'ofCertificationType');

        const certificationCourse = server.create('certification-course', {
          accessCode: 'ABCD12',
          sessionId: 1,
          nbChallenges: 1,
          firstName: 'Laura',
          lastName: 'Bravo',
          version: 3,
        });
        assessment = certificationCourse.assessment;
      });

      [
        { challengeType: 'QROC' },
        { challengeType: 'QROCM' },
        { challengeType: 'QCM' },
        { challengeType: 'QCU' },
      ].forEach(function (data) {
        module(`when ${data.challengeType} challenge is focused`, function (hooks) {
          hooks.beforeEach(function () {
            server.create('challenge', 'forCertification', data.challengeType, 'withFocused');
          });
          module('when user has not answered the question', function () {
            module('when user has not seen the challenge tooltip yet', function (hooks) {
              hooks.beforeEach(async function () {
                // given
                const user = server.create('user', 'withEmail', {
                  hasSeenFocusedChallengeTooltip: false,
                });
                await authenticate(user);
                // when
                screen = await visit(`/assessments/${assessment.id}/challenges/0`);
                await click(screen.getByRole('button', { name: 'Je suis prêt' }));
              });

              test('should display an info alert with dashed border and overlay ', async function (assert) {
                // when
                const focusZone = find('.focus-zone-warning');
                await triggerEvent(focusZone, 'mouseleave', { relatedTarget: focusZone });

                // then
                assert.dom(find('.challenge__info-alert--show')).exists();
                assert.dom(find('.focus-zone-warning--triggered')).exists();
                assert.dom(find('.focus-zone-warning__overlay')).exists();
              });

              module('when user closes tooltip', function (hooks) {
                hooks.beforeEach(async function () {
                  // when
                  await click('.tooltip-tag-information__button');
                });

                test('should display a warning alert', async function (assert) {
                  // when
                  await triggerEvent(document, 'focusedout');

                  // then
                  assert
                    .dom(
                      screen.getByText(
                        "Nous avons détecté un changement de page. Votre réponse sera comptée comme fausse. Si vous avez été contraint de changer de page, prévenez votre surveillant afin qu'il puisse le constater et le signaler, le cas échéant.",
                      ),
                    )
                    .exists();
                });

                test('should display an info alert with dashed border and overlay', async function (assert) {
                  // when
                  const focusZone = find('.focus-zone-warning');
                  await triggerEvent(focusZone, 'mouseleave', { relatedTarget: focusZone });

                  // then
                  assert.strictEqual(
                    screen.getAllByText(
                      'Essayez de répondre à cette question sans vous aider d’internet ou d’applications.',
                    ).length,
                    2,
                  );
                  assert.dom(find('.focus-zone-warning--triggered')).exists();
                  assert.dom(find('.focus-zone-warning__overlay')).exists();
                });

                test('should display only the warning alert when it has been triggered', async function (assert) {
                  // given
                  const focusZone = find('.focus-zone-warning');
                  await triggerEvent(focusZone, 'mouseleave', { relatedTarget: focusZone });

                  // when
                  await triggerEvent(document, 'focusedout');

                  // then
                  assert.strictEqual(
                    screen.getAllByText(
                      'Essayez de répondre à cette question sans vous aider d’internet ou d’applications.',
                    ).length,
                    1,
                  );
                  assert
                    .dom(
                      screen.getByText(
                        "Nous avons détecté un changement de page. Votre réponse sera comptée comme fausse. Si vous avez été contraint de changer de page, prévenez votre surveillant afin qu'il puisse le constater et le signaler, le cas échéant.",
                      ),
                    )
                    .exists();
                  assert.dom(find('.focus-zone-warning--triggered')).exists();
                  assert.dom(find('.focus-zone-warning__overlay')).exists();
                });
              });
            });
          });
        });
      });
    });

    module('when certification is adjusted', function (hooks) {
      let screen;
      let certificationCourse;
      hooks.beforeEach(function () {
        const focusedCertificationChallengeWarningManager = this.owner.lookup(
          'service:focused-certification-challenge-warning-manager',
        );
        focusedCertificationChallengeWarningManager.reset();

        assessment = server.create('assessment', 'ofCertificationType');

        certificationCourse = server.create('certification-course', {
          accessCode: 'ABCD12',
          sessionId: 1,
          nbChallenges: 1,
          firstName: 'Laura',
          lastName: 'Bravo',
          version: 3,
          isAdjustedForAccessibility: true,
        });
        assessment = certificationCourse.assessment;
      });

      [
        { challengeType: 'QROC' },
        { challengeType: 'QROCM' },
        { challengeType: 'QCM' },
        { challengeType: 'QCU' },
      ].forEach(function (data) {
        module(`when ${data.challengeType} challenge is focused`, function (hooks) {
          hooks.beforeEach(function () {
            server.create('challenge', 'forCertification', data.challengeType, 'withFocused');
          });
          module('when user has not answered the question', function () {
            module('when user has not seen the challenge tooltip yet', function (hooks) {
              hooks.beforeEach(async function () {
                // given
                const user = server.create('user', 'withEmail', {
                  hasSeenFocusedChallengeTooltip: false,
                });
                await authenticate(user);
                // when
                screen = await visit(`/assessments/${assessment.id}/challenges/0`);
                await click(screen.getByRole('button', { name: 'Je suis prêt' }));
              });

              test('should display an info alert with dashed border and overlay ', async function (assert) {
                // when
                const focusZone = find('.focus-zone-warning');
                await triggerEvent(focusZone, 'mouseleave', { relatedTarget: focusZone });

                // then
                assert.strictEqual(
                  screen.getAllByText('Répondez à cette question sans vous aider d’internet ou d’applications.').length,
                  2,
                );
                assert.dom(find('.focus-zone-warning--triggered')).exists();
                assert.dom(find('.focus-zone-warning__overlay')).exists();
              });

              module('when user closes tooltip', function (hooks) {
                hooks.beforeEach(async function () {
                  // when
                  await click('.tooltip-tag-information__button');
                });

                test('should display a warning alert', async function (assert) {
                  // when
                  await triggerEvent(document, 'focusedout');

                  // then
                  assert.strictEqual(
                    screen.getAllByText('Répondez à cette question sans vous aider d’internet ou d’applications.')
                      .length,
                    1,
                  );
                });

                test('should display an info alert with dashed border and overlay', async function (assert) {
                  // when
                  const focusZone = find('.focus-zone-warning');
                  await triggerEvent(focusZone, 'mouseleave', { relatedTarget: focusZone });

                  // then
                  assert.strictEqual(
                    screen.getAllByText('Répondez à cette question sans vous aider d’internet ou d’applications.')
                      .length,
                    2,
                  );
                  assert.dom(find('.focus-zone-warning--triggered')).exists();
                  assert.dom(find('.focus-zone-warning__overlay')).exists();
                });

                test('should display only the warning alert when it has been triggered', async function (assert) {
                  // given
                  const focusZone = find('.focus-zone-warning');
                  await triggerEvent(focusZone, 'mouseleave', { relatedTarget: focusZone });

                  // when
                  await triggerEvent(document, 'focusedout');

                  // then
                  assert.strictEqual(
                    screen.getAllByText('Répondez à cette question sans vous aider d’internet ou d’applications.')
                      .length,
                    1,
                  );
                  assert
                    .dom(
                      screen.getByText(
                        "Nous avons détecté un changement de page. Si vous avez été contraint de changer de page pour utiliser un outil d’accessibilité numérique (tel qu'un lecteur d'écran ou un clavier virtuel), répondez tout de même à la question.",
                      ),
                    )
                    .exists();
                  assert.dom(find('.focus-zone-warning--triggered')).exists();
                  assert.dom(find('.focus-zone-warning__overlay')).exists();
                });
              });
            });
          });
        });
      });
    });

    module('when there is a companion live alert', function () {
      test('should hide feedback button', async function (assert) {
        // given
        const certificationCourse = server.create('certification-course', {
          accessCode: 'ABCD12',
          sessionId: 1,
          nbChallenges: 1,
          firstName: 'Alain',
          lastName: 'Cendy',
          version: 3,
          assessment: server.create('assessment', {
            type: 'CERTIFICATION',
            title: 'assessment COMPANION',
            hasOngoingCompanionLiveAlert: true,
          }),
        });

        assessment = certificationCourse.assessment;
        server.create('challenge', 'forCertification', 'QCM');

        // when
        const screen = await visit(`/assessments/${assessment.id}/challenges/0`);

        // then
        assert.dom(screen.queryByRole('button', { name: 'Signaler un problème avec la question' })).doesNotExist();
      });
    });
  });
});
