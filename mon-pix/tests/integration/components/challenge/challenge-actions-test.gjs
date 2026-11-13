import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import ChallengeActions from 'mon-pix/components/challenge/challenge-actions';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | challenge actions', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display enabled skip and validate buttons by default', async function (assert) {
    // when
    const screen = await render(<template><ChallengeActions /></template>);

    // then
    assert
      .dom(screen.getByRole('button', { name: 'Je passe et je vais à la prochaine question' }))
      .doesNotHaveAttribute('aria-disabled');
    const validateButton = screen.getByRole('button', { name: 'Je valide et je vais à la prochaine question' });
    assert.dom(validateButton).doesNotHaveAttribute('aria-disabled');
    assert.dom(validateButton).hasAttribute('type', 'submit');
    assert.dom(screen.queryByText('Les actions sont mises en pause en attendant le surveillant')).doesNotExist();
    assert.dom(screen.queryByText('Le temps imparti est écoulé. Votre réponse ne sera pas validée.')).doesNotExist();
  });

  test('it should call skipChallenge when clicking on skip button', async function (assert) {
    // given
    const skipChallenge = sinon.stub().resolves();
    const screen = await render(<template><ChallengeActions @skipChallenge={{skipChallenge}} /></template>);

    // when
    await click(screen.getByRole('button', { name: 'Je passe et je vais à la prochaine question' }));

    // then
    assert.ok(skipChallenge.calledOnce);
  });

  test('it should disable action buttons when disabled', async function (assert) {
    // when
    const screen = await render(<template><ChallengeActions @disabled={{true}} /></template>);

    // then
    assert
      .dom(screen.getByRole('button', { name: 'Je passe et je vais à la prochaine question' }))
      .hasAttribute('aria-disabled');
    assert
      .dom(screen.getByRole('button', { name: 'Je valide et je vais à la prochaine question' }))
      .hasAttribute('aria-disabled');
  });

  test('it should add a loading state to the button and disable the skip button', async function (assert) {
    // given
    const isValidateActionLoading = true;
    const isSkipActionLoading = false;

    // when
    const screen = await render(
      <template>
        <ChallengeActions
          @isValidateActionLoading={{isValidateActionLoading}}
          @isSkipActionLoading={{isSkipActionLoading}}
        />
      </template>,
    );

    // then
    assert.dom(screen.getByLabelText('Je passe et je vais à la prochaine question')).hasAttribute('aria-disabled');
    assert.dom(screen.getByLabelText('Je valide et je vais à la prochaine question')).hasAttribute('aria-disabled');
  });

  test('it should add a loading state to the button and disable the validate button', async function (assert) {
    // given
    const isValidateActionLoading = false;
    const isSkipActionLoading = true;

    // when
    const screen = await render(
      <template>
        <ChallengeActions
          @isValidateActionLoading={{isValidateActionLoading}}
          @isSkipActionLoading={{isSkipActionLoading}}
        />
      </template>,
    );

    assert.dom(screen.getByLabelText('Je passe et je vais à la prochaine question')).hasAttribute('aria-disabled');
    assert.dom(screen.getByLabelText('Je valide et je vais à la prochaine question')).hasAttribute('aria-disabled');
  });

  module('Challenge has timed out', function () {
    test('should display timeout message and only "continue" button', async function (assert) {
      // given
      const hasChallengeTimedOut = true;

      // when
      const screen = await render(
        <template><ChallengeActions @hasChallengeTimedOut={{hasChallengeTimedOut}} /></template>,
      );

      // then
      assert.dom(screen.getByText('Le temps imparti est écoulé. Votre réponse ne sera pas validée.')).exists();
      assert
        .dom(screen.getByRole('button', { name: 'Je continue et je vais à la prochaine question' }))
        .hasAttribute('type', 'submit');
      assert.dom(screen.queryByRole('button', { name: 'Je passe et je vais à la prochaine question' })).doesNotExist();
      assert.dom(screen.queryByRole('button', { name: 'Je valide et je vais à la prochaine question' })).doesNotExist();
    });
  });

  module('when challenge is already answered', function () {
    test('should display already answered message and only "continue" button', async function (assert) {
      // given
      const answer = { result: 'ok' };

      // when
      const screen = await render(<template><ChallengeActions @answer={{answer}} /></template>);

      // then
      assert.dom(screen.getByText('Vous avez déjà répondu à cette question')).exists();
      assert.dom(screen.getByRole('button', { name: 'Poursuivre' })).exists();
      assert.dom(screen.queryByText('Le temps imparti est écoulé. Votre réponse ne sera pas validée.')).doesNotExist();
      assert.dom(screen.queryByRole('button', { name: 'Je passe et je vais à la prochaine question' })).doesNotExist();
      assert.dom(screen.queryByRole('button', { name: 'Je valide et je vais à la prochaine question' })).doesNotExist();
    });

    test('should call resumeAssessment with assessment when clicking on "continue" button', async function (assert) {
      // given
      const answer = { result: 'ok' };
      const assessment = { id: '123' };
      const resumeAssessment = sinon.stub();
      const screen = await render(
        <template>
          <ChallengeActions @answer={{answer}} @assessment={{assessment}} @resumeAssessment={{resumeAssessment}} />
        </template>,
      );

      // when
      await click(screen.getByRole('button', { name: 'Poursuivre' }));

      // then
      assert.ok(resumeAssessment.calledOnceWith(assessment));
    });

    test('should display timeout message when answer has timed out', async function (assert) {
      // given
      const answer = { result: 'timedout' };

      // when
      const screen = await render(<template><ChallengeActions @answer={{answer}} /></template>);

      // then
      assert.dom(screen.getByText('Le temps imparti est écoulé. Votre réponse ne sera pas validée.')).exists();
      assert.dom(screen.getByText('Vous avez déjà répondu à cette question')).exists();
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
