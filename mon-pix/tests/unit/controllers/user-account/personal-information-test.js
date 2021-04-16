import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Controller | user-account/personal-information', function() {
  setupTest();

  context('#displayLanguageSwitch', function() {

    it('should return false if domain is french', function() {
      // given
      const controller = this.owner.lookup('controller:user-account/personal-information');
      controller.url = { isFrenchDomainExtension: true };

      // when / then
      expect(controller.displayLanguageSwitch).to.be.false;
    });

    it('should return true if domain is not french', function() {
      // given
      const controller = this.owner.lookup('controller:user-account/personal-information');
      controller.url = { isFrenchDomainExtension: false };

      // when / then
      expect(controller.displayLanguageSwitch).to.be.true;
    });
  });

  context('#onChangeLang', function() {

    it('should refresh page on change lang if domain is not french', function() {
      // given
      const controller = this.owner.lookup('controller:user-account/personal-information');
      controller.url = { isFrenchDomainExtension: false };
      const event = { target: { value: 'en' } };
      const replaceStub = sinon.stub();
      controller.location = { replace: replaceStub };

      // when
      controller.onChangeLang(event);

      // then
      sinon.assert.calledWith(replaceStub, '/mon-compte?lang=en');
    });
  });
});
