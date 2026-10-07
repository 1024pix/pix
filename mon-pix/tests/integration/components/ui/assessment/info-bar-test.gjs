import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import InfoBar from 'mon-pix/components/ui/assessment/info-bar';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

// `@testing-library/dom` normalizes the DOM text but not the expected string, so the
// narrow no-break spaces produced by `Intl` formatting have to be normalized by hand.
function normalizeSpaces(text) {
  return text.replace(/\s/g, ' ');
}

module('Integration | Component | Ui | Assessment | info-bar', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when global progression should be shown', function () {
    test('displays a progress bar with the completion rate', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const assessment = store.createRecord('assessment', {
        type: 'CAMPAIGN',
        hasCheckpoints: true,
        showChallengeStepper: true,
      });
      const completionRate = 0.56;

      // when
      const screen = await render(
        <template>
          <InfoBar @assessment={{assessment}} @showGlobalProgression={{true}} @completionRate={{completionRate}} />
        </template>,
      );

      // then
      assert.dom(screen.getByRole('progressbar')).hasAttribute('value', '0.56');
      assert.dom(screen.getByText(t('components.info-bar.completion-percentage.caption'))).exists();
      assert
        .dom(
          screen.getByText(
            normalizeSpaces(t('components.info-bar.completion-percentage.label', { completion: completionRate })),
          ),
        )
        .exists();
    });

    test('takes precedence over the challenge stepper', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const assessment = store.createRecord('assessment', {
        type: 'CAMPAIGN',
        hasCheckpoints: true,
        showChallengeStepper: true,
      });

      // when
      await render(
        <template>
          <InfoBar @assessment={{assessment}} @showGlobalProgression={{true}} @completionRate={{0.5}} />
        </template>,
      );

      // then
      assert.dom('.pix-step').doesNotExist();
    });
  });

  module('when the challenge stepper should be shown', function () {
    test('displays one step per challenge and marks the current one', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const assessment = store.createRecord('assessment', {
        type: 'CAMPAIGN',
        hasCheckpoints: true,
        showChallengeStepper: true,
      });
      const currentChallengeNumber = 2;

      // when
      const screen = await render(
        <template>
          <InfoBar
            @assessment={{assessment}}
            @currentChallengeNumber={{currentChallengeNumber}}
            @showGlobalProgression={{false}}
          />
        </template>,
      );

      // then
      assert.dom('.pix-step').exists({ count: 5 });
      assert.dom(screen.getByText('q3').closest('.pix-step')).hasAttribute('aria-current', 'step');
      assert.dom(screen.getByLabelText(t('components.info-bar.progress.position', { current: 3, total: 5 }))).exists();
    });

    test('is not displayed for a certification assessment', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const assessment = store.createRecord('assessment', {
        type: 'CERTIFICATION',
        showChallengeStepper: true,
        certificationCourse: store.createRecord('certification-course', { nbChallenges: 15 }),
      });

      // when
      const screen = await render(
        <template>
          <InfoBar @assessment={{assessment}} @currentChallengeNumber={{2}} @certificationNumber={{123}} />
        </template>,
      );

      // then
      assert.dom('.pix-step').doesNotExist();
      assert.dom(screen.getByText(t('components.info-bar.certification-number'))).exists();
    });
  });

  module('when the assessment is a certification', function () {
    test('displays the certification number and the progression', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const assessment = store.createRecord('assessment', {
        type: 'CERTIFICATION',
        showChallengeStepper: false,
        certificationCourse: store.createRecord('certification-course', { nbChallenges: 15 }),
      });
      const currentChallengeNumber = 2;
      const certificationNumber = 1234;

      // when
      const screen = await render(
        <template>
          <InfoBar
            @assessment={{assessment}}
            @currentChallengeNumber={{currentChallengeNumber}}
            @certificationNumber={{certificationNumber}}
          />
        </template>,
      );

      // then
      assert.dom(screen.getByText(t('components.info-bar.certification-number'))).exists();
      assert.dom(screen.getByText(normalizeSpaces(new Intl.NumberFormat('fr').format(certificationNumber)))).exists();
      assert.dom(screen.getByText(t('components.info-bar.progress.label'))).exists();
      assert
        .dom(screen.getByLabelText(t('components.info-bar.progress.position', { current: 3, total: 15 })))
        .hasText('3 / 15');
    });
  });

  module('when the assessment has nothing to display', function () {
    test('displays neither progress bar, stepper nor certification information', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const assessment = store.createRecord('assessment', {
        type: 'CAMPAIGN',
        hasCheckpoints: true,
        showChallengeStepper: false,
      });

      // when
      const screen = await render(
        <template>
          <InfoBar @assessment={{assessment}} @currentChallengeNumber={{2}} @showGlobalProgression={{false}} />
        </template>,
      );

      // then
      assert.dom(screen.queryByRole('progressbar')).doesNotExist();
      assert.dom('.pix-step').doesNotExist();
      assert.dom('.info-bar').doesNotExist();
    });
  });
});
