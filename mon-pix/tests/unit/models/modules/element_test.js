import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | Module | Element', function (hooks) {
  setupTest(hooks);

  const getters = [
    {
      getterName: 'isQcu',
      cases: [
        {
          modelType: 'qcus',
          expectedResult: true,
        },
        {
          modelType: 'texts',
          expectedResult: false,
        },
      ],
    },
    {
      getterName: 'isText',
      cases: [
        {
          modelType: 'texts',
          expectedResult: true,
        },
        {
          modelType: 'qcus',
          expectedResult: false,
        },
      ],
    },
    {
      getterName: 'isImage',
      cases: [
        {
          modelType: 'images',
          expectedResult: true,
        },
        {
          modelType: 'qcus',
          expectedResult: false,
        },
      ],
    },
    {
      getterName: 'isVideo',
      cases: [
        {
          modelType: 'videos',
          expectedResult: true,
        },
        {
          modelType: 'qcus',
          expectedResult: false,
        },
      ],
    },
    {
      getterName: 'isQrocm',
      cases: [
        {
          modelType: 'qrocms',
          expectedResult: true,
        },
        {
          modelType: 'qcus',
          expectedResult: false,
        },
      ],
    },
  ];

  getters.forEach((getter) => {
    module(`#${getter.getterName}`, function () {
      getter.cases.forEach((c) => {
        test(`should return ${c.expectedResult} according to element of type ${c.modelType}`, function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const element = store.createRecord('element', { type: c.modelType });
          // when
          const isType = element[getter.getterName];
          // then
          assert.strictEqual(isType, c.expectedResult);
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
