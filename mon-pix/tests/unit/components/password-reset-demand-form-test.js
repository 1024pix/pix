import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import Service from '@ember/service';
import { setupTest } from 'ember-mocha';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

describe('Unit | Component | password-reset-demand-form', () => {

  setupTest();

  let component;
  const sentEmail = 'dumb@people.com';
  let createRecordStub, saveStub;

  describe('#savePasswordResetDemand', () => {

    beforeEach(function() {
      saveStub = sinon.stub().resolves();
      createRecordStub = sinon.stub().resolves({
        save: saveStub
      });

      component = createGlimmerComponent('component:password-reset-demand-form');
      component.store = Service.create({
        createRecord: createRecordStub
      });
      component.email = sentEmail;
    });

    it('should not call api if the user did not enter any email', async () => {
      // when
      component.email = undefined;
      await component.savePasswordResetDemand();

      // then
      sinon.assert.notCalled(createRecordStub);
    });

    it('should create a passwordResetDemand Record', async () => {
      // when
      await component.savePasswordResetDemand();

      // then
      sinon.assert.called(createRecordStub);
      sinon.assert.calledWith(createRecordStub, 'password-reset-demand', { email: sentEmail });
    });

    it('should save email without spaces', async () => {
      // given
      const emailWithSpaces = '    user@example.net   ';
      component.email = emailWithSpaces;
      const expectedEmail = emailWithSpaces.trim();

      // when
      await component.savePasswordResetDemand();

      // then
      sinon.assert.calledWith(createRecordStub, 'password-reset-demand', { email: expectedEmail });
    });

    it('should save the password reset demand', async () => {
      // when
      await component.savePasswordResetDemand();

      // then
      sinon.assert.called(saveStub);
    });

    it('should display success message when save resolves', async () => {
      // when
      await component.savePasswordResetDemand();

      // then
      expect(component.hasSucceeded).to.be.true;
      expect(component.hasFailed).to.be.false;
    });
  });

});
