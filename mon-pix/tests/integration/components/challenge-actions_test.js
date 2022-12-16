import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | challenge actions', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('renders', async function (assert) {
    await render(hbs`<ChallengeActions/>`);
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
                          @isSkipButtonEnabled={{this.isSkipButtonEnabled}}/>`);

      // then
      assert.dom('.challenge-actions__action-validated').doesNotExist();
      assert.dom('.challenge-actions__action-skip').doesNotExist();
      assert.dom('.challenge-actions__action-continue').exists();
    });
  });

  module('when user has focused out', function () {
    module('when assessent is of type certification', function () {
      test("should show certification focus out's error message", async function (assert) {
        // given
        this.set('isValidateButtonEnabled', true);
        this.set('isCertification', true);
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
                            @isSkipButtonEnabled={{this.isSkipButtonEnabled}}/>`);

        // then
        assert.dom('[data-test="certification-focused-out-error-message"]').exists();
        assert.dom('[data-test="default-focused-out-error-message"]').doesNotExist();
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
                            @isSkipButtonEnabled={{this.isSkipButtonEnabled}}/>`);

        // then
        assert.dom('[data-test="certification-focused-out-error-message"]').doesNotExist();
        assert.dom('[data-test="default-focused-out-error-message"]').exists();
      });
    });
  });
});
