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
});
