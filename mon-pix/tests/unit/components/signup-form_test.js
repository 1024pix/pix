import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import pick from 'lodash/pick';

import { setupTest } from 'ember-mocha';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

describe('Unit | Component | signup-form', function() {

  setupTest();

  let component;

  beforeEach(function() {
    class SessionStub extends Service {
      attemptedTransition = {
        from: {
          parent: {
            params: sinon.stub().resolves(),
          },
        },
      }
    }
    this.owner.register('service:session', SessionStub);
    component = createGlimmerComponent('component:signup-form');
  });

  describe('#signup', () => {

    it('should save user without spaces', () => {
      // given
      const userWithSpaces = EmberObject.create({
        firstName: '  Chris  ',
        lastName: '  MylastName  ',
        email: '    user@example.net  ',
        password: 'Pix12345',
        save: sinon.stub().resolves(),
      });
      component.args.user = userWithSpaces;

      const expectedUser = {
        firstName: userWithSpaces.firstName.trim(),
        lastName: userWithSpaces.lastName.trim(),
        email: userWithSpaces.email.trim(),
      };

      // when
      component.signup();

      // then
      const user = component.args.user;
      expect(pick(user, ['firstName', 'lastName', 'email'])).to.deep.equal(expectedUser);
    });

    it('should send campaignCode when is defined', () => {
      // given
      const userWithSpaces = EmberObject.create({
        firstName: '  Chris  ',
        lastName: '  MylastName  ',
        email: '    user@example.net  ',
        password: 'Pix12345',
        save: sinon.stub().resolves(),
      });
      component.args.user = userWithSpaces;

      const campaignCode = 'AZERTY123';
      component.session.attemptedTransition.from.parent.params.code = campaignCode;

      // when
      component.signup();

      // then
      sinon.assert.calledWith(userWithSpaces.save, { adapterOptions: { campaignCode } });
    });
  });

});
