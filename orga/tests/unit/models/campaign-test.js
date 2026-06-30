import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | campaign', function (hooks) {
  setupTest(hooks);

  test('it should return the right data in the campaign model', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('campaign', {
      name: 'Fake name',
      code: 'ABC123',
      externalIdType: 'STRING',
    });
    assert.strictEqual(model.name, 'Fake name');
    assert.strictEqual(model.code, 'ABC123');
    assert.strictEqual(model.externalIdType, 'STRING');
  });

  module('#urlToResult', function () {
    test('it should construct the url to result of the campaign with type assessment', function (assert) {
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('campaign', {
        id: '1',
        name: 'Fake name',
        code: 'ABC123',
        type: 'ASSESSMENT',
      });
      assert.strictEqual(model.urlToResult, 'http://localhost:3000/api/campaigns/1/csv-assessment-results');
    });

    test('it should construct the url to result of the campaign with type exam', function (assert) {
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('campaign', {
        id: '1',
        name: 'Fake name',
        code: 'ABC123',
        type: 'EXAM',
      });
      assert.strictEqual(model.urlToResult, 'http://localhost:3000/api/campaigns/1/csv-assessment-results');
    });

    test('it should construct the url to result of the campaign with type profiles collection', function (assert) {
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('campaign', {
        id: '1',
        name: 'Fake name',
        code: 'ABC123',
        type: 'PROFILES_COLLECTION',
      });
      assert.strictEqual(model.urlToResult, 'http://localhost:3000/api/campaigns/1/csv-profiles-collection-results');
    });
  });

  module('#hasStages', function () {
    test('returns true while campaign contains stages', function (assert) {
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('campaign', {
        targetProfileHasStage: true,
      });

      assert.true(model.hasStages);
    });

    test('returns false while campaign does not contain stages', function (assert) {
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('campaign', {
        targetProfileHasStage: false,
      });

      assert.false(model.hasStages);
    });
  });

  module('#hasExternalId', function () {
    test('returns false while campaign does not contain IdPixLabel', function (assert) {
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('campaign', {
        externalIdLabel: null,
      });

      assert.false(model.hasExternalId);
    });

    test('returns false while externalIdLabel is empty', function (assert) {
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('campaign', {
        externalIdLabel: '',
      });

      assert.false(model.hasExternalId);
    });

    test('returns true while campaign contain externalIdLabel', function (assert) {
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('campaign', {
        externalIdLabel: 'krakow',
      });

      assert.true(model.hasExternalId);
    });
  });

  module('#hasBadges', function () {
    test('returns true while campaign contains badges', function (assert) {
      const store = this.owner.lookup('service:store');

      const model = store.createRecord('campaign', {
        targetProfileThematicResultCount: 2,
      });

      assert.true(model.hasBadges);
    });

    test('returns false while campaign does not contain badges', function (assert) {
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('campaign', {
        targetProfileThematicResultCount: 0,
      });

      assert.false(model.hasBadges);
    });
  });

  module('#setType', function () {
    module('when switching type is ASSESSMENT', function () {
      test('set multiple sending to false', function (assert) {
        //given
        const store = this.owner.lookup('service:store');

        const model = store.createRecord('campaign', {
          multipleSendings: true,
        });

        //when
        model.setType('ASSESSMENT');

        assert.false(model.multipleSendings);
        assert.strictEqual(model.type, 'ASSESSMENT');
      });

      test('it should reset course if it is a blueprint', function (assert) {
        //given
        const store = this.owner.lookup('service:store');

        const model = store.createRecord('campaign', {
          course: store.createRecord('course', { type: 'blueprint' }),
        });

        //when
        model.setType('ASSESSMENT');

        //then
        assert.strictEqual(model.course, null);
      });
    });

    module('when switching type is EXAM', function () {
      test('set multiple sending to false', function (assert) {
        //given
        const store = this.owner.lookup('service:store');

        const model = store.createRecord('campaign', {
          multipleSendings: true,
        });

        //when
        model.setType('EXAM');

        assert.false(model.multipleSendings);
        assert.strictEqual(model.type, 'EXAM');
      });

      test('it should reset course if it is a blueprint', function (assert) {
        //given
        const store = this.owner.lookup('service:store');

        const model = store.createRecord('campaign', {
          course: store.createRecord('course', { type: 'blueprint' }),
        });

        //when
        model.setType('EXAM');

        //then
        assert.strictEqual(model.course, null);
      });
    });

    module('when switching type is PROFILES_COLLECTION', function () {
      test('set multiple sending to true', function (assert) {
        //given
        const store = this.owner.lookup('service:store');

        const model = store.createRecord('campaign', {
          multipleSendings: false,
        });

        //when
        model.setType('PROFILES_COLLECTION');

        assert.true(model.multipleSendings);
        assert.strictEqual(model.type, 'PROFILES_COLLECTION');
      });

      test('set default to null target profile', function (assert) {
        //given
        const store = this.owner.lookup('service:store');

        const model = store.createRecord('campaign', {
          targetProfileId: 18,
        });

        //when
        model.setType('PROFILES_COLLECTION');

        assert.strictEqual(model.targetProfileId, null);
        assert.strictEqual(model.type, 'PROFILES_COLLECTION');
      });

      test('set default to null title', function (assert) {
        //given
        const store = this.owner.lookup('service:store');

        const model = store.createRecord('campaign', {
          title: 'wahout',
        });

        //when
        model.setType('PROFILES_COLLECTION');

        assert.strictEqual(model.title, null);
        assert.strictEqual(model.type, 'PROFILES_COLLECTION');
      });

      test('it should reset course', function (assert) {
        //given
        const store = this.owner.lookup('service:store');

        const model = store.createRecord('campaign', {
          course: store.createRecord('course', { type: 'blueprint' }),
        });

        //when
        model.setType('PROFILES_COLLECTION');

        //then
        assert.strictEqual(model.course, null);
      });
    });

    module('when switching type is COMBINED_COURSE', function () {
      test('it should reset course if it is a target profile', function (assert) {
        //given
        const store = this.owner.lookup('service:store');

        const model = store.createRecord('campaign', {
          course: store.createRecord('course', { type: 'targetProfile' }),
        });

        //when
        model.setType('COMBINED_COURSE');

        //then
        assert.strictEqual(model.course, null);
      });
    });
  });

  module('#ownerFullName', function () {
    test('it should return the fullname, combination of last and first name', function (assert) {
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('campaign', { ownerFirstName: 'Jean-Baptiste', ownerLastName: 'Poquelin' });

      assert.strictEqual(model.ownerFullName, 'Jean-Baptiste Poquelin');
    });
  });
});
