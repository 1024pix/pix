import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Service | attestation-visibility', function (hooks) {
  setupTest(hooks);

  const userId = '123';
  const cacheKey = `pix-has-attestations-${userId}`;
  let findAllStub;

  hooks.beforeEach(function () {
    findAllStub = sinon.stub();
    class StoreStub extends Service {
      findAll = findAllStub;
    }
    this.owner.register('service:store', StoreStub);
  });

  hooks.afterEach(function () {
    localStorage.removeItem(cacheKey);
    localStorage.removeItem('pix-has-attestations-456');
  });

  module('when localStorage has the cache set', function () {
    test('it has attestations without calling the store', async function (assert) {
      // given
      localStorage.setItem(cacheKey, 'true');
      const service = this.owner.lookup('service:attestation-visibility');

      // when
      await service.load(userId);

      // then
      assert.true(service.hasAttestations);
      sinon.assert.notCalled(findAllStub);
    });
  });

  module('when localStorage does not have the cache', function () {
    test('it has attestations and caches the result when user has attestations', async function (assert) {
      // given
      findAllStub.withArgs('attestation-detail').resolves([{ id: '1' }]);
      const service = this.owner.lookup('service:attestation-visibility');

      // when
      await service.load(userId);

      // then
      assert.true(service.hasAttestations);
      assert.strictEqual(localStorage.getItem(cacheKey), 'true');
    });

    test('it has no attestations and does not cache the result when user has no attestations', async function (assert) {
      // given
      findAllStub.withArgs('attestation-detail').resolves([]);
      const service = this.owner.lookup('service:attestation-visibility');

      // when
      await service.load(userId);

      // then
      assert.false(service.hasAttestations);
      assert.strictEqual(localStorage.getItem(cacheKey), null);
    });

    test('it has no attestations when the request fails', async function (assert) {
      // given
      findAllStub.withArgs('attestation-detail').rejects(new Error('500'));
      const service = this.owner.lookup('service:attestation-visibility');

      // when
      await service.load(userId);

      // then
      assert.false(service.hasAttestations);
    });

    test('it does not fetch attestations again for the same user', async function (assert) {
      // given
      findAllStub.withArgs('attestation-detail').resolves([]);
      const service = this.owner.lookup('service:attestation-visibility');
      await service.load(userId);

      // when
      await service.load(userId);

      // then
      sinon.assert.calledOnce(findAllStub);
      assert.ok(true);
    });

    test('it fetches attestations again for another user', async function (assert) {
      // given
      findAllStub
        .withArgs('attestation-detail')
        .onFirstCall()
        .resolves([{ id: '1' }])
        .onSecondCall()
        .resolves([]);
      const service = this.owner.lookup('service:attestation-visibility');
      await service.load(userId);

      // when
      await service.load('456');

      // then
      sinon.assert.calledTwice(findAllStub);
      assert.false(service.hasAttestations);
    });

    test('it ignores the response of a previous user received after another user is loaded', async function (assert) {
      // given
      let resolvePreviousUserRequest;
      findAllStub
        .withArgs('attestation-detail')
        .onFirstCall()
        .returns(new Promise((resolve) => (resolvePreviousUserRequest = resolve)))
        .onSecondCall()
        .resolves([]);
      const service = this.owner.lookup('service:attestation-visibility');
      const previousUserLoad = service.load(userId);
      await service.load('456');

      // when
      resolvePreviousUserRequest([{ id: '1' }]);
      await previousUserLoad;

      // then
      assert.false(service.hasAttestations);
    });

    test('it ignores the failure of a previous user received after another user is loaded', async function (assert) {
      // given
      let rejectPreviousUserRequest;
      findAllStub
        .withArgs('attestation-detail')
        .returns(new Promise((resolve, reject) => (rejectPreviousUserRequest = reject)));
      localStorage.setItem('pix-has-attestations-456', 'true');
      const service = this.owner.lookup('service:attestation-visibility');
      const previousUserLoad = service.load(userId);
      await service.load('456');

      // when
      rejectPreviousUserRequest(new Error('500'));
      await previousUserLoad;

      // then
      assert.true(service.hasAttestations);
    });
  });
});
