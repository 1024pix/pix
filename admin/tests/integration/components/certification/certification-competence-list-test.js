import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | <CertificationCompetenceList/>', function(hooks) {

  setupRenderingTest(hooks);

  test('it should display an entry per competence', async function(assert) {
    // given
    this.set('competences', [{ index:'1.1', score:'30', level:'3' }, { index:'2.1', score:'30', level:'3' }, { index:'5.2', score:'30', level:'3' }]);

    // when
    await render(hbs`<CertificationCompetenceList @competences={{this.competences}} />`);

    // then
    assert.dom('.certification-competence-list__row').exists({ count:3 });
  });

  test('it should display competence index, score and level', async function(assert) {
    // given
    this.set('competences', [{ index:'1.1', score:'30', level:'3' }]);

    // when
    await render(hbs`<CertificationCompetenceList @competences={{this.competences}} />`);

    // then
    assert.dom('.certification-competence-item__index').hasText('1.1');
    assert.dom('.certification-competence-item__score').hasValue('30');
    assert.dom('.certification-competence-item__level').hasValue('3');
  });
});
