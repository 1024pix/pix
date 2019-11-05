import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | certification-joiner', function() {

  setupTest();

  describe('#init', () => {
    it('should padd birthdate elements with zeroes', function() {
      const component = this.owner.lookup('component:certification-joiner');
      component.set('yearOfBirth', '2000');
      component.set('monthOfBirth', '1');
      component.set('dayOfBirth', '2');
      expect(component.birthdate).to.equal('2000-01-02');
    });
  });
});
