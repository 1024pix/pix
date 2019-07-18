import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

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

  describe('#certifiedPixScore computed property', () => {

    it('should return the pixScore', function() {
      // given
      const pixScore = 23;
      const certification = store.createRecord('certification', { pixScore });

      // when
      const certifiedPixScore = certification.get('certifiedPixScore');

      // then
      expect(certifiedPixScore).to.equal(pixScore);
    });

    it('should blocked the pixScore with the maximum actual pixScore', function() {
      // given
      const pixScore = 650;
      const certification = store.createRecord('certification', { pixScore });

      // when
      const certifiedPixScore = certification.get('certifiedPixScore');

      // then
      expect(certifiedPixScore).to.equal(640);
    });

  });

});
