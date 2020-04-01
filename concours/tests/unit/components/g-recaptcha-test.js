import Service from '@ember/service';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import { setupTest } from 'ember-mocha';
import RSVP from 'rsvp';

describe('Unit | Component | g-recaptcha', function() {

  let serviceResetCalled = false;
  let googleRecaptchaStub;

  setupTest();

  beforeEach(function() {
    serviceResetCalled = false;

    googleRecaptchaStub = Service.create({
      loadScript() {
        return RSVP.resolve();
      },

      render() {
        return true;
      },

      reset() {
        serviceResetCalled = true;
      }

    });
  });

  describe('#didUpdateAttrs', function() {

    it('should reset the recaptcha if the token has been used', function() {
      // given
      const component = this.owner.lookup('component:g-recaptcha');
      component.set('googleRecaptcha', googleRecaptchaStub);

      component.set('recaptchaToken', null);
      component.set('tokenHasBeenUsed', true);

      // when
      component.didUpdateAttrs();

      // then
      expect(serviceResetCalled).to.be.true;
    });

    it('should not reset the recaptcha if the token has not been used', function() {
      // given
      const component = this.owner.lookup('component:g-recaptcha');
      component.set('googleRecaptcha', googleRecaptchaStub);

      component.set('recaptchaToken', null);
      component.set('tokenHasBeenUsed', false);

      // when
      component.didUpdateAttrs();

      // then verify reset has not been called
      expect(serviceResetCalled).to.be.false;

    });
  });

  describe('#validateCallback', function() {

    it('should set the recaptchaToken to the GoogleRecaptchaToken and indicate that he has not been used', function() {
      // given
      const component = this.owner.lookup('component:g-recaptcha');
      component.set('googleRecaptcha', googleRecaptchaStub);

      component.set('recaptchaToken', null);
      component.set('tokenHasBeenUsed', true);
      const googleRecaptchaResponse = 'la reponse de recaptcha';

      // when
      component.validateCallback(googleRecaptchaResponse);

      // then
      expect(component.get('recaptchaToken')).to.be.equal(googleRecaptchaResponse);
      expect(component.get('tokenHasBeenUsed')).to.be.false;
    });
  });

  describe('#expiredCallback', function() {

    it('should set the recaptchaToken to null and indicate that he has not been used', function() {
      // given
      const component = this.owner.lookup('component:g-recaptcha');
      component.set('googleRecaptcha', googleRecaptchaStub);

      component.set('recaptchaToken', 'un token');
      component.set('tokenHasBeenUsed', true);

      // when
      component.expiredCallback();

      // then
      expect(component.get('recaptchaToken')).to.be.null;
      expect(component.get('tokenHasBeenUsed')).to.be.false;
    });
  });
});
