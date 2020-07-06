/* eslint ember/no-classic-classes: 0 */
/* eslint ember/require-tagless-components: 0 */

import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import _ from 'lodash';

import { setupTest } from 'ember-mocha';
import EmberObject from '@ember/object';
import Service from '@ember/service';

describe('Unit | Component | signup-form', function() {

  setupTest();

  let component;

  beforeEach(function() {
    this.owner.register('service:session', Service.extend({
      attemptedTransition: {
        from: {
          parent: {
            params: {}
          }
        }
      }
    }));
    component = this.owner.lookup('component:signup-form');
  });

  describe('#signup', () => {

    it('should save user without spaces', () => {
      // given
      const userWithSpaces = EmberObject.create({
        firstName: '  Chris  ',
        lastName: '  MylastName  ',
        email: '    user@example.net  ',
        password: 'Pix12345',
        save: sinon.stub().resolves()
      });
      component.set('user', userWithSpaces);

      const expectedUser = {
        firstName: userWithSpaces.firstName.trim(),
        lastName: userWithSpaces.lastName.trim(),
        email: userWithSpaces.email.trim()
      };

      // when
      component.send('signup');

      // then
      const user = component.get('user');
      expect(_.pick(user, ['firstName', 'lastName', 'email'])).to.deep.equal(expectedUser);
    });

    it('should send campaignCode when is defined', () => {
      // given
      const userWithSpaces = EmberObject.create({
        firstName: '  Chris  ',
        lastName: '  MylastName  ',
        email: '    user@example.net  ',
        password: 'Pix12345',
        save: sinon.stub().resolves()
      });
      component.set('user', userWithSpaces);

      const campaignCode = 'AZERTY123';
      component.session.attemptedTransition.from.parent.params.code = campaignCode;

      // when
      component.send('signup');

      // then
      sinon.assert.calledWith(userWithSpaces.save, { adapterOptions: { campaignCode } });
    });
  });

});
