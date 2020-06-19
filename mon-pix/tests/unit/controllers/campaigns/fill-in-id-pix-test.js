import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Controller | Campaigns | Fill in ParticipantExternalId', function() {

  setupTest();

  const model = {
    id: 1243,
    code: 'CODECAMPAIGN',
    idPixLabel: 'Identifiant professionnel',
  };
  const participantExternalId = 'matricule123';

  let controller;

  beforeEach(function() {
    controller = this.owner.lookup('controller:campaigns/fill-in-id-pix');
    controller.set('model', model);
  });

  describe('#submit', () => {

    let transitionToRouteStub;

    beforeEach(function() {
      transitionToRouteStub = sinon.stub();
      controller.set('transitionToRoute', transitionToRouteStub);
    });

    it('should transition to route campaigns.start-or-resume when participant external id is fulfilled', () => {
      // given
      controller.set('participantExternalId', participantExternalId);

      // when
      controller.actions.submit.call(controller);

      // then
      sinon.assert.calledWith(transitionToRouteStub, 'campaigns.start-or-resume', controller.model, { queryParams: { participantExternalId } });
    });

    it('should display error when participant external id is empty', () => {
      // given
      controller.set('participantExternalId', '');

      // when
      controller.actions.submit.call(controller);

      // then
      expect(controller.get('errorMessage')).to.equal(`Merci de renseigner votre ${controller.get('model.idPixLabel')}.`);
    });
  });

  describe('#cancel', () => {

    beforeEach(function() {
      controller.transitionToRoute = sinon.stub();
    });

    it('should transition to start or resume', () => {
      // when
      controller.actions.cancel.call(controller);

      // then
      sinon.assert.calledWith(controller.transitionToRoute, 'campaigns.start-or-resume', controller.get('model.code'));
    });
  });
});
