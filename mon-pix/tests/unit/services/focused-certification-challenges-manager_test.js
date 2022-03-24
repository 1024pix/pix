import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';
import { A } from '@ember/array';

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

  after(function () {
    window.localStorage.getItem = originalGetItem;
    window.localStorage.setItem = originalSetItem;
    window.localStorage.removeItem = originalRemoveItem;
  });

  describe('#constructor', function () {
    it('should instantiate an empty Ember Array if there is no focus challenges in the local storage', function () {
      // given
      window.localStorage.getItem.withArgs('focusedCertificationsChallenges').returns(null);

      // when
      const service = this.owner.lookup('service:focused-certification-challenges-manager');

      // then
      expect(service._focusedCertificationsChallenges).to.deep.equal(A([]));
    });

    it('should retrieve focus challenges in the local storage if there is any', function () {
      // given
      window.localStorage.getItem
        .withArgs('focusedCertificationsChallenges')
        .returns('["challengeId1", "challengeId2"]');

      // when
      const service = this.owner.lookup('service:focused-certification-challenges-manager');

      // then
      expect(service._focusedCertificationsChallenges).to.deep.equal(A(['challengeId1', 'challengeId2']));
    });
  });

  describe('#add', function () {
    it('should add a focused challengeId to local storage', function () {
      // given
      window.localStorage.getItem.withArgs('focusedCertificationsChallenges').returns('["challengeId1"]');
      const service = this.owner.lookup('service:focused-certification-challenges-manager');

      // when
      service.add('challengeId2');

      // then
      sinon.assert.calledWith(
        window.localStorage.setItem,
        'focusedCertificationsChallenges',
        '["challengeId1","challengeId2"]'
      );
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
    context('when focusedCertificationsChallenges key exists in localstorage', function () {
      it('should remove focusedCertificationsChallenges from local storage', function () {
        // given
        window.localStorage.getItem.withArgs('focusedCertificationsChallenges').returns('["challengeId1"]');
        const service = this.owner.lookup('service:focused-certification-challenges-manager');

        // when
        service.clear();

        // when // then
        sinon.assert.calledWith(window.localStorage.removeItem, 'focusedCertificationsChallenges');
      });
    });

    context('when focusedCertificationsChallenges key does not exist in localstorage', function () {
      it('should not remove item', function () {
        // given
        window.localStorage.getItem.withArgs('focusedCertificationsChallenges').returns(null);
        const service = this.owner.lookup('service:focused-certification-challenges-manager');

        // when
        service.clear();

        // when // then
        sinon.assert.notCalled(window.localStorage.removeItem);
      });
    });
  });
});
