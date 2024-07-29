import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | campaign-profile', function (hooks) {
  setupTest(hooks);

  test('it should return the campaign-profile sorted competences', function (assert) {
    const store = this.owner.lookup('service:store');

    const competence1 = store.createRecord('campaign-profile-competence', { index: '1.2' });
    const competence2 = store.createRecord('campaign-profile-competence', { index: '2.1' });
    const competence3 = store.createRecord('campaign-profile-competence', { index: '1.1.1' });
    const competence4 = store.createRecord('campaign-profile-competence', { index: '1.1' });

    const model = store.createRecord('campaign-profile', {
      competences: [competence1, competence2, competence3, competence4],
    });

    const sortedCompetences = model.get('sortedCompetences');

    assert.strictEqual(sortedCompetences[0].index, '1.1');
    assert.strictEqual(sortedCompetences[1].index, '1.1.1');
    assert.strictEqual(sortedCompetences[2].index, '1.2');
    assert.strictEqual(sortedCompetences[3].index, '2.1');
  });
});
