import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Controller | Campaigns | Fill in ParticipantExternalId', function() {
  setupTest('controller:campaigns/fill-in-id-pix', {
    needs: ['service:current-routed-modal']
  });

  const campaign = { id: 1243 };
  const campaignCode = 'CODECAMPAIGN';
  const participantExternalId = 'matricule123';
  let controller;

  beforeEach(function() {
    controller = this.subject();
    controller.set('model', {
      campaign,
      campaignCode,
      participantExternalId,
      idPixLabel: 'Identifiant professionnel',
      errorMessage: '',
    });
  });

  describe('#submit', () => {

    let startStub;

    beforeEach(function() {
      startStub = sinon.stub();
      controller.set('start', startStub);
    });

    it('should call start when participant external id is fulfilled', () => {
      // when
      controller.actions.submit.call(controller);

      // then
      sinon.assert.calledWith(startStub, campaign, campaignCode, participantExternalId);
    });

    it('should display error when participant external id is empty', () => {
      // given
      controller.set('model.participantExternalId', '');

      // when
      controller.actions.submit.call(controller);

      // then
      expect(controller.get('model.errorMessage')).to.equal(`Merci de renseigner votre ${controller.get('model.idPixLabel')}.`);
    });
  });

  describe('#cancel', () => {

    beforeEach(function() {
      controller.transitionToRoute = sinon.stub();
    });

    it('should transition to landing page', () => {
      // when
      controller.actions.cancel.call(controller);

      // then
      sinon.assert.calledWith(controller.transitionToRoute, 'campaigns.campaign-landing-page', controller.get('model.campaignCode'));
    });
  });
});
