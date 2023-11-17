import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createPodsComponent from '../../../helpers/create-pods-component';

module('Unit | Component | Module | QCU', function (hooks) {
  setupTest(hooks);

  module('#feedbackType', function () {
    module('When correction status is ko', function () {
      test('should be error', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const correctionResponse = store.createRecord('correction-response', { status: 'ko' });
        const component = createPodsComponent('module/qcu', { correctionResponse });

        // when
        const feedbackType = component.feedbackType;

        // then
        assert.strictEqual(feedbackType, 'error');
      });
    });

    module('When correction status is ok', function () {
      test('should be success', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const correctionResponse = store.createRecord('correction-response', { status: 'ok' });
        const component = createPodsComponent('module/qcu', { correctionResponse });

        // when
        const feedbackType = component.feedbackType;

        // then
        assert.strictEqual(feedbackType, 'success');
      });
    });
  });
});
