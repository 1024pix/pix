import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | signupForm', function() {

  setupTest('component:signup-form', {});

  let component;

  describe('#displayMessageForCampaign', function() {
    it('should return true if session intentUrl contains campaign', function() {
      // given
      this.register('service:session', Service.extend({
        attemptedTransition: {
          intent: {
            url: '/campagnes/codecampagnepix'
          }
        }
      }));
      this.inject.service('session', { as: 'session' });

      component = this.subject();

      // when
      const shouldDisplayMessage = component.displayMessageForCampaign;

      // then
      expect(shouldDisplayMessage).to.be.true;
    });

    it('should return false if session intentUrl do not contains campaign', function() {
      // given
      this.register('service:session', Service.extend({
        attemptedTransition: {
          intent: {
            url: '/example'
          }
        }
      }));
      this.inject.service('session', { as: 'session' });

      component = this.subject();

      // when
      const shouldDisplayMessage = component.displayMessageForCampaign;

      // then
      expect(shouldDisplayMessage).to.be.false;
    });

    it('should return false if session don`t have a attemptedTransition', function() {
      // given
      this.register('service:session', Service.extend({}));
      this.inject.service('session', { as: 'session' });

      component = this.subject();

      // when
      const shouldDisplayMessage = component.displayMessageForCampaign;

      // then
      expect(shouldDisplayMessage).to.be.false;
    });
  });
});
