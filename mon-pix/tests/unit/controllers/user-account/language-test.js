import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Controller | user-account/language', function() {
  setupTest();

  context('#onChangeLang', function() {

    it('should refresh page on change lang if domain is not french', function() {
      // given
      const controller = this.owner.lookup('controller:user-account/language');
      controller.url = { isFrenchDomainExtension: false };
      const event = { target: { value: 'en' } };
      const replaceStub = sinon.stub();
      controller.location = { replace: replaceStub };

      // when
      controller.onChangeLang(event);

      // then
      sinon.assert.calledWith(replaceStub, '/mon-compte/langue?lang=en');
    });
  });
});
