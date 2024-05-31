import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Service | focused-certification-challenge-warning-manager', function (hooks) {
  setupTest(hooks);

  const originalGetItem = window.localStorage.getItem;
  const originalSetItem = window.localStorage.setItem;
  const originalRemoveItem = window.localStorage.removeItem;

  hooks.beforeEach(function () {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: sinon.stub(),
        setItem: sinon.stub(),
        removeItem: sinon.stub(),
      },
      writable: true,
    });
  });

  hooks.afterEach(function () {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: originalGetItem,
        setItem: originalSetItem,
        removeItem: originalRemoveItem,
      },
      writable: true,
    });
  });

  module('#setToConfirmed', function () {
    test('should set to true', function (assert) {
      // given
      window.localStorage.getItem.withArgs('hasConfirmedFocusChallengeScreen').returns(false);
      const service = this.owner.lookup('service:focused-certification-challenge-warning-manager');

      // when
      service.setToConfirmed();

      // then
      assert.true(service.hasConfirmed);
    });
  });

  module('#hasConfirmed', function () {
    test('should return true when hasConfirmedFocusChallengeScreen is true in localstorage', function (assert) {
      // given
      window.localStorage.getItem.withArgs('hasConfirmedFocusChallengeScreen').returns(true);
      const service = this.owner.lookup('service:focused-certification-challenge-warning-manager');

      // when // then
      assert.true(service.hasConfirmed);
    });

    test('should return false when when hasConfirmedFocusChallengeScreen is false in localstorage', function (assert) {
      // given
      window.localStorage.getItem.withArgs('hasConfirmedFocusChallengeScreen').returns(false);
      const service = this.owner.lookup('service:focused-certification-challenge-warning-manager');

      // when // then
      assert.false(service.hasConfirmed);
    });

    test('should return false when hasConfirmedFocusChallengeScreen does not exist in local storage', function (assert) {
      // given
      window.localStorage.getItem.withArgs('hasConfirmedFocusChallengeScreen').returns(null);
      const service = this.owner.lookup('service:focused-certification-challenge-warning-manager');

      // when // then
      assert.false(service.hasConfirmed);
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
      assert.false(service.hasConfirmed);
    });
  });
});
