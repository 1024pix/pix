import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import Service from '@ember/service';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | password-reset-demand-form', () => {

  setupTest();

  let component;
  const sentEmail = 'dumb@people.com';
  let createRecordStub, saveStub;

  describe('#savePasswordResetDemand', () => {

    beforeEach(function() {
      saveStub = sinon.stub().resolves();
      createRecordStub = sinon.stub().returns({
        save: saveStub
      });

      component = this.owner.lookup('component:password-reset-demand-form');
      component.set('store', Service.create({
        createRecord: createRecordStub
      }));
      component.set('email', sentEmail);
    });

    it('should create a passwordResetDemand Record', () => {
      // when
      component.send('savePasswordResetDemand');

      // then
      sinon.assert.called(createRecordStub);
      sinon.assert.calledWith(createRecordStub, 'password-reset-demand', { email: sentEmail });
    });

    it('should save email without spaces', () => {
      // given
      const emailWithSpaces = '    user@example.net   ';
      component.set('email', emailWithSpaces);
      const expectedEmail = emailWithSpaces.trim();

      // when
      component.send('savePasswordResetDemand');

      // then
      sinon.assert.calledWith(createRecordStub, 'password-reset-demand', { email: expectedEmail });
    });

    it('should save the password reset demand', () => {
      // when
      component.send('savePasswordResetDemand');

      // then
      sinon.assert.called(saveStub);
    });

    it('should display success message when save resolves', async () => {
      // when
      await component.send('savePasswordResetDemand');

      // then
      expect(component.get('_displaySuccessMessage')).to.be.true;
      expect(component.get('_displayErrorMessage')).to.be.false;
    });
  });

});
