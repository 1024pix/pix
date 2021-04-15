import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | certification details', function(hooks) {
  setupTest(hooks);

  module('#get answers', function() {
    test('it returns answers with order property', function(assert) {
      // given
      const store = this.owner.lookup('service:store');
      const listChallengesAndAnswers = [
        { id: 'answerId1' },
        { id: 'answerId2' },
        { id: 'answerId3' },
      ];

      // when
      const certification = run(() => store.createRecord('certification-details', {
        listChallengesAndAnswers,
      }));

      // then
      assert.deepEqual(certification.answers, [
        { id: 'answerId1', order: 1 },
        { id: 'answerId2', order: 2 },
        { id: 'answerId3', order: 3 },
      ]);
    });
  });
});
