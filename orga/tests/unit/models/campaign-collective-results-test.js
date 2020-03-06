import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | campaign-collective-results', function(hooks) {
  setupTest(hooks);

  module('averageValidatedSkillsSumByCompetence', function() {

    test('it should return the sum of competences average validated skills', function(assert) {
      //given
      const store = this.owner.lookup('service:store');

      const competenceCollectiveResults1 = store.createRecord('campaign-competence-collective-result', {
        averageValidatedSkills: 11.5
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
      const averageValidatedSkillsSumByCompetence = model.get('averageValidatedSkillsSumByCompetence');

      //then
      assert.equal(averageValidatedSkillsSumByCompetence, 60);
    });
  });

  module('averageResultByCompetence', function() {

    test('it should return average result by competence', function(assert) {
      //given
      const store = this.owner.lookup('service:store');

      const competenceCollectiveResults1 = store.createRecord('campaign-competence-collective-result', {
        averageValidatedSkills: 9.5,
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
      const averageResultByCompetence = model.get('averageResultByCompetence');

      //then
      assert.equal(averageResultByCompetence, (10 + 20 + 30) / (20 + 40 + 60) * 100);
    });
  });

  module('totalSkillsByCompetence', function() {

    test('it should return total skills by competence', function(assert) {
      //given
      const store = this.owner.lookup('service:store');

      const competenceCollectiveResults1 = store.createRecord('campaign-competence-collective-result', {
        totalSkillsCount: 20,
      });
      const competenceCollectiveResults2 = store.createRecord('campaign-competence-collective-result', {
        totalSkillsCount: 40,
      });
      const competenceCollectiveResults3 = store.createRecord('campaign-competence-collective-result', {
        totalSkillsCount: 60,
      });

      const model = run(()=> store.createRecord('campaign-collective-result', {}));
      model.set(
        'campaignCompetenceCollectiveResults',
        [competenceCollectiveResults1, competenceCollectiveResults2, competenceCollectiveResults3]
      );

      //when
      const totalSkillsByCompetence = model.get('totalSkillsByCompetence');

      //then
      assert.equal(totalSkillsByCompetence, 20 + 40 + 60);
    });

  });

  module('maxTotalSkillsCountInCompetences', function() {
    test('it should return the highest value among the total skills counts in competences', function(assert) {
      //given
      const store = this.owner.lookup('service:store');

      const competenceCollectiveResults1 = store.createRecord('campaign-competence-collective-result', {
        totalSkillsCount: 20,
      });
      const competenceCollectiveResults2 = store.createRecord('campaign-competence-collective-result', {
        totalSkillsCount: 40,
      });
      const competenceCollectiveResults3 = store.createRecord('campaign-competence-collective-result', {
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

  module('averageValidatedSkillsSumByTube', function() {

    test('it should return the sum of tubes average validated skills', function(assert) {
      //given
      const store = this.owner.lookup('service:store');

      const tubeCollectiveResults1 = store.createRecord('campaign-tube-collective-result', {
        averageValidatedSkills: 11.5
      });
      const tubeCollectiveResults2 = store.createRecord('campaign-tube-collective-result', {
        averageValidatedSkills: 45
      });
      const tubeCollectiveResults3 = store.createRecord('campaign-tube-collective-result', {
        averageValidatedSkills: 3
      });

      const model = run(() => store.createRecord('campaign-collective-result', {}));
      model.set(
        'campaignTubeCollectiveResults',
        [tubeCollectiveResults1, tubeCollectiveResults2, tubeCollectiveResults3]
      );

      //when
      const averageValidatedSkillsSumByTube = model.get('averageValidatedSkillsSumByTube');

      //then
      assert.equal(averageValidatedSkillsSumByTube, 60);
    });
  });

  module('averageResultByTube', function() {

    test('it should return average result by tube', function(assert) {
      //given
      const store = this.owner.lookup('service:store');

      const tubeCollectiveResults1 = store.createRecord('campaign-tube-collective-result', {
        averageValidatedSkills: 9.5,
        totalSkillsCount: 20,
      });
      const tubeCollectiveResults2 = store.createRecord('campaign-tube-collective-result', {
        averageValidatedSkills: 20,
        totalSkillsCount: 40,
      });
      const tubeCollectiveResults3 = store.createRecord('campaign-tube-collective-result', {
        averageValidatedSkills: 30,
        totalSkillsCount: 60,
      });

      const model = run(()=> store.createRecord('campaign-collective-result', {}));
      model.set(
        'campaignTubeCollectiveResults',
        [tubeCollectiveResults1, tubeCollectiveResults2, tubeCollectiveResults3]
      );

      //when
      const averageResultByTube = model.get('averageResultByTube');

      //then
      assert.equal(averageResultByTube, (10 + 20 + 30) / (20 + 40 + 60) * 100);
    });
  });

  module('totalSkillsByTube', function() {

    test('it should return total skills by tube', function(assert) {
      //given
      const store = this.owner.lookup('service:store');

      const tubeCollectiveResults1 = store.createRecord('campaign-tube-collective-result', {
        totalSkillsCount: 20,
      });
      const tubeCollectiveResults2 = store.createRecord('campaign-tube-collective-result', {
        totalSkillsCount: 40,
      });
      const tubeCollectiveResults3 = store.createRecord('campaign-tube-collective-result', {
        totalSkillsCount: 60,
      });

      const model = run(()=> store.createRecord('campaign-collective-result', {}));
      model.set(
        'campaignTubeCollectiveResults',
        [tubeCollectiveResults1, tubeCollectiveResults2, tubeCollectiveResults3]
      );

      //when
      const totalSkillsByTube = model.get('totalSkillsByTube');

      //then
      assert.equal(totalSkillsByTube, 20 + 40 + 60);
    });

  });

  module('maxTotalSkillsCountInTubes', function() {
    test('it should return the highest value among the total skills counts in tubes', function(assert) {
      //given
      const store = this.owner.lookup('service:store');

      const tubeCollectiveResults1 = store.createRecord('campaign-tube-collective-result', {
        totalSkillsCount: 20,
      });
      const tubeCollectiveResults2 = store.createRecord('campaign-tube-collective-result', {
        totalSkillsCount: 40,
      });
      const tubeCollectiveResults3 = store.createRecord('campaign-tube-collective-result', {
        totalSkillsCount: 60,
      });

      const model = run(() => store.createRecord('campaign-collective-result', {}));
      model.set(
        'campaignTubeCollectiveResults',
        [tubeCollectiveResults1, tubeCollectiveResults2, tubeCollectiveResults3]
      );
      //when
      const maxTotalSkillsCountInTubes = model.get('maxTotalSkillsCountInTubes');

      //then
      assert.equal(maxTotalSkillsCountInTubes, 60);
    });
  });
});
