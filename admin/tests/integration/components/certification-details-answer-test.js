import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { select } from 'pix-admin/tests/helpers/x-select';
import { resolve } from 'rsvp';

module('Integration | Component | certification-details-answer', function(hooks) {
  setupRenderingTest(hooks);

  let answerData = {
    skill:'@skill5',
    challengeId:'rec12345',
    order:5,
    result:'partially'
  }

  test('it renders', async function(assert) {
    // given
    this.set('answerData', answerData);

    // when
    await render(hbs`{{certification-details-answer answer=answerData}}`);

    // then
    assert.dom('.certification-details-answer').exists();
  });

  test('info are correctly displayed', async function(assert) {
    // given
    this.set('answerData', answerData);

    // when
    await render(hbs`{{certification-details-answer answer=answerData}}`);

    // then
    assert.expect(4);
    assert.dom('.certification-details-answer-skill').hasText('@skill5');
    assert.dom('.certification-details-answer-id').hasText('rec12345');
    assert.dom('.certification-details-answer-order').hasText('(numéro : 5)');
    assert.dom([...this.element.querySelector('.answer-result select').querySelectorAll('option')].find(it => it.selected)).hasText('Partially');
  });

  test('jury class is set when answer is modified', async function(assert) {
    // given
    this.set('answerData', answerData);
    this.set('externalAction', () => {
      return resolve();
    });

    // when
    await render(hbs`{{certification-details-answer answer=answerData onUpdateRate=(action externalAction)}}`);
    await select('.answer-result select', 'ok');

    // then
    assert.dom('.answer-result').hasClass('jury');
  });

  test('update rate function is called when answer is modified and jury is set', async function(assert) {
    // given
    this.set('answerData', answerData);
    this.set('externalAction', () => {
      // then
      assert.equal(answerData.jury, 'ok');
      return resolve();
    });

    // when
    await render(hbs`{{certification-details-answer answer=answerData onUpdateRate=(action externalAction)}}`);
    await select('.answer-result select', 'ok');
  });

  test('jury is set back to false when answer is set to default value', async function(assert) {
    // given
    this.set('answerData', answerData);
    this.set('externalAction', () => {
      return resolve();
    });

    // when
    await render(hbs`{{certification-details-answer answer=answerData onUpdateRate=(action externalAction)}}`);
    await select('.answer-result select', 'ok');
    await select('.answer-result select', 'partially');
    assert.equal(answerData.jury, false);
  });



});
