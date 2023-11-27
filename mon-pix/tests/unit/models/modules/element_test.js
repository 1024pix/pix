import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | Element', function (hooks) {
  setupTest(hooks);

  module('#isText', function () {
    module('when type is texts', function () {
      test('should return true', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const element = store.createRecord('element', { type: 'texts' });

        // when
        const isText = element.isText;

        // then
        assert.true(isText);
      });
    });

    module('when type is not texts', function () {
      test('should return false', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        ['qcus'].forEach((type) => {
          // when
          const element = store.createRecord('element', { type });
          const isText = element.isText;

          // then
          assert.false(isText);
        });
      });
    });
  });

  module('#isQcu', function () {
    module('when type is qcus', function () {
      test('should return true', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const element = store.createRecord('element', { type: 'qcus' });

        // when
        const isQcu = element.isQcu;

        // then
        assert.true(isQcu);
      });
    });

    module('when type is not qcus', function () {
      test('should return false', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        ['texts'].forEach((type) => {
          // when
          const element = store.createRecord('element', { type });
          const isQcu = element.isQcu;

          // then
          assert.false(isQcu);
        });
      });
    });
  });

  module('#isAnswered', function () {
    module('when element is answered', function () {
      test('should return true', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const element = store.createRecord('element', { type: 'qcus' });
        store.createRecord('element-answer', { element });

        // when
        const isAnswered = element.isAnswered;

        // then
        assert.true(isAnswered);
      });
    });

    module('when element is not answered', function () {
      test('should return false', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const element = store.createRecord('element', { type: 'qcus' });

        // when
        const isAnswered = element.isAnswered;

        // then
        assert.false(isAnswered);
      });
    });
  });

  module('#lastCorrection', function () {
    module('when element is answered', function () {
      test('should return last correction', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const elementAnswer = store.createRecord('element-answer');
        const lastCorrection = store.createRecord('correction-response', {});
        const lastElementAnswer = store.createRecord('element-answer', { correction: lastCorrection });

        const element = store.createRecord('element', {
          type: 'qcus',
          elementAnswers: [elementAnswer, lastElementAnswer],
        });

        // when
        const result = element.lastCorrection;

        // then
        assert.strictEqual(result, lastCorrection);
      });
    });

    module('when element is not answered', function () {
      test('should return undefined', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const element = store.createRecord('element', { type: 'qcus' });

        // when
        const lastCorrection = element.lastCorrection;

        // then
        assert.strictEqual(lastCorrection, undefined);
      });
    });
  });
});
