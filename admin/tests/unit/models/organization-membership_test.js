import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | organization-membership', function (hooks) {
  setupTest(hooks);

  module('#roleLabel', function () {
    test('it should return the label corresponding to the role', function (assert) {
      // given
      const store = this.owner.lookup('service:store');

      // when
      const model1 = store.createRecord('organization-membership', { organizationRole: 'MEMBER' });
      const model2 = store.createRecord('organization-membership', { organizationRole: 'ADMIN' });

      // then
      assert.strictEqual(model1.roleLabel, 'Membre');
      assert.strictEqual(model2.roleLabel, 'Administrateur');
    });
  });
});
