import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | Module | Grain', function (hooks) {
  setupTest(hooks);

  module('#hasAnswerableElements', function () {
    module('when there are answerable elements in grain', function () {
      test('should return true', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const qcu = { type: 'qcu', isAnswerable: true };
        const qcm = { type: 'qcm', isAnswerable: true };
        const qrocm = { type: 'qrocm', isAnswerable: true };
        const text = { type: 'text', isAnswerable: false };
        const grain = store.createRecord('grain', {
          components: [
            { type: 'element', element: qcu },
            { type: 'element', element: qcm },
            { type: 'element', element: qrocm },
            { type: 'element', element: text },
          ],
        });
        const component = createGlimmerComponent('module/grain', { grain });

        // when
        const hasAnswerableElements = component.hasAnswerableElements;

        // then
        assert.true(hasAnswerableElements);
      });
    });

    module('when there are no answerable element in grain', function () {
      test('should return false', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const text = { type: 'text', isAnswerable: false };
        const grain = store.createRecord('grain', {
          components: [{ type: 'element', element: text }],
        });
        const component = createGlimmerComponent('module/grain', { grain });

        // when
        const hasAnswerableElements = component.hasAnswerableElements;

        // then
        assert.false(hasAnswerableElements);
      });
    });
  });

  module('#answerableElements', function () {
    module('when there are answerable elements in elements', function () {
      test('should return only answerable elements', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const qcu = { type: 'qcu', isAnswerable: true };
        const qcm = { type: 'qcm', isAnswerable: true };
        const qrocm = { type: 'qrocm', isAnswerable: true };
        const text = { type: 'text', isAnswerable: false };
        const grain = store.createRecord('grain', {
          components: [
            { type: 'element', element: qcu },
            { type: 'element', element: qcm },
            { type: 'element', element: qrocm },
            { type: 'element', element: text },
          ],
        });
        const component = createGlimmerComponent('module/grain', { grain });

        // when
        const answerableElements = component.answerableElements;

        // then
        assert.strictEqual(answerableElements.length, 3);
        assert.deepEqual(answerableElements, [qcu, qcm, qrocm]);
      });
    });

    module('when there are no answerable elements in elements', function () {
      test('should return an empty array', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const text = { type: 'text' };
        const grain = store.createRecord('grain', {
          components: [{ type: 'element', element: text }],
        });
        const component = createGlimmerComponent('module/grain', { grain });

        // when
        const answerableElements = component.answerableElements;

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
        const qcu = { id: 'qcu-id-1', type: 'qcu' };
        const elementAnswer = store.createRecord('element-answer', {
          elementId: qcu.id,
        });
        const passage = store.createRecord('passage', {
          elementAnswers: [elementAnswer],
        });
        const grain = store.createRecord('grain', {
          components: [{ type: 'element', element: qcu }],
        });

        const component = createGlimmerComponent('module/grain', { grain, passage });

        // when
        const allElementsAreAnswered = component.allElementsAreAnswered;

        // then
        assert.true(allElementsAreAnswered);
      });
    });

    module('when all answerable elements are not answered', function () {
      test('should return false', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const qcu = { type: 'qcu', isAnswerable: true };
        const grain = store.createRecord('grain', {
          components: [{ type: 'element', element: qcu }],
        });
        const passage = store.createRecord('passage');
        const component = createGlimmerComponent('module/grain', { grain, passage });

        // when
        const allElementsAreAnswered = component.allElementsAreAnswered;

        // then
        assert.false(allElementsAreAnswered);
      });
    });
  });

  module('#displayableElements', function () {
    module('when component.type is supported', function () {
      test('should return the displayable element', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const qcu = { id: 'qcu-id-1', type: 'qcu' };
        const grain = store.createRecord('grain', {
          components: [{ type: 'element', element: qcu }],
        });

        const component = createGlimmerComponent('module/grain', { grain });

        // when
        const displayableElements = component.displayableElements;

        // then
        assert.strictEqual(displayableElements.length, 1);
        assert.strictEqual(displayableElements[0], qcu);
      });
    });

    module('when component.type is not supported', function () {
      test('should return an empty array', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const qcu = { id: 'qcu-id-1', type: 'qcu' };
        const grain = store.createRecord('grain', {
          components: [{ type: 'toto', element: qcu }],
        });

        const component = createGlimmerComponent('module/grain', { grain });

        // when
        const displayableElements = component.displayableElements;

        // then
        assert.strictEqual(displayableElements.length, 0);
      });
    });
  });
});
