import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | area', function (hooks) {
  setupTest(hooks);
  let store;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
  });

  module('#sortedCompetences', function () {
    test('it should return competences sorted by their index', function (assert) {
      // given
      const competence1 = store.createRecord('competence', {
        index: '1.12',
      });
      const competence2 = store.createRecord('competence', {
        index: '1.1',
      });
      const competence3 = store.createRecord('competence', {
        index: '1.10',
      });

      const area = store.createRecord('area', {
        competences: [competence1, competence2, competence3],
      });

      // when
      const sortedCompetences = area.sortedCompetences;

      // then
      assert.strictEqual(sortedCompetences[0].index, competence2.index);
      assert.strictEqual(sortedCompetences[1].index, competence3.index);
      assert.strictEqual(sortedCompetences[2].index, competence1.index);
    });
  });
});
