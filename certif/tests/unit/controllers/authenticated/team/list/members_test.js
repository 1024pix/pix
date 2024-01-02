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
    test('deletes the current user membership', async function (assert) {
      // given
      const currentUser = this.owner.lookup('service:current-user');
      sinon.stub(currentUser, 'currentCertificationCenterMembership').value({
        destroyRecord: sinon.stub(),
      });

      // when
      await controller.leaveCertificationCenter();

      // then
      assert.true(currentUser.currentCertificationCenterMembership.destroyRecord.calledWith());
    });
  });
});
