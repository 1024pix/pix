import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | Competence-Result', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('competence-result', {}));
    assert.ok(model);
  });

  module('totalSkillsCountPercentage', function() {

    test('should retrieve 100 since the competence is the highest number of total skills count', function(assert) {
      const store = this.owner.lookup('service:store');
      const model = run(() => store.createRecord('competence-result', {}));
      const otherCompetenceResult = store.createRecord('competence-result', {
        totalSkillsCount: 1
      });
      const campaignParticipationResult = store.createRecord('campaign-participation-result', {
        competenceResults: [otherCompetenceResult, model]
      });

      model.set('totalSkillsCount', 2);
      model.set('campaignParticipationResult', campaignParticipationResult);

      // when
      const totalSkillsCountPercentage = model.get('totalSkillsCountPercentage');

      // then
      assert.equal(totalSkillsCountPercentage, 100);
    });

    test('should retrieve 25 since the competence is not the highest number of total skills count', function(assert) {
      const store = this.owner.lookup('service:store');
      const model = run(() => store.createRecord('competence-result', {}));
      const otherCompetenceResult = store.createRecord('competence-result', {
        totalSkillsCount: 4
      });
      const campaignParticipationResult = store.createRecord('campaign-participation-result', {
        competenceResults: [otherCompetenceResult, model]
      });

      model.set('totalSkillsCount', 1);
      model.set('campaignParticipationResult', campaignParticipationResult);

      // when
      const totalSkillsCountPercentage = model.get('totalSkillsCountPercentage');

      // then
      assert.equal(totalSkillsCountPercentage, 25);
    });
  });

  module('validatedSkillsPercentage', function() {

    test('should retrieve 100 since the user has validated all the competence', function(assert) {
      const store = this.owner.lookup('service:store');
      const model = run(() => store.createRecord('competence-result', {}));

      model.set('totalSkillsCount', 2);
      model.set('validatedSkillsCount', 2);

      // when
      const validatedSkillsPercentage = model.get('validatedSkillsPercentage');

      // then
      assert.equal(validatedSkillsPercentage, 100);
    });

    test('should retrieve 25 since the user has validated half of the competence', function(assert) {
      const store = this.owner.lookup('service:store');
      const model = run(() => store.createRecord('competence-result', {}));

      model.set('totalSkillsCount', 3);
      model.set('validatedSkillsCount', 1);

      // when
      const validatedSkillsPercentage = model.get('validatedSkillsPercentage');

      // then
      assert.equal(validatedSkillsPercentage, 33);
    });
  });
});
