import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | campaign-collective-results', function(hooks) {
  setupTest(hooks);

  module('averageValidatedSkillsSum', function() {

    test('it should return the sum of competences average validated skills', function(assert) {
      //given
      const store = this.owner.lookup('service:store');

      const competenceCollectiveResults1 = store.createRecord('campaign-competence-collective-result', {
        averageValidatedSkills: 12
      });
      const competenceCollectiveResults2 = store.createRecord('campaign-competence-collective-result', {
        averageValidatedSkills: 45
      });
      const competenceCollectiveResults3 = store.createRecord('campaign-competence-collective-result', {
        averageValidatedSkills: 3
      });

      const model = run(() => store.createRecord('campaign-collective-result', {}));
      model.set(
        'campaignCompetenceCollectiveResults',
        [competenceCollectiveResults1, competenceCollectiveResults2, competenceCollectiveResults3]
      );

      //when
      const averageValidatedSkillsSum = model.get('averageValidatedSkillsSum');

      //then
      assert.equal(averageValidatedSkillsSum, 60);
    });
  });

  module('averageResult', function() {

    test('it should return average result', function(assert) {
      //given
      const store = this.owner.lookup('service:store');

      const competenceCollectiveResults1 = store.createRecord('campaign-competence-collective-result', {
        averageValidatedSkills: 10,
        totalSkillsCount: 20,
      });
      const competenceCollectiveResults2 = store.createRecord('campaign-competence-collective-result', {
        averageValidatedSkills: 20,
        totalSkillsCount: 40,
      });
      const competenceCollectiveResults3 = store.createRecord('campaign-competence-collective-result', {
        averageValidatedSkills: 30,
        totalSkillsCount: 60,
      });

      const model = run(()=> store.createRecord('campaign-collective-result', {}));
      model.set(
        'campaignCompetenceCollectiveResults',
        [competenceCollectiveResults1, competenceCollectiveResults2, competenceCollectiveResults3]
      );

      //when
      const averageResult = model.get('averageResult');

      //then
      assert.equal(averageResult, (10 + 20 + 30) / (20 + 40 + 60) * 100);
    });
  });

  module('totalSkills', function() {

    test('it should return total skills', function(assert) {
      //given
      const store = this.owner.lookup('service:store');

      const competenceCollectiveResults1 = store.createRecord('campaign-competence-collective-result', {
        averageValidatedSkills: 10,
        totalSkillsCount: 20,
      });
      const competenceCollectiveResults2 = store.createRecord('campaign-competence-collective-result', {
        averageValidatedSkills: 20,
        totalSkillsCount: 40,
      });
      const competenceCollectiveResults3 = store.createRecord('campaign-competence-collective-result', {
        averageValidatedSkills: 30,
        totalSkillsCount: 60,
      });

      const model = run(()=> store.createRecord('campaign-collective-result', {}));
      model.set(
        'campaignCompetenceCollectiveResults',
        [competenceCollectiveResults1, competenceCollectiveResults2, competenceCollectiveResults3]
      );

      //when
      const totalSkills = model.get('totalSkills');

      //then
      assert.equal(totalSkills, 20 + 40 + 60);
    });

  });

  module('maxTotalSkillsCountInCompetences', function() {
    test('it should return the highest value among the total skills counts', function(assert) {
      //given
      const store = this.owner.lookup('service:store');

      const competenceCollectiveResults1 = store.createRecord('campaign-competence-collective-result', {
        averageValidatedSkills: 10,
        totalSkillsCount: 20,
      });
      const competenceCollectiveResults2 = store.createRecord('campaign-competence-collective-result', {
        averageValidatedSkills: 20,
        totalSkillsCount: 40,
      });
      const competenceCollectiveResults3 = store.createRecord('campaign-competence-collective-result', {
        averageValidatedSkills: 30,
        totalSkillsCount: 60,
      });

      const model = run(() => store.createRecord('campaign-collective-result', {}));
      model.set(
        'campaignCompetenceCollectiveResults',
        [competenceCollectiveResults1, competenceCollectiveResults2, competenceCollectiveResults3]
      );
      //when
      const maxTotalSkillsCountInCompetences = model.get('maxTotalSkillsCountInCompetences');

      //then
      assert.equal(maxTotalSkillsCountInCompetences, 60);
    });
  });
});
