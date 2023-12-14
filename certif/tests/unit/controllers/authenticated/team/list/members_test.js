import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

import setupIntl from '../../../../../helpers/setup-intl';

module('Unit | Controller | authenticated/team/list/members', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated/team/list/members');
  });

  hooks.afterEach(function () {
    sinon.restore();
  });

  module('#leaveCertificationCenter', function () {
    test('disables current user membership', async function (assert) {
      // given
      const adapter = this.owner.lookup('adapter:member');
      sinon.stub(adapter, 'leaveCertificationCenter').resolves();
      const store = this.owner.lookup('service:store');
      sinon.stub(store, 'adapterFor').returns(adapter);
      const currentUser = this.owner.lookup('service:current-user');
      sinon.stub(currentUser, 'currentAllowedCertificationCenterAccess').value({ id: 1 });

      // when
      await controller.leaveCertificationCenter();

      // then
      assert.true(
        store.adapterFor.calledWith('member'),
        'adapterFor method from store class not called with the correct argument',
      );
      assert.true(
        adapter.leaveCertificationCenter.calledWith(currentUser.currentAllowedCertificationCenterAccess.id),
        'adapter method "leaveCertificationCenter" not called with the correct argument',
      );
    });
  });
});
