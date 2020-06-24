import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | certification-info-competences', function(hooks) {

  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`{{certification-info-competences}}`);

    assert.dom('.certification-info-competences').exists();
  });

  test('it should display an entry per competence', async function(assert) {
    // given
    this.set('competences', [{ index:'1.1', score:'30', level:'3' }, { index:'2.1', score:'30', level:'3' }, { index:'5.2', score:'30', level:'3' }]);

    // when
    await render(hbs`<CertificationInfoCompetences @competences={{this.competences}} @edition={{false}} />`);

    // then
    assert.dom('.certification-info-competence-index').exists({ count:3 });
    assert.dom('.certification-info-competence-level').exists({ count:3 });
    assert.dom('.certification-info-competence-score').exists({ count:3 });
  });

  test('it should display competence index, score and level', async function(assert) {
    // given
    this.set('competences', [{ index:'1.1', score:'30', level:'3' }]);

    // when
    await render(hbs`<CertificationInfoCompetences @competences={{this.competences}} @edition={{false}} />`);

    // then
    assert.dom('.certification-info-competence-index').hasText('1.1');
    assert.dom('.certification-info-competence-level').hasText('Niveau : 3');
    assert.dom('.certification-info-competence-score').hasText('30 Pix');
  });

  test('it should display 16 entries in edition mode', async function(assert) {
    // given
    this.set('competences', [{ index:'1.1', score:'30', level:'3' }, { index:'2.1', score:'30', level:'3' }, { index:'5.2', score:'30', level:'3' }]);

    // when
    await render(hbs`<CertificationInfoCompetences @competences={{this.competences}} @edition={{true}} />`);

    // then
    assert.dom('.certification-info-field').exists({ count:16 });
  });

  test('it should display competence levels and scores at the right places in edition mode', async function(assert) {
    // given
    this.set('competences', [{ index:'1.1', score:'30', level:'3' }, { index:'2.1', score:'16', level:'2' }, { index:'5.2', score:'42', level:'5' }]);

    // when
    await render(hbs`<CertificationInfoCompetences @competences={{this.competences}} @edition={{true}} />`);

    // then
    assert.dom('#certification-info-score_0').hasValue('30');
    assert.dom('#certification-info-level_0').hasValue('3');
    assert.dom('#certification-info-score_3').hasValue('16');
    assert.dom('#certification-info-level_3').hasValue('2');
    assert.dom('#certification-info-score_15').hasValue('42');
    assert.dom('#certification-info-level_15').hasValue('5');
  });
});
