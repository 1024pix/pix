import Service from '@ember/service';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | Navbar Burger Menu Component', function() {
  setupTest();
  const routeStubInCampaignResults = Service.extend({ currentRouteName: 'campaigns.skill-review' });
  const routeStubNotInCampaignResults = Service.extend({ currentRouteName: 'profil' });

  let component;

  describe('When user has any login status', function() {
    beforeEach(function() {
      component = this.owner.lookup('component:navbar-burger-menu');
    });

    context('and is not in the campaign results page', function() {
      beforeEach(function() {
        this.owner.register('service:router', routeStubNotInCampaignResults);
      });

      context('#isInRouteWithoutLinksInHeader', function() {
        it('should return false', function() {
          // then
          expect(component.get('isInRouteWithoutLinksInHeader')).to.equal(false);
        });
      });
    });

    context('and is in the campaign results page', function() {
      beforeEach(function() {
        this.owner.register('service:router', routeStubInCampaignResults);
      });

      context('#isInRouteWithoutLinksInHeader', function() {
        it('should return true', function() {
          // then
          expect(component.get('isInRouteWithoutLinksInHeader')).to.equal(true);
        });
      });
    });
  });
});
