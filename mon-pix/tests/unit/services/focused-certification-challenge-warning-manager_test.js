import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupTest } from 'ember-qunit';

module('Unit | Service | focused-certification-challenge-warning-manager', function (hooks) {
  setupTest(hooks);

  const originalGetItem = window.localStorage.getItem;
  const originalSetItem = window.localStorage.setItem;
  const originalRemoveItem = window.localStorage.removeItem;

  hooks.beforeEach(function () {
    window.localStorage.getItem = sinon.stub();
    window.localStorage.setItem = sinon.stub();
    window.localStorage.removeItem = sinon.stub();
  });

  hooks.afterEach(function () {
    window.localStorage.getItem = originalGetItem;
    window.localStorage.setItem = originalSetItem;
    window.localStorage.removeItem = originalRemoveItem;
  });

  module('#setToConfirmed', function () {
    test('should set to true', function (assert) {
      // given
      window.localStorage.getItem.withArgs('hasConfirmedFocusChallengeScreen').returns(false);
      const service = this.owner.lookup('service:focused-certification-challenge-warning-manager');

      // when
      service.setToConfirmed();

      // then
      assert.equal(service.hasConfirmed, true);
    });
  });

  module('#hasConfirmed', function () {
    test('should return true when hasConfirmedFocusChallengeScreen is true in localstorage', function (assert) {
      // given
      window.localStorage.getItem.withArgs('hasConfirmedFocusChallengeScreen').returns(true);
      const service = this.owner.lookup('service:focused-certification-challenge-warning-manager');

      // when // then
      assert.equal(service.hasConfirmed, true);
    });

    test('should return false when when hasConfirmedFocusChallengeScreen is false in localstorage', function (assert) {
      // given
      window.localStorage.getItem.withArgs('hasConfirmedFocusChallengeScreen').returns(false);
      const service = this.owner.lookup('service:focused-certification-challenge-warning-manager');

      // when // then
      assert.equal(service.hasConfirmed, false);
    });

    test('should return false when hasConfirmedFocusChallengeScreen does not exist in local storage', function (assert) {
      // given
      window.localStorage.getItem.withArgs('hasConfirmedFocusChallengeScreen').returns(null);
      const service = this.owner.lookup('service:focused-certification-challenge-warning-manager');

      // when // then
      assert.equal(service.hasConfirmed, false);
    });
  });

  module('#reset', function () {
    test('should remove hasConfirmedFocusChallengeScreen from local storage', function (assert) {
      // given
      window.localStorage.getItem.withArgs('hasConfirmedFocusChallengeScreen').returns(true);
      const service = this.owner.lookup('service:focused-certification-challenge-warning-manager');

      // when
      service.reset();

      // when // then
      assert.equal(service.hasConfirmed, false);
    });
  });
});
