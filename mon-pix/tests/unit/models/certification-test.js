import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import Certification from 'mon-pix/models/certification';

describe('Unit | Model | certification', function() {
  setupTest();

  let store;

  beforeEach(function() {
    store = this.owner.lookup('service:store');
  });

  it('exists', function() {
    const model = store.createRecord('certification');
    expect(model).to.be.ok;
  });

  describe('#hasCleaCertif', function() {
    it('has clea certif', function() {
      const model = store.createRecord('certification');
      model.acquiredPartnerCertifications = ['BANANA', Certification.PARTNER_KEY_CLEA];
      expect(model.hasCleaCertif).to.be.ok;
    });

    it('does not have clea certif', function() {
      const model = store.createRecord('certification');
      model.acquiredPartnerCertifications = ['BANANA'];
      expect(model.hasCleaCertif).not.to.be.ok;
    });

  });
});
