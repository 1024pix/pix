import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Service | current-user', function (hooks) {
  setupTest(hooks);

  let storeStub;
  let sessionStub;

  module('user is authenticated', function (hooks) {
    const user = { id: '1' };
    hooks.beforeEach(function () {
      sessionStub = Service.create({ isAuthenticated: true });
      storeStub = Service.create({
        queryRecord: sinon.stub().resolves(user),
        findAll: sinon.stub().resolves(),
      });
    });

    test('should load the current user', async function (assert) {
      // Given
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.set('store', storeStub);
      currentUser.set('session', sessionStub);

      // When
      await currentUser.load();

      // Then
      assert.strictEqual(currentUser.user, user);
    });
  });

  module('user is not authenticated', function (hooks) {
    hooks.beforeEach(function () {
      sessionStub = Service.create({ isAuthenticated: false });
    });

    test('should do nothing', async function (assert) {
      // Given
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.set('store', storeStub);
      currentUser.set('session', sessionStub);
      // When
      await currentUser.load();

      // Then
      assert.notOk(currentUser.user);
    });
  });

  module('user token is expired', function (hooks) {
    hooks.beforeEach(function () {
      sessionStub = Service.create({
        isAuthenticated: true,
        invalidate: sinon.stub().resolves('invalidate'),
      });
      storeStub = Service.create({
        queryRecord: sinon.stub().rejects({ errors: [{ code: 401 }] }),
      });
    });

    test('should redirect to login', async function (assert) {
      // Given
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.set('store', storeStub);
      currentUser.set('session', sessionStub);
      // When
      const result = await currentUser.load();

      // Then
      assert.strictEqual(result, 'invalidate');
    });
  });

  module('loadAttestationDetails', function (hooks) {
    hooks.beforeEach(function () {
      sessionStub = Service.create({ isAuthenticated: true });
      storeStub = Service.create({
        findAll: sinon.stub().rejects(),
      });
    });

    test('should set attestation detail user', async function (assert) {
      // Given
      const currentUser = this.owner.lookup('service:currentUser');
      const expectedResult = [Symbol('attestation-detail')];
      currentUser.set('store', storeStub);
      currentUser.set('session', sessionStub);

      storeStub.findAll.withArgs('attestation-detail').resolves(expectedResult);
      // When
      await currentUser.loadAttestationDetails();

      // Then
      assert.strictEqual(currentUser.attestationsDetails, expectedResult);
      assert.true(currentUser.hasAttestationsDetails);
    });

    test('should set to false attesation details', async function (assert) {
      // Given
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.set('store', storeStub);
      currentUser.set('session', sessionStub);

      storeStub.findAll.withArgs('attestation-detail').resolves([]);
      // When
      await currentUser.loadAttestationDetails();

      // Then
      assert.false(currentUser.hasAttestationsDetails);
    });
  });
});
