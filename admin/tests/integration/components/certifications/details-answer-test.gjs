import { render } from '@1024pix/ember-testing-library';
import { setupRenderingTest } from 'ember-qunit';
import DetailsAnswer from 'pix-admin/components/certifications/details-answer';
import { module, test } from 'qunit';

module('Integration | Component | certifications/details-answer', function (hooks) {
  setupRenderingTest(hooks);

  const answerData = {
    skill: '@skill6',
    challengeId: 'rec1234',
    order: 5,
    result: 'ko',
    isNeutralized: false,
    value: 'coucou',
  };

  test('init answer displayed status with its result when challenge is not neutralized', async function (assert) {
    // given
    const answer = answerData;

    // when
    const screen = await render(<template><DetailsAnswer @answer={{answer}} /></template>);

    // then
    assert.dom(screen.getByText('Échec')).exists();
  });

  test('init answer displayed status with neutralized label when challenge is neutralized', async function (assert) {
    // given
    const answer = { ...answerData, isNeutralized: true };

    // when
    const screen = await render(<template><DetailsAnswer @answer={{answer}} /></template>);

    // then
    assert.dom(screen.getByText('Neutralisée')).exists();
  });

  test('info are correctly displayed', async function (assert) {
    // given
    const answer = answerData;

    // when
    const screen = await render(<template><DetailsAnswer @answer={{answer}} /></template>);

    // then
    assert.dom(screen.getByText('5')).exists();
    assert.dom(screen.getByText('@skill6')).exists();
    assert.dom(screen.getByText('rec1234')).exists();
    assert.dom(screen.getByText('coucou')).exists();
    assert.dom(screen.getByText('Échec')).exists();
  });

  module('when challenge has been skipped automatically', function () {
    test('info are correctly displayed ', async function (assert) {
      // given
      const skippedAnswerData = {
        ...answerData,
        hasBeenSkippedAutomatically: true,
      };
      const answer = skippedAnswerData;

      // when
      const screen = await render(<template><DetailsAnswer @answer={{answer}} /></template>);

      // then
      assert.dom(screen.getByText('5')).exists();
      assert.dom(screen.getByText('@skill6')).exists();
      assert.dom(screen.getByText('rec1234')).exists();
      assert.dom(screen.getByText('coucou')).exists();
      assert.dom(screen.getByText('Abandon')).exists();
    });
  });

  test('it should render links to challenge preview and info', async function (assert) {
    // given
    const answer = answerData;

    // when
    const screen = await render(<template><DetailsAnswer @answer={{answer}} /></template>);

    // then
    assert
      .dom(screen.getByRole('link', { name: 'Preview' }))
      .hasAttribute('href', 'https://app.recette.pix.fr/challenges/rec1234/preview');
    assert
      .dom(screen.getByRole('link', { name: 'Info' }))
      .hasAttribute('href', 'https://editor.pix.fr/challenge/rec1234');
  });

  module('when certification is not finished', function () {
    test('it should display "Non répondue" label', async function (assert) {
      // given
      const answer = {
        skill: '@skill6',
        challengeId: 'rec1234',
        order: 5,
        isNeutralized: false,
        value: 'coucou',
      };

      // when
      const screen = await render(<template><DetailsAnswer @answer={{answer}} /></template>);

      // then
      assert.dom(screen.getByText('Non répondue')).exists();
    });
  });
});
