import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';

describe('Unit | Service | focused-certification-challenge-warning-manager', function () {
  setupTest();

  const originalGetItem = window.localStorage.getItem;
  const originalSetItem = window.localStorage.setItem;
  const originalRemoveItem = window.localStorage.removeItem;

  beforeEach(function () {
    window.localStorage.getItem = sinon.stub();
    window.localStorage.setItem = sinon.stub();
    window.localStorage.removeItem = sinon.stub();
  });

  afterEach(function () {
    window.localStorage.getItem = originalGetItem;
    window.localStorage.setItem = originalSetItem;
    window.localStorage.removeItem = originalRemoveItem;
  });

  describe('#setToConfirmed', function () {
    it('should set to true', function () {
      // given
      window.localStorage.getItem.withArgs('hasConfirmedFocusChallengeScreen').returns(false);
      const service = this.owner.lookup('service:focused-certification-challenge-warning-manager');

      // when
      service.setToConfirmed();

      // then
      expect(service.hasConfirmed()).to.be.true;
    });
  });

  describe('#hasConfirmed', function () {
    it('should return true when hasConfirmedFocusChallengeScreen is true in localstorage', function () {
      // given
      window.localStorage.getItem.withArgs('hasConfirmedFocusChallengeScreen').returns(true);
      const service = this.owner.lookup('service:focused-certification-challenge-warning-manager');

      // when // then
      expect(service.hasConfirmed()).to.be.true;
    });

    it('should return false when when hasConfirmedFocusChallengeScreen is false in localstorage', function () {
      // given
      window.localStorage.getItem.withArgs('hasConfirmedFocusChallengeScreen').returns(false);
      const service = this.owner.lookup('service:focused-certification-challenge-warning-manager');

      // when // then
      expect(service.hasConfirmed()).to.be.false;
    });

    it('should return false when hasConfirmedFocusChallengeScreen does not exist in local storage', function () {
      // given
      window.localStorage.getItem.withArgs('hasConfirmedFocusChallengeScreen').returns(null);
      const service = this.owner.lookup('service:focused-certification-challenge-warning-manager');

      // when // then
      expect(service.hasConfirmed()).to.be.false;
    });
  });

  describe('#reset', function () {
    it('should remove hasConfirmedFocusChallengeScreen from local storage', function () {
      // given
      window.localStorage.getItem.withArgs('hasConfirmedFocusChallengeScreen').returns(true);
      const service = this.owner.lookup('service:focused-certification-challenge-warning-manager');

      // when
      service.reset();

      // when // then
      expect(service.hasConfirmed()).to.be.false;
    });
  });
});
