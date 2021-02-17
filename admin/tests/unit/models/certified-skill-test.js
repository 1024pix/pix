import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | certified-skill', function(hooks) {
  setupTest(hooks);

  module('#get difficulty', function() {
    test('should return difficulty from the last character of the skill name', function(assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certifiedSkill = run(() => store.createRecord('certified-skill', {
        name: '@tableurExcel3',
      }));

      // when
      const difficulty = certifiedSkill.difficulty;

      // then
      assert.equal(difficulty, 3);
    });
  });
});
