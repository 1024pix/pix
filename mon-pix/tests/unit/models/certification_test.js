import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import { ACQUIRED } from 'mon-pix/models/certification';
import Service from '@ember/service';

describe('Unit | Model | certification', function () {
  setupTest();

  let store;

  beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  describe('#hasCleaCertif', function () {
    it('should have clea certif', function () {
      const model = store.createRecord('certification');
      model.cleaCertificationStatus = ACQUIRED;
      expect(model.hasCleaCertif).to.be.ok;
    });

    it('should not have clea certif', function () {
      const model = store.createRecord('certification');
      model.cleaCertificationStatus = 'AnythingElse';
      expect(model.hasCleaCertif).not.to.be.ok;
    });
  });

  describe('#hasAcquiredComplementaryCertifications', function () {
    it('should be true when certification has certified badge image', function () {
      const model = store.createRecord('certification', { certifiedBadgeImages: ['/some/img'] });
      expect(model.hasAcquiredComplementaryCertifications).to.be.true;
    });

    it('should be false when certification has no certified badge image', function () {
      const model = store.createRecord('certification', { certifiedBadgeImages: [] });
      expect(model.hasAcquiredComplementaryCertifications).to.be.false;
    });
  });

  describe('#shouldDisplayProfessionalizingWarning', function () {
    context('when domain is french', function () {
      beforeEach(function () {
        class UrlServiceStub extends Service {
          get isFrenchDomainExtension() {
            return true;
          }
        }

        this.owner.register('service:url', UrlServiceStub);
      });

      it('should be true when deliveredAt >= 2022-01-01 ', function () {
        // given
        const model = store.createRecord('certification', { deliveredAt: '2022-01-01' });

        // when / then
        expect(model.shouldDisplayProfessionalizingWarning).to.be.true;
      });

      it('should be false when when deliveredAt < 2022-01-01', function () {
        // given
        const model = store.createRecord('certification', { deliveredAt: '2021-01-01' });

        // when / then
        expect(model.shouldDisplayProfessionalizingWarning).to.be.false;
      });
    });

    context('when domain is not french', function () {
      it('should be false', function () {
        // given
        class UrlServiceStub extends Service {
          get isFrenchDomainExtension() {
            return false;
          }
        }

        this.owner.register('service:url', UrlServiceStub);
        const model = store.createRecord('certification', { deliveredAt: '2022-01-01' });

        // when / then
        expect(model.shouldDisplayProfessionalizingWarning).to.be.false;
      });
    });
  });
});
