import Service from '@ember/service';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | password-reset-form', function() {

  setupTest('component:password-reset-form', {});

  let component;
  const sentEmail = 'dumb@people.com';
  let createRecordStub, saveStub;

  describe('success save of password Reset Demand', function() {

    beforeEach(function() {

      saveStub = sinon.stub().resolves();
      createRecordStub = sinon.stub().returns({
        save: saveStub
      });

      this.register('service:store', Service.extend({
        createRecord: createRecordStub
      }));
      this.inject.service('store', { as: 'store' });

      component = this.subject();
      component.set('email', sentEmail);
    });

    it('should create a passwordResetDemand Record', function() {
      // when
      component.send('savePasswordResetDemand');

      // then
      sinon.assert.called(createRecordStub);
      sinon.assert.calledWith(createRecordStub, 'password-reset-demand', { email: sentEmail });
    });

    it('should save the password reset demand', function() {
      // when
      component.send('savePasswordResetDemand');

      // then
      sinon.assert.called(saveStub);
    });

    it('should display success message when save resolves', async function() {
      // when
      await component.send('savePasswordResetDemand');

      // then
      expect(component.get('_displaySuccessMessage')).to.be.true;
      expect(component.get('_displayErrorMessage')).to.be.false;
    });

  });

});
