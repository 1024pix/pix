import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | campaign-collective-results', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('campaign-collective-result', {}));
    assert.ok(model);
  });

  test('it should return the right data in the campaign-collective-result model', function(assert) {
    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('campaign-collective-result', {
      id: '123',
      collectiveResultsByCompetence: [
        {
          'area-code': '1',
          'competence-id': 'rec1',
          'competence-name': 'Pocher les gambas',
          'average-validated-skills': 2,
          'total-skills-count': 3
        }
      ]
    }));
    assert.equal(model.id, '123');
    assert.deepEqual(model.collectiveResultsByCompetence, [
      {
        'area-code': '1',
        'competence-id': 'rec1',
        'competence-name': 'Pocher les gambas',
        'average-validated-skills': 2,
        'total-skills-count': 3
      }
    ]);
  });

  module('averageResult', function() {

    test('it should return averge result', function(assert) {
      //given
      const store = this.owner.lookup('service:store');

      const competenceCollectiveResults1 = store.createRecord('campaign-competence-collective-result', {
        roundedAverageValidatedSkills: 12,
        totalSkillsCount: 20
      });
      const competenceCollectiveResults2 = store.createRecord('campaign-competence-collective-result', {
        roundedAverageValidatedSkills: 45,
        totalSkillsCount: 66
      });
      const competenceCollectiveResults3 = store.createRecord('campaign-competence-collective-result', {
        roundedAverageValidatedSkills: 2,
        totalSkillsCount: 5
      });

      const model = run(()=> store.createRecord('campaign-collective-result', {}));
      model.set(
        'campaignCompetenceCollectiveResults',
        [competenceCollectiveResults1, competenceCollectiveResults2, competenceCollectiveResults3]
      );

      //when
      const averageResult = model.get('averageResult');

      //then
      assert.equal(averageResult, 65);
    });

  });
});
