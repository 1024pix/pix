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
