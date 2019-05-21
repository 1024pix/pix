import Service from '@ember/service';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | User logged Menu', function() {

  setupTest('component:user-logged-menu', {
    needs: ['service:currentUser', 'service:keyboard', 'service:session', 'service:metrics']
  });

  describe('action#toggleUserMenu', function() {
    it('should return true, when user details is clicked', function() {
      // given
      const component = this.subject();
      // when
      component.send('toggleUserMenu');
      // then
      expect(component.get('_canDisplayMenu')).to.equal(true);
    });

    it('should return false as default value', function() {
      // when
      const component = this.subject();

      // then
      expect(component.get('_canDisplayMenu')).to.equal(false);
    });

    it('should return false, when _canDisplayMenu was previously true', function() {
      // given
      const component = this.subject();
      // when
      component.send('toggleUserMenu');
      component.send('toggleUserMenu');
      // then
      expect(component.get('_canDisplayMenu')).to.equal(false);
    });
  });

  describe('canDisplayLinkToProfile', function() {

    beforeEach(function() {

      this.register('service:current-routed-modal', Service.extend({}));
      this.inject.service('current-routed-modal', { as: 'current-routed-modal' });

    });

    it('should be false if user uses profilV2 and the current route is /profilv2', function() {
      // given
      this.register('service:-routing', Service.extend({
        currentRouteName: 'profilv2'
      }));
      this.inject.service('-routing', { as: '-routing' });

      this.register('service:currentUser', Service.extend({
        user: { usesProfileV2: true }
      }));
      this.inject.service('currentUser');

      const component = this.subject();

      // when
      const result = component.get('canDisplayLinkToProfile');

      // then
      expect(result).to.be.false;
    });

    it('should be false if user does not use profilV2 and the current route is /compte', function() {
      // given
      this.register('service:-routing', Service.extend({
        currentRouteName: 'compte'
      }));
      this.inject.service('-routing', { as: '-routing' });
      const component = this.subject();

      // when
      const result = component.get('canDisplayLinkToProfile');

      // then
      expect(result).to.be.false;
    });

    it('should be false if the current route is /board', function() {
      // given
      this.register('service:-routing', Service.extend({
        currentRouteName: 'board'
      }));
      this.inject.service('-routing', { as: '-routing' });
      const component = this.subject();

      // when
      const result = component.get('canDisplayLinkToProfile');

      // then
      expect(result).to.be.false;
    });

    it('should be true otherwise', function() {
      // given
      this.register('service:-routing', Service.extend({
        currentRouteName: 'other'
      }));
      this.inject.service('-routing', { as: '-routing' });
      const component = this.subject();

      // when
      const result = component.get('canDisplayLinkToProfile');

      // then
      expect(result).to.be.true;
    });
  });
});
