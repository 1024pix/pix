import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Controller | user-account', function() {
  setupTest();

  context('#displayLanguageSwitch', function() {

    it('should return false if domain is french', function() {
      // given
      const controller = this.owner.lookup('controller:user-account');
      controller.url = { isFrenchDomainExtension: true };

      // when / then
      expect(controller.displayLanguageSwitch).to.be.false;
    });

    it('should return true if domain is not french', function() {
      // given
      const controller = this.owner.lookup('controller:user-account');
      controller.url = { isFrenchDomainExtension: false };

      // when / then
      expect(controller.displayLanguageSwitch).to.be.true;
    });
  });
});
