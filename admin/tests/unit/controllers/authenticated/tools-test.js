import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | authenticated/tools', function(hooks) {
  setupTest(hooks);
  let controller;

  hooks.beforeEach(function() {
    controller = this.owner.lookup('controller:authenticated/tools');
  });

  module('#copyProfile', function(hooks) {
    let copyProfileStub;

    hooks.beforeEach(function() {
      copyProfileStub = sinon.stub().resolves();
      const adapter = { copyProfile: copyProfileStub };
      controller.store = { adapterFor: sinon.stub().withArgs('profile-copy').returns(adapter) };
      controller.srcDatabaseUrl = 'srcDatabaseUrl';
      controller.srcUserId = 'srcUserId';
      controller.destDatabaseUrl = 'destDatabaseUrl';
      controller.destUserId = 'destUserId';
      controller.destOrganizationId = 'destOrganizationId';
      controller.destCreatorId = 'destCreatorId';
      controller.destCertificationCenterId = 'destCertificationCenterId';
    });

    test('it should reset isLoading marker to false when action is done', async function(assert) {
      // when
      await controller.send('copyProfile');

      // then
      assert.equal(controller.isLoading, false);
    });

    test('it should pass the appropriate arguments to store call', async function(assert) {
      // when
      await controller.send('copyProfile');

      // then
      sinon.assert.calledWith(copyProfileStub, {
        srcDatabaseUrl: controller.srcDatabaseUrl,
        srcUserId: controller.srcUserId,
        destDatabaseUrl: controller.destDatabaseUrl,
        destUserId: controller.destUserId,
        destOrganizationId: controller.destOrganizationId,
        destCreatorId: controller.destCreatorId,
        destCertificationCenterId: controller.destCertificationCenterId,
      });
      assert.ok(controller);
    });
  });
});
