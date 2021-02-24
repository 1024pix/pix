import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

describe('Unit | Component | User logged Menu', function() {

  setupTest();
  let component;

  beforeEach(function() {
    component = createGlimmerComponent('component:user-logged-menu');
  });

  describe('#toggleUserMenu', function() {
    it('should return true, when user details is clicked', function() {
      // given
      component.canDisplayMenu = false;

      // when
      component.toggleUserMenu();

      // then
      expect(component.canDisplayMenu).to.equal(true);
    });

    it('should return false, when canDisplayMenu was previously true', function() {
      // given
      component.canDisplayMenu = true;

      // when
      component.toggleUserMenu();

      // then
      expect(component.canDisplayMenu).to.equal(false);
    });
  });

  describe('displayedIdentifier', function() {

    it('should return user\'s email if not undefined', function() {
      // given
      component.currentUser = Service.create({
        user: {
          email: 'email@example.net',
        },
      });

      // then
      expect(component.displayedIdentifier).to.equal('email@example.net');
    });

    it('should return user\'s username if not undefined and no email defined', function() {
      // given
      component.currentUser = Service.create({
        user: {
          username: 'my username',
        },
      });

      // then
      expect(component.displayedIdentifier).to.equal('my username');
    });

    it('should return user\'s email if email and username are defined', function() {
      // given
      component.currentUser = Service.create({
        user: {
          email: 'email@example.net',
          username: 'my username',
        },
      });

      // then
      expect(component.displayedIdentifier).to.equal('email@example.net');
    });

    it('should return undefined if no email or username are defined', function() {
      // given
      component.currentUser = Service.create({
        user: {
        },
      });

      // then
      expect(component.displayedIdentifier).to.equal(undefined);
    });
  });
});
