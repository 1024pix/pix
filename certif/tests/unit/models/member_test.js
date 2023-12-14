import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupIntl from '../../helpers/setup-intl';

module('Unit | Model | Member', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  module('#isAdmin', function () {
    module('when member has role "ADMIN"', function () {
      test('returns true', function (assert) {
        // given
        const member = store.createRecord('member', { role: 'ADMIN' });

        // when
        // then
        assert.true(member.isAdmin);
      });
    });

    module('when member does not have the role "ADMIN"', function () {
      test('returns false', function (assert) {
        // given
        const member = store.createRecord('member', { role: 'MEMBER' });

        // when
        // then
        assert.false(member.isAdmin);
      });
    });
  });
});
