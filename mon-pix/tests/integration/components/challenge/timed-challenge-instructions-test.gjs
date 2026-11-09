import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import TimedChallengeInstructions from 'mon-pix/components/challenge/timed-challenge-instructions';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | timed-challenge-instructions', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it displays the instructions with the allocated time', async function (assert) {
    // when
    const screen = await render(<template><TimedChallengeInstructions @time={{90}} /></template>);

    // then
    assert
      .dom(
        screen.getByRole('heading', {
          level: 1,
          name: 'Vous disposerez de 1 minute et 30\u00a0secondes pour réussir la question suivante.',
        }),
      )
      .exists();
    assert
      .dom(
        screen.getByText(
          'Vous pourrez continuer à répondre ensuite, mais la question ne sera pas considérée comme réussie.',
        ),
      )
      .exists();
    // allocated time is displayed in the heading and in the dedicated block
    assert.strictEqual(screen.getAllByText('1 minute et 30 secondes').length, 2);
  });

  test('it calls hasUserConfirmedWarning when clicking on the start button', async function (assert) {
    // given
    const hasUserConfirmedWarning = sinon.stub();

    // when
    const screen = await render(
      <template>
        <TimedChallengeInstructions @time={{90}} @hasUserConfirmedWarning={{hasUserConfirmedWarning}} />
      </template>,
    );
    await click(screen.getByRole('button', { name: 'Commencer' }));

    // then
    assert.ok(hasUserConfirmedWarning.calledOnce);
  });

  module('allocated time rendering', function () {
    [
      { input: '', expected: '' },
      { input: ' ', expected: '' },
      { input: 'undefined', expected: '' },
      { input: null, expected: '' },
      { input: 0, expected: '' },
      { input: 1, expected: '1\u00a0seconde' },
      { input: 10, expected: '10\u00a0secondes' },
      { input: 60, expected: '1 minute' },
      { input: 61, expected: '1 minute et 1\u00a0seconde' },
      { input: 70, expected: '1 minute et 10\u00a0secondes' },
      { input: 120, expected: '2 minutes' },
      { input: 121, expected: '2 minutes et 1\u00a0seconde' },
      { input: 122, expected: '2 minutes et 2\u00a0secondes' },
      { input: 130, expected: '2 minutes et 10\u00a0secondes' },
    ].forEach((data) => {
      test(`it displays "${data.expected}" when passing ${data.input}`, async function (assert) {
        // when
        const screen = await render(<template><TimedChallengeInstructions @time={{data.input}} /></template>);

        // then
        const expectedName = `Vous disposerez de ${data.expected} pour réussir la question suivante.`.replaceAll(
          / {2,}/g,
          ' ',
        );
        assert.dom(screen.getByRole('heading', { level: 1, name: expectedName })).exists();
      });
    });
  });
});
