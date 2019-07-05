import Service from '@ember/service';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | User logged Menu', function() {

  setupTest();

  describe('action#toggleUserMenu', function() {
    it('should return true, when user details is clicked', function() {
      // given
      const component = this.owner.lookup('component:user-logged-menu');

      // when
      component.send('toggleUserMenu');
      // then
      expect(component.get('_canDisplayMenu')).to.equal(true);
    });

    it('should return false as default value', function() {
      // when
      const component = this.owner.lookup('component:user-logged-menu');

      // then
      expect(component.get('_canDisplayMenu')).to.equal(false);
    });

    it('should return false, when _canDisplayMenu was previously true', function() {
      // given
      const component = this.owner.lookup('component:user-logged-menu');
      // when
      component.send('toggleUserMenu');
      component.send('toggleUserMenu');
      // then
      expect(component.get('_canDisplayMenu')).to.equal(false);
    });
  });

  describe('canDisplayLinkToProfile', function() {

    beforeEach(function() {
      this.owner.register('service:current-routed-modal', Service.extend({}));
    });

    it('should be false if user uses profileV2 and the current route is /profil-v2', function() {
      // given
      this.owner.register('service:-routing', Service.extend({
        currentRouteName: 'profile-v2'
      }));

      this.owner.register('service:currentUser', Service.extend({
        user: { usesProfileV2: true }
      }));

      const component = this.owner.lookup('component:user-logged-menu');

      // when
      const result = component.get('canDisplayLinkToProfile');

      // then
      expect(result).to.be.false;
    });

    it('should be false if user does not use profileV2 and the current route is /compte', function() {
      // given
      this.owner.register('service:-routing', Service.extend({
        currentRouteName: 'compte'
      }));
      const component = this.owner.lookup('component:user-logged-menu');

      // when
      const result = component.get('canDisplayLinkToProfile');

      // then
      expect(result).to.be.false;
    });

    it('should be false if the current route is /board', function() {
      // given
      this.owner.register('service:-routing', Service.extend({
        currentRouteName: 'board'
      }));
      const component = this.owner.lookup('component:user-logged-menu');

      // when
      const result = component.get('canDisplayLinkToProfile');

      // then
      expect(result).to.be.false;
    });

    it('should be true otherwise', function() {
      // given
      this.owner.register('service:-routing', Service.extend({
        currentRouteName: 'other'
      }));
      const component = this.owner.lookup('component:user-logged-menu');

      // when
      const result = component.get('canDisplayLinkToProfile');

      // then
      expect(result).to.be.true;
    });
  });
});
