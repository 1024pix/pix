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

    it('should be false if the current route is /profil', function() {
      // given
      const component = this.owner.lookup('component:user-logged-menu');
      component.set('routing', Service.create({
        currentRouteName: 'profile'
      }));

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

      // when
      const result = component.get('canDisplayLinkToProfile');

      // then
      expect(result).to.be.true;
    });
  });

  describe('displayedIdentifier', function() {

    it('should return user\'s email if not undefined', function() {
      // given
      const component = this.owner.lookup('component:user-logged-menu');
      component.set('currentUser', Service.create({
        user: {
          email: 'email@example.net'
        }
      }));

      // then
      expect(component.get('displayedIdentifier')).to.equal('email@example.net');
    });

    it('should return user\'s username if not undefined and no email defined', function() {
      // given
      const component = this.owner.lookup('component:user-logged-menu');
      component.set('currentUser', Service.create({
        user: {
          username: 'my username'
        }
      }));

      // then
      expect(component.get('displayedIdentifier')).to.equal('my username');
    });

    it('should return user\'s email if email and username are defined', function() {
      // given
      const component = this.owner.lookup('component:user-logged-menu');
      component.set('currentUser', Service.create({
        user: {
          email: 'email@example.net',
          username: 'my username'
        }
      }));

      // then
      expect(component.get('displayedIdentifier')).to.equal('email@example.net');
    });

    it('should return undefined if no email or username are defined', function() {
      // given
      const component = this.owner.lookup('component:user-logged-menu');
      component.set('currentUser', Service.create({
        user: {

        }
      }));

      // then
      expect(component.get('displayedIdentifier')).to.equal(undefined);
    });
  });
});
