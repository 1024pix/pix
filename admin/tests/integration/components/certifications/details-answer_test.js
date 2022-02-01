import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { resolve } from 'rsvp';
import { selectChoose } from 'ember-power-select/test-support/helpers';

module('Integration | Component | certifications/details-answer', function (hooks) {
  setupRenderingTest(hooks);

  const answerData = {
    skill: '@skill6',
    challengeId: 'rec1234',
    order: 5,
    result: 'partially',
    isNeutralized: false,
    value: 'coucou',
  };

  test('init answer displayed status with its result when challenge is not neutralized', async function (assert) {
    // given
    this.setProperties({
      answer: answerData,
      onUpdateRate: () => {},
    });

    // when
    await render(hbs`<Certifications::DetailsAnswer @answer={{answer}} @onUpdateRate={{onUpdateRate}} />`);

    // then
    assert.contains('Succès partiel');
  });

  test('init answer displayed status with neutralized label when challenge is neutralized', async function (assert) {
    // given
    this.setProperties({
      answer: { ...answerData, isNeutralized: true },
      onUpdateRate: () => {},
    });

    // when
    await render(hbs`<Certifications::DetailsAnswer @answer={{answer}} @onUpdateRate={{onUpdateRate}} />`);

    // then
    assert.contains('Neutralisée');
  });

  test('info are correctly displayed', async function (assert) {
    // given
    this.setProperties({
      answer: answerData,
      onUpdateRate: () => {},
    });

    // when
    await render(hbs`<Certifications::DetailsAnswer @answer={{answer}} @onUpdateRate={{onUpdateRate}} />`);

    // then
    assert.contains('5');
    assert.contains('@skill6');
    assert.contains('rec1234');
    assert.contains('coucou');
    assert.contains('Succès partiel');
  });

  module('when chalenge has been skipped automatically', function () {
    test('info are correctly displayed ', async function (assert) {
      // given
      const skippedAnswerData = {
        ...answerData,
        hasBeenSkippedAutomatically: true,
      };
      this.setProperties({
        answer: skippedAnswerData,
        onUpdateRate: () => {},
      });

      // when
      await render(hbs`<Certifications::DetailsAnswer @answer={{answer}} @onUpdateRate={{onUpdateRate}} />`);

      // then
      assert.contains('5');
      assert.contains('@skill6');
      assert.contains('rec1234');
      assert.contains('coucou');
      assert.contains('Abandon');
    });
  });

  test('jury class is set when answer is modified', async function (assert) {
    // given
    this.setProperties({
      answer: answerData,
      onUpdateRate: () => {},
    });
    await render(hbs`<Certifications::DetailsAnswer @answer={{answer}} @onUpdateRate={{onUpdateRate}} />`);

    // when
    await selectChoose('.answer-result', 'Succès');

    // then
    assert.dom('.answer-result').hasClass('jury');
  });

  test('update rate function is called when answer is modified and jury is set', async function (assert) {
    assert.expect(1);
    // given
    this.setProperties({
      answer: answerData,
      onUpdateRate: () => {
        // then
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(answerData.jury, 'ok');
        return resolve();
      },
    });
    await render(hbs`<Certifications::DetailsAnswer @answer={{answer}} @onUpdateRate={{onUpdateRate}} />`);

    // when
    await selectChoose('.answer-result', 'Succès');
  });

  test('jury is set back to false when answer is set to default value', async function (assert) {
    // given
    this.setProperties({
      answer: answerData,
      onUpdateRate: () => resolve(),
    });
    await render(hbs`<Certifications::DetailsAnswer @answer={{answer}} @onUpdateRate={{onUpdateRate}} />`);

    // when
    await selectChoose('.answer-result', 'Succès');
    await selectChoose('.answer-result', 'Succès partiel');

    // Then
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(answerData.jury, null);
  });

  test('it should render links to challenge preview and info', async function (assert) {
    // given
    this.setProperties({
      answer: answerData,
    });

    // when
    await render(hbs`<Certifications::DetailsAnswer @answer={{answer}} />`);

    // Then
    assert.dom('[data-test-link-preview]').hasText('Preview');
    assert
      .dom('[data-test-link-preview]')
      .hasAttribute('href', 'https://app.recette.pix.fr/challenges/rec1234/preview');
    assert.dom('[data-test-link-info]').hasText('Info');
    assert.dom('[data-test-link-info]').hasAttribute('href', 'https://editor.pix.fr/#/challenge/rec1234');
  });
});
