import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import sinon from 'sinon';
import ENV from 'pix-admin/config/environment';

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

  module('#neutralizeChallenge', function() {

    test('neutralizes a challenge', async function(assert) {
      // given
      const store = this.owner.lookup('service:store');
      const adapter = store.adapterFor('certification-details');
      sinon.stub(adapter, 'ajax');

      const url = `${ENV.APP.API_HOST}/api/admin/certification/neutralize-challenge`;
      const payload = {
        data: {
          data: {
            attributes: {
              certificationCourseId: 123,
              challengeRecId: 'rec123',
            },
          },
        },
      };
      adapter.ajax.resolves({});

      const certification = run(() => store.createRecord('certification-details', {
        listChallengesAndAnswers: [],
      }));

      // when
      await certification.neutralizeChallenge(
        {
          certificationCourseId: 123,
          challengeRecId: 'rec123',
        },
      );

      // then
      assert.ok(adapter.ajax.calledWithExactly(url, 'POST', payload));
    });
  });
});
