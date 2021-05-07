import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import { ACQUIRED } from 'mon-pix/models/certification';

describe('Unit | Model | certification', function() {
  setupTest();

  let store;

  beforeEach(function() {
    store = this.owner.lookup('service:store');
  });

  describe('#hasCleaCertif', function() {

    it('should have clea certif', function() {
      const model = store.createRecord('certification');
      model.cleaCertificationStatus = ACQUIRED;
      expect(model.hasCleaCertif).to.be.ok;
    });

    it('should not have clea certif', function() {
      const model = store.createRecord('certification');
      model.cleaCertificationStatus = 'AnythingElse';
      expect(model.hasCleaCertif).not.to.be.ok;
    });
  });

  describe('#hasAcquiredComplementaryCertifications', function() {

    it('should be true when certification has certified badge image', function() {
      const model = store.createRecord('certification', { certifiedBadgeImages: ['/some/img'] });
      expect(model.hasAcquiredComplementaryCertifications).to.be.true;
    });

    it('should be false when certification has no certified badge image', function() {
      const model = store.createRecord('certification', { certifiedBadgeImages: [] });
      expect(model.hasAcquiredComplementaryCertifications).to.be.false;
    });
  });
});
