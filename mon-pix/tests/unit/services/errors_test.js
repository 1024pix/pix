import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Service | errors', function() {
  setupTest();

  describe('#push', () => {
    it('should add error in errors array', function() {
      // given
      const service = this.owner.lookup('service:errors');
      const error = 'newError';

      // when
      service.push(error);

      // then
      expect(service.errors[0]).to.equal(error);
    });
  });

  describe('#shift', () => {
    it('should return first error and remove it', function() {
      // given
      const service = this.owner.lookup('service:errors');
      const error1 = 'newError1';
      const error2 = 'newError2';
      service.push(error1);
      service.push(error2);

      // when
      const result = service.shift();

      // then
      expect(result).to.equal(error1);
      expect(service.errors.length).to.equal(1);
    });
  });

  describe('#hasErrors', () => {
    it('should return true if there is errors', function() {
      // given
      const service = this.owner.lookup('service:errors');
      const error = 'newError';
      service.push(error);

      // when
      const result = service.hasErrors();

      // then
      expect(result).to.equal(true);
    });

    it('should return false if there is no error', function() {
      // given
      const service = this.owner.lookup('service:errors');

      // when
      const result = service.hasErrors();

      // then
      expect(result).to.equal(false);
    });
  });
});
