import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it } from 'mocha';
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

    it('should be false if user uses profilV2 and the current route is /profil', function() {
      // given
      const component = this.owner.lookup('component:user-logged-menu');
      component.set('currentUser', Service.create({
        user: { usesProfileV2: true }
      }));
      component.set('routing', Service.create({
        currentRouteName: 'profile'
      }));
      component.set('current-routed-modal', Service.create({}));

      // when
      const result = component.get('canDisplayLinkToProfile');

      // then
      expect(result).to.be.false;
    });

    it('should be false if user does not use profileV2 and the current route is /compte', function() {
      // given
      const component = this.owner.lookup('component:user-logged-menu');
      component.set('routing', Service.create({
        currentRouteName: 'compte'
      }));
      component.set('current-routed-modal', Service.create({}));

      // when
      const result = component.get('canDisplayLinkToProfile');

      // then
      expect(result).to.be.false;
    });

    it('should be false if the current route is /board', function() {
      // given
      const component = this.owner.lookup('component:user-logged-menu');
      component.set('routing', Service.create({
        currentRouteName: 'board'
      }));
      component.set('current-routed-modal', Service.create({}));

      // when
      const result = component.get('canDisplayLinkToProfile');

      // then
      expect(result).to.be.false;
    });

    it('should be true otherwise', function() {
      // given
      const component = this.owner.lookup('component:user-logged-menu');
      component.set('routing', Service.create({
        currentRouteName: 'other'
      }));
      component.set('current-routed-modal', Service.create({}));

      // when
      const result = component.get('canDisplayLinkToProfile');

      // then
      expect(result).to.be.true;
    });
  });
});
