import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/team/list/members', (hooks) => {
  setupTest(hooks);
  const currentUser = { organization: { id: 1 } };
  let controller;

  hooks.beforeEach(function() {
    controller = this.owner.lookup('controller:authenticated/team/list/members');
    controller.send = sinon.stub();
    controller.currentUser = currentUser;
  });

  module('#removeMembership', () => {

    test('should set current organization to the membership ', async (assert) => {
      // given
      const saveStub = sinon.stub();
      const membership = {
        save: saveStub,
      };

      // when
      await controller.removeMembership(membership);

      // then
      assert.equal(membership.organization, currentUser.organization);
    });

    test('should call disable membership endpoint', async (assert) => {
      // given
      const saveStub = sinon.stub();
      const membership = {
        save: saveStub,
      };
      const expectedAdapterOptions = { adapterOptions: { disable: true } };

      // when
      await controller.removeMembership(membership);

      // then
      sinon.assert.calledWith(saveStub, expectedAdapterOptions);
      assert.ok(true);
    });

    test('should call route\'s refreshModel action', async (assert) => {
      // given
      const saveStub = sinon.stub();
      const membership = {
        save: saveStub,
      };

      // when
      await controller.removeMembership(membership);

      // then
      sinon.assert.calledWith(controller.send, 'refreshModel');
      assert.ok(true);
    });
  });
});
