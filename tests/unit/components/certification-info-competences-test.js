import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Component | certification-info-competences', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let component = this.owner.factoryFor('component:certification-info-competences').create();
    assert.ok(component);
  });

  test('it computes raw competences correctly', function(assert) {
    // given
    let component = this.owner.factoryFor('component:certification-info-competences').create();

    // when
    component.set('rawCompetences', [{'competence-code':'1.1', value:'a competence'}, {'competence-code':'5.2', value:'another competence'}])

    // then
    assert.deepEqual(component.get('indexedCompetences'), {'1.1':{index:'1.1', 'competence-code':'1.1', value:'a competence'}, '5.2':{index:'5.2', 'competence-code':'5.2', value:'another competence'}});
  });

});
