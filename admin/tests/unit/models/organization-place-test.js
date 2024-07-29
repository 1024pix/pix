import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | organization place', function (hooks) {
  setupTest(hooks);

  module('#displayStatus', function () {
    test('it formats status ACTIVE', function (assert) {
      // given
      const store = this.owner.lookup('service:store');

      // when
      const model = store.createRecord('organization-place', { status: 'ACTIVE' });

      // then
      assert.strictEqual(model.displayStatus, 'Actif');
    });

    test('it formats status EXPIRED', function (assert) {
      // given
      const store = this.owner.lookup('service:store');

      // when
      const model = store.createRecord('organization-place', { status: 'EXPIRED' });

      // then
      assert.strictEqual(model.displayStatus, 'Expiré');
    });

    test('it formats status PENDING', function (assert) {
      // given
      const store = this.owner.lookup('service:store');

      // when
      const model = store.createRecord('organization-place', { status: 'PENDING' });

      // then
      assert.strictEqual(model.displayStatus, 'À venir');
    });
  });

  module('#categoryLabel', function () {
    test('it return label for FREE_RATE', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      // when
      const model = store.createRecord('organization-place', {
        category: 'FREE_RATE',
      });

      // then
      assert.strictEqual(model.categoryLabel, 'Tarif gratuit');
    });

    test('it return label for PUBLIC_RATE', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      // when
      const model = store.createRecord('organization-place', {
        category: 'PUBLIC_RATE',
      });

      // then
      assert.strictEqual(model.categoryLabel, 'Tarif public');
    });

    test('it return label for REDUCE_RATE', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      // when
      const model = store.createRecord('organization-place', {
        category: 'REDUCE_RATE',
      });

      // then
      assert.strictEqual(model.categoryLabel, 'Tarif réduit');
    });

    test('it return label for SPECIAL_REDUCE_RATE', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      // when
      const model = store.createRecord('organization-place', {
        category: 'SPECIAL_REDUCE_RATE',
      });

      // then
      assert.strictEqual(model.categoryLabel, 'Tarif réduit spécial');
    });

    test('it return label for FULL_RATE', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      // when
      const model = store.createRecord('organization-place', {
        category: 'FULL_RATE',
      });

      // then
      assert.strictEqual(model.categoryLabel, 'Tarif plein');
    });
  });
});
