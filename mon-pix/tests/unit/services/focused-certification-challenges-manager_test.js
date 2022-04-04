import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';

describe('Unit | Service | focused-certification-challenges-manager', function () {
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

  describe('#add', function () {
    it('should add a focused challengeId to local storage', function () {
      // given
      window.localStorage.getItem.withArgs('focusedCertificationsChallenges').returns('["challengeId1"]');
      const service = this.owner.lookup('service:focused-certification-challenges-manager');

      // when
      service.add('challengeId2');

      // then
      expect(service.has('challengeId2')).to.be.true;
    });
  });

  describe('#has', function () {
    it('should return true when challengeId exists', function () {
      // given
      window.localStorage.getItem.withArgs('focusedCertificationsChallenges').returns('["challengeId1"]');
      const service = this.owner.lookup('service:focused-certification-challenges-manager');

      // when // then
      expect(service.has('challengeId1')).to.be.true;
    });

    it('should return false when challengeId does not exist', function () {
      // given
      window.localStorage.getItem.withArgs('focusedCertificationsChallenges').returns('["challengeId1"]');
      const service = this.owner.lookup('service:focused-certification-challenges-manager');

      // when // then
      expect(service.has('challengeId2')).to.be.false;
    });

    it('should return false when focusedCertificationsChallenges array does not exist in local storage', function () {
      // given
      window.localStorage.getItem.withArgs('focusedCertificationsChallenges').returns(null);
      const service = this.owner.lookup('service:focused-certification-challenges-manager');

      // when // then
      expect(service.has('challengeId2')).to.be.false;
    });
  });

  describe('#clear', function () {
    it('should remove focusedCertificationsChallenges from local storage', function () {
      // given
      window.localStorage.getItem.withArgs('focusedCertificationsChallenges').returns('["challengeId1"]');
      const service = this.owner.lookup('service:focused-certification-challenges-manager');

      // when
      service.clear();

      // when // then
      expect(service.has('challengeId1')).to.be.false;
    });
  });
});
