import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntl from '../../../../../helpers/setup-intl';

module('Unit | Controller | authenticated/team/list/members', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks, 'fr');

  let controller;
  let store;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated/team/list/members');
    store = this.owner.lookup('service:store');
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
      assert.true(currentUser.currentCertificationCenterMembership.destroyRecord.calledOnce);
    });
  });

  module('#removeMember', function () {
    test('deletes membership', async function (assert) {
      // given
      const member = store.createRecord('member', {
        id: '1',
        firstName: 'Matt',
        lastName: 'Ador',
        role: 'MEMBER',
      });
      sinon.stub(member, 'destroyRecord');

      // when
      await controller.removeMember(member);

      // then
      assert.true(member.destroyRecord.calledOnce);
    });
  });
});
