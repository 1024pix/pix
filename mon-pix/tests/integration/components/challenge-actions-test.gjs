import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import ChallengeActions from 'mon-pix/components/challenge-actions';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | challenge actions', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should add a loading state to the button and disable the skip button', async function (assert) {
    // given
    const isValidateActionLoading = true;
    const isSkipActionLoading = false;
    const validateActionStub = () => sinon.promise();

    // when
    const screen = await render(
      <template>
        <ChallengeActions
          @validateAnswer={{validateActionStub}}
          @isValidateActionLoading={{isValidateActionLoading}}
          @isSkipActionLoading={{isSkipActionLoading}}
        />
      </template>,
    );

    // then
    assert.dom(screen.getByLabelText(t('pages.challenge.actions.skip-go-to-next'))).hasAttribute('aria-disabled');
    assert.dom(screen.getByLabelText(t('pages.challenge.actions.validate-go-to-next'))).hasAttribute('aria-disabled');
  });

  test('it should add a loading state to the button and disable the validate button', async function (assert) {
    // given
    const isValidateActionLoading = false;
    const isSkipActionLoading = true;
    const validateActionStub = () => sinon.promise();

    // when
    const screen = await render(
      <template>
        <ChallengeActions
          @validateAnswer={{validateActionStub}}
          @isValidateActionLoading={{isValidateActionLoading}}
          @isSkipActionLoading={{isSkipActionLoading}}
        />
      </template>,
    );

    assert.dom(screen.getByLabelText(t('pages.challenge.actions.skip-go-to-next'))).hasAttribute('aria-disabled');
    assert.dom(screen.getByLabelText(t('pages.challenge.actions.validate-go-to-next'))).hasAttribute('aria-disabled');
  });

  module('Challenge has timed out', function () {
    test('should only display "continue" button', async function (assert) {
      // given
      const hasChallengeTimedOut = true;
      const validateActionStub = () => {};

      // when
      await render(
        <template>
          <ChallengeActions @validateAnswer={{validateActionStub}} @hasChallengeTimedOut={{hasChallengeTimedOut}} />
        </template>,
      );

      // then
      assert.dom('.challenge-actions__action-validated').doesNotExist();
      assert.dom('.challenge-actions__action-skip').doesNotExist();
      assert.dom('.challenge-actions__action-continue').exists();
    });
  });

  module('when user has focused out', function () {
    module('when assessent is of type certification', function () {
      module('when certification course version is 2', function () {
        test("should show certification focus out's error message", async function (assert) {
          // given
          const isCertification = true;
          const hasFocusedOutOfWindow = true;
          const hasChallengeTimedOut = false;
          const validateActionStub = () => {};
          const certificationVersion = 2;

          // when
          await render(
            <template>
              <ChallengeActions
                @isCertification={{isCertification}}
                @validateAnswer={{validateActionStub}}
                @hasFocusedOutOfWindow={{hasFocusedOutOfWindow}}
                @hasChallengeTimedOut={{hasChallengeTimedOut}}
                @certificationVersion={{certificationVersion}}
              />
            </template>,
          );

          // then
          assert.dom('[data-test="default-focused-out-error-message"]').doesNotExist();
          assert.dom('[data-test="certification-v3-focused-out-error-message"]').doesNotExist();
          assert.dom('[data-test="certification-focused-out-error-message"]').exists();
        });
      });

      module('when certification course version is 3', function () {
        module('when the candidate does not need an accessibility adjustment', function () {
          test("should show a specific certification focus out's error message", async function (assert) {
            // given
            const isCertification = true;
            const hasFocusedOutOfWindow = true;
            const hasChallengeTimedOut = false;
            const validateActionStub = () => {};
            const certificationVersion = 3;

            // when
            const screen = await render(
              <template>
                <ChallengeActions
                  @isCertification={{isCertification}}
                  @validateAnswer={{validateActionStub}}
                  @hasFocusedOutOfWindow={{hasFocusedOutOfWindow}}
                  @hasChallengeTimedOut={{hasChallengeTimedOut}}
                  @certificationVersion={{certificationVersion}}
                />
              </template>,
            );

            // then
            assert
              .dom(
                screen.queryByText(
                  'Nous avons détecté un changement de page. En certification, votre réponse ne serait pas validée.',
                ),
              )
              .doesNotExist();
            assert
              .dom(
                screen.queryByText(
                  'Nous avons détecté un changement de page. Votre réponse sera comptée comme fausse. Si vous avez été contraint de changer de page, prévenez votre surveillant et répondez à la question en sa présence.',
                ),
              )
              .doesNotExist();
            assert
              .dom(
                screen.getByText(
                  "Nous avons détecté un changement de page. Votre réponse sera comptée comme fausse. Si vous avez été contraint de changer de page, prévenez votre surveillant afin qu'il puisse le constater et le signaler en direct de son « Espace Surveillant ».",
                ),
              )
              .exists();
            assert
              .dom(
                screen.queryByText(
                  "Nous avons détecté un changement de page. Si vous avez été contraint de changer de page pour utiliser un outil d’accessibilité numérique (tel qu'un lecteur d'écran ou un clavier virtuel), répondez tout de même à la question.",
                ),
              )
              .doesNotExist();
          });
        });

        module('when the candidate needs an accessibility adjustment', function () {
          test("should show another specific certification focus out's error message", async function (assert) {
            // given
            const isCertification = true;
            const hasFocusedOutOfWindow = true;
            const hasChallengeTimedOut = false;
            const validateActionStub = () => {};
            const certificationVersion = 3;
            const isAdjustedCourseForAccessibility = true;

            // when
            const screen = await render(
              <template>
                <ChallengeActions
                  @isCertification={{isCertification}}
                  @validateAnswer={{validateActionStub}}
                  @hasFocusedOutOfWindow={{hasFocusedOutOfWindow}}
                  @hasChallengeTimedOut={{hasChallengeTimedOut}}
                  @certificationVersion={{certificationVersion}}
                  @isAdjustedCourseForAccessibility={{isAdjustedCourseForAccessibility}}
                />
              </template>,
            );

            // then
            assert
              .dom(
                screen.queryByText(
                  'Nous avons détecté un changement de page. En certification, votre réponse ne serait pas validée.',
                ),
              )
              .doesNotExist();
            assert
              .dom(
                screen.queryByText(
                  'Nous avons détecté un changement de page. Votre réponse sera comptée comme fausse. Si vous avez été contraint de changer de page, prévenez votre surveillant et répondez à la question en sa présence.',
                ),
              )
              .doesNotExist();
            assert
              .dom(
                screen.queryByText(
                  "Nous avons détecté un changement de page. Votre réponse sera comptée comme fausse. Si vous avez été contraint de changer de page, prévenez votre surveillant afin qu'il puisse le constater et le signaler en direct de son « Espace Surveillant ».",
                ),
              )
              .doesNotExist();
            assert
              .dom(
                screen.getByText(
                  "Nous avons détecté un changement de page. Si vous avez été contraint de changer de page pour utiliser un outil d’accessibilité numérique (tel qu'un lecteur d'écran ou un clavier virtuel), répondez tout de même à la question.",
                ),
              )
              .exists();
          });
        });
      });
    });

    module('when assessent is not of type certification', function () {
      test("should show default focus out's error message", async function (assert) {
        // given
        const isCertification = false;
        const hasFocusedOutOfWindow = true;
        const hasChallengeTimedOut = false;
        const validateActionStub = () => {};

        // when
        await render(
          <template>
            <ChallengeActions
              @isCertification={{isCertification}}
              @validateAnswer={{validateActionStub}}
              @hasFocusedOutOfWindow={{hasFocusedOutOfWindow}}
              @hasChallengeTimedOut={{hasChallengeTimedOut}}
            />
          </template>,
        );

        // then
        assert.dom('[data-test="certification-focused-out-error-message"]').doesNotExist();
        assert.dom('[data-test="default-focused-out-error-message"]').exists();
      });
    });
  });

  module('when a companion live alert exists', function () {
    test('should disable action buttons', async function (assert) {
      // given
      const hasOngoingCompanionLiveAlert = true;

      // when
      const screen = await render(
        <template><ChallengeActions @hasOngoingCompanionLiveAlert={{hasOngoingCompanionLiveAlert}} /></template>,
      );

      // then
      assert
        .dom(screen.getByRole('button', { name: 'Je valide et je vais à la prochaine question' }))
        .hasAttribute('aria-disabled');
      assert
        .dom(screen.getByRole('button', { name: 'Je passe et je vais à la prochaine question' }))
        .hasAttribute('aria-disabled');
      assert.dom(screen.getByText('Les actions sont mises en pause en attendant le surveillant')).exists();
    });
  });

  module('when a challenge live alert exists', function () {
    test('should disable action buttons', async function (assert) {
      // given
      const hasOngoingChallengeLiveAlert = true;

      // when
      const screen = await render(
        <template><ChallengeActions @hasOngoingChallengeLiveAlert={{hasOngoingChallengeLiveAlert}} /></template>,
      );

      // then
      assert
        .dom(screen.getByRole('button', { name: 'Je valide et je vais à la prochaine question' }))
        .hasAttribute('aria-disabled');
      assert
        .dom(screen.getByRole('button', { name: 'Je passe et je vais à la prochaine question' }))
        .hasAttribute('aria-disabled');
      assert.dom(screen.getByText('Les actions sont mises en pause en attendant le surveillant')).exists();
    });
  });
});
