import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | challenge actions', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('renders', async function (assert) {
    await render(hbs`<ChallengeActions />`);
    assert.dom('.challenge-actions__group').exists();
  });

  module('Challenge has timed out', function () {
    test('should only display "continue" button', async function (assert) {
      // given
      this.set('isValidateButtonEnabled', true);
      this.set('hasChallengeTimedOut', true);
      this.set('isSkipButtonEnabled', true);
      this.set('validateActionStub', () => {});

      // when
      await render(hbs`<ChallengeActions
  @validateAnswer={{this.validateActionStub}}
  @isValidateButtonEnabled={{this.isValidateButtonEnabled}}
  @hasChallengeTimedOut={{this.hasChallengeTimedOut}}
  @isSkipButtonEnabled={{this.isSkipButtonEnabled}}
/>`);

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
          this.set('isValidateButtonEnabled', true);
          this.set('isCertification', true);
          this.set('hasFocusedOutOfWindow', true);
          this.set('hasChallengeTimedOut', false);
          this.set('isSkipButtonEnabled', true);
          this.set('validateActionStub', () => {});
          this.set('certificationVersion', 2);

          // when
          await render(hbs`<ChallengeActions
  @isCertification={{this.isCertification}}
  @validateAnswer={{this.validateActionStub}}
  @hasFocusedOutOfWindow={{this.hasFocusedOutOfWindow}}
  @hasChallengeTimedOut={{this.hasChallengeTimedOut}}
  @isValidateButtonEnabled={{this.isValidateButtonEnabled}}
  @isSkipButtonEnabled={{this.isSkipButtonEnabled}}
  @certificationVersion={{this.certificationVersion}}
/>`);

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
            this.set('isValidateButtonEnabled', true);
            this.set('isCertification', true);
            this.set('hasFocusedOutOfWindow', true);
            this.set('hasChallengeTimedOut', false);
            this.set('isSkipButtonEnabled', true);
            this.set('validateActionStub', () => {});
            this.set('certificationVersion', 3);

            // when
            const screen = await render(hbs`<ChallengeActions
  @isCertification={{this.isCertification}}
  @validateAnswer={{this.validateActionStub}}
  @hasFocusedOutOfWindow={{this.hasFocusedOutOfWindow}}
  @hasChallengeTimedOut={{this.hasChallengeTimedOut}}
  @isValidateButtonEnabled={{this.isValidateButtonEnabled}}
  @isSkipButtonEnabled={{this.isSkipButtonEnabled}}
  @certificationVersion={{this.certificationVersion}}
/>`);

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
                  "Nous avons détecté un changement de page. Votre réponse sera comptée comme fausse. Si vous avez été contraint de changer de page, prévenez votre surveillant afin qu'il puisse le constater et le signaler, le cas échéant.",
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
            this.set('isValidateButtonEnabled', true);
            this.set('isCertification', true);
            this.set('hasFocusedOutOfWindow', true);
            this.set('hasChallengeTimedOut', false);
            this.set('isSkipButtonEnabled', true);
            this.set('validateActionStub', () => {});
            this.set('certificationVersion', 3);
            this.set('isAdjustedCourseForAccessibility', true);

            // when
            const screen = await render(hbs`<ChallengeActions
  @isCertification={{this.isCertification}}
  @validateAnswer={{this.validateActionStub}}
  @hasFocusedOutOfWindow={{this.hasFocusedOutOfWindow}}
  @hasChallengeTimedOut={{this.hasChallengeTimedOut}}
  @isValidateButtonEnabled={{this.isValidateButtonEnabled}}
  @isSkipButtonEnabled={{this.isSkipButtonEnabled}}
  @certificationVersion={{this.certificationVersion}}
  @isAdjustedCourseForAccessibility={{this.isAdjustedCourseForAccessibility}}
/>`);

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
                  "Nous avons détecté un changement de page. Votre réponse sera comptée comme fausse. Si vous avez été contraint de changer de page, prévenez votre surveillant afin qu'il puisse le constater et le signaler, le cas échéant.",
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
        this.set('isValidateButtonEnabled', true);
        this.set('isCertification', false);
        this.set('hasFocusedOutOfWindow', true);
        this.set('hasChallengeTimedOut', false);
        this.set('isSkipButtonEnabled', true);
        this.set('validateActionStub', () => {});

        // when
        await render(hbs`<ChallengeActions
  @isCertification={{this.isCertification}}
  @validateAnswer={{this.validateActionStub}}
  @hasFocusedOutOfWindow={{this.hasFocusedOutOfWindow}}
  @hasChallengeTimedOut={{this.hasChallengeTimedOut}}
  @isValidateButtonEnabled={{this.isValidateButtonEnabled}}
  @isSkipButtonEnabled={{this.isSkipButtonEnabled}}
/>`);

        // then
        assert.dom('[data-test="certification-focused-out-error-message"]').doesNotExist();
        assert.dom('[data-test="default-focused-out-error-message"]').exists();
      });
    });
  });
});
