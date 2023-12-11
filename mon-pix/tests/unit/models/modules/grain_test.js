import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | Module | Grain', function (hooks) {
  setupTest(hooks);

  module('#answerableElements', function () {
    module('when there are answerable elements in elements', function () {
      test('should return only answerable elements', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const qcu = store.createRecord('qcu', { type: 'qcus', isAnswerable: true });
        const qrocm = store.createRecord('qrocm', { type: 'qrocms', isAnswerable: true });
        const text = store.createRecord('text', { type: 'texts', isAnswerable: false });
        const grain = store.createRecord('grain', {
          elements: [qcu, qrocm, text],
        });

        // when
        const answerableElements = grain.answerableElements;

        // then
        assert.strictEqual(answerableElements.length, 2);
        assert.deepEqual(answerableElements, [qcu, qrocm]);
      });
    });

    module('when there are no answerable elements in elements', function () {
      test('should return an empty array', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const text = store.createRecord('text', { type: 'texts' });
        const grain = store.createRecord('grain', {
          elements: [text],
        });

        // when
        const answerableElements = grain.answerableElements;

        // then
        assert.strictEqual(answerableElements.length, 0);
      });
    });
  });

  module('#allElementsAreAnswered', function () {
    module('when all answerable elements are answered', function () {
      test('should return true', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const qcu = store.createRecord('qcu', { type: 'qcus' });
        store.createRecord('element-answer', {
          element: qcu,
        });
        const grain = store.createRecord('grain', {
          elements: [qcu],
        });

        // when
        const allElementsAreAnswered = grain.allElementsAreAnswered;

        // then
        assert.true(allElementsAreAnswered);
      });
    });

    module('when all answerable elements are not answered', function () {
      test('should return false', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const qcu = store.createRecord('qcu', { type: 'qcus', isAnswerable: true });
        const grain = store.createRecord('grain', {
          elements: [qcu],
        });

        // when
        const allElementsAreAnswered = grain.allElementsAreAnswered;

        // then
        assert.false(allElementsAreAnswered);
      });
    });
  });
});
