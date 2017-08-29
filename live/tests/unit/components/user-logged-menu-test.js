import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import Ember from 'ember';

describe('Unit | Component | User logged Menu', function() {
  setupTest('component:user-logged-menu', {});

  describe('action#toggleUserMenu', function() {

    beforeEach(function() {
      this.register('service:store', Ember.Service.extend({
        findRecord() {
          return Ember.RSVP.resolve({});
        }
      }));
      this.inject.service('store', { as: 'store' });

      this.register('service:session', Ember.Service.extend({
        isAuthenticated: true,
        data: {
          authenticated: {
            userId: 1435
          }
        }
      }));
      this.inject.service('session', { as: 'session' });
    });

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

  describe('Display user details', function() {
    let findRecordArgs;

    describe('When user is logged', function() {

      beforeEach(function() {
        this.register('service:session', Ember.Service.extend({
          isAuthenticated: true,
          data: {
            authenticated: {
              userId: 1435
            }
          }
        }));
        this.inject.service('session', { as: 'session' });

        this.register('service:store', Ember.Service.extend({
          findRecord() {
            findRecordArgs = Array.from(arguments);
            return Ember.RSVP.resolve({
              firstName: 'FHI',
              lastName: '4EVER',
              email: 'FHI@4EVER.fr'
            });
          }
        }));
        this.inject.service('store', { as: 'store' });
      });

      it('should correctly call store', function() {
        // when
        this.subject();

        // then
        expect(findRecordArgs).to.deep.equal(['user', 1435]);
      });

    });

  });

});
