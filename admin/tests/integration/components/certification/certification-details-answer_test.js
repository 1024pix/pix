import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { resolve } from 'rsvp';
import { selectChoose } from 'ember-power-select/test-support/helpers';

module('Integration | Component | Certification | CertificationDetailsAnswer', function(hooks) {

  setupRenderingTest(hooks);

  const answerData = {
    skill: '@skill5',
    challengeId: 'rec12345',
    order: 5,
    result: 'partially',
    isNeutralized: false,
  };

  test('init answer displayed status with its result when challenge is not neutralized', async function(assert) {
    // given
    this.setProperties({
      answer: answerData,
      onUpdateRate: () => {},
    });

    // when
    await render(hbs`<Certification::CertificationDetailsAnswer @answer={{answer}} @onUpdateRate={{onUpdateRate}} />`);

    // then
    assert.dom('.ember-power-select-selected-item').hasText('Succès partiel');
  });

  test('init answer displayed status with neutralized label when challenge is neutralized', async function(assert) {
    // given
    this.setProperties({
      answer: { ...answerData, isNeutralized: true },
      onUpdateRate: () => {},
    });

    // when
    await render(hbs`<Certification::CertificationDetailsAnswer @answer={{answer}} @onUpdateRate={{onUpdateRate}} />`);

    // then
    assert.dom('.ember-power-select-selected-item').hasText('Neutralisée');
  });

  test('info are correctly displayed', async function(assert) {
    // given
    this.setProperties({
      answer: answerData,
      onUpdateRate: () => {},
    });

    // when
    await render(hbs`<Certification::CertificationDetailsAnswer @answer={{answer}} @onUpdateRate={{onUpdateRate}} />`);

    // then
    assert.dom('.certification-details-answer-skill').hasText('@skill5');
    assert.dom('.certification-details-answer-id').hasText('rec12345');
    assert.dom('.certification-details-answer-order').hasText('(numéro : 5)');
    assert.dom('.ember-power-select-selected-item').hasText('Succès partiel');
  });

  test('jury class is set when answer is modified', async function(assert) {
    // given
    this.setProperties({
      answer: answerData,
      onUpdateRate: () => {},
    });
    await render(hbs`<Certification::CertificationDetailsAnswer @answer={{answer}} @onUpdateRate={{onUpdateRate}} />`);

    // when
    await selectChoose('.answer-result', 'Succès');

    // then
    assert.dom('.answer-result').hasClass('jury');
  });

  test('update rate function is called when answer is modified and jury is set', async function(assert) {
    // given
    this.setProperties({
      answer: answerData,
      onUpdateRate: () => {
        // then
        assert.equal(answerData.jury, 'ok');
        return resolve();
      },
    });
    await render(hbs`<Certification::CertificationDetailsAnswer @answer={{answer}} @onUpdateRate={{onUpdateRate}} />`);

    // when
    await selectChoose('.answer-result', 'Succès');
  });

  test('jury is set back to false when answer is set to default value', async function(assert) {
    // given
    this.setProperties({
      answer: answerData,
      onUpdateRate: () => resolve(),
    });
    await render(hbs`<Certification::CertificationDetailsAnswer @answer={{answer}} @onUpdateRate={{onUpdateRate}} />`);

    // when
    await selectChoose('.answer-result', 'Succès');
    await selectChoose('.answer-result', 'Succès partiel');

    // Then
    assert.equal(answerData.jury, null);
  });

});
