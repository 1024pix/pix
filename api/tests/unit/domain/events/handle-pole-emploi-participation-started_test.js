const _ = require('lodash');
const { catchErr, expect, sinon, domainBuilder } = require('../../../test-helper');
const CampaignParticipationStarted = require('../../../../lib/domain/events/CampaignParticipationStarted');
const PoleEmploiSending = require('../../../../lib/domain/models/PoleEmploiSending');
const { handlePoleEmploiParticipationStarted } = require('../../../../lib/domain/events')._forTestOnly.handlers;

describe('Unit | Domain | Events | handle-pole-emploi-participation-started', function() {
  let event;

  const campaignRepository = { get: _.noop() };
  const campaignParticipationRepository = { get: _.noop() };
  const organizationRepository = { get: _.noop() };
  const poleEmploiSendingRepository = { create: _.noop() };
  const targetProfileRepository = { get: _.noop() };
  const userRepository = { get: _.noop() };
  const poleEmploiNotifier = { notify: _.noop() };

  const dependencies = {
    campaignRepository,
    campaignParticipationRepository,
    organizationRepository,
    poleEmploiSendingRepository,
    targetProfileRepository,
    userRepository,
    poleEmploiNotifier,
  };

  const expectedResults = JSON.stringify({
    campagne: {
      nom: 'Campagne Pôle Emploi',
      dateDebut: '2020-01-01T00:00:00.000Z',
      dateFin: '2020-02-01T00:00:00.000Z',
      type: 'EVALUATION',
      codeCampagne: 'CODEPE123',
      urlCampagne: 'https://app.pix.fr/campagnes/CODEPE123',
      nomOrganisme: 'Pix',
      typeOrganisme: 'externe',
    },
    individu: {
      nom: 'Bonneau',
      prenom: 'Jean',
    },
    test: {
      etat: 2,
      progression: 0,
      typeTest: 'DI',
      referenceExterne: 55667788,
      dateDebut: '2020-01-02T00:00:00.000Z',
      dateProgression: null,
      dateValidation: null,
      evaluation: null,
      uniteEvaluation: 'A',
      elementsEvalues: [],
    },
  });

  beforeEach(function() {
    campaignRepository.get = sinon.stub();
    campaignParticipationRepository.get = sinon.stub();
    organizationRepository.get = sinon.stub();
    poleEmploiSendingRepository.create = sinon.stub();
    targetProfileRepository.get = sinon.stub();
    userRepository.get = sinon.stub();
    poleEmploiNotifier.notify = sinon.stub();
  });

  it('fails when event is not of correct type', async function() {
    // given
    const event = 'not an event of the correct type';
    // when / then
    const error = await catchErr(handlePoleEmploiParticipationStarted)({ event, ...dependencies });

    // then
    expect(error).not.to.be.null;
  });

  context('#handlePoleEmploiParticipationStarted', function() {
    const campaignParticipationId = 55667788;
    const campaignId = Symbol('campaignId');
    const userId = 987654321;
    const organizationId = Symbol('organizationId');

    context('when campaign is of type ASSESSMENT and organization is Pole Emploi', function() {
      beforeEach(function() {
        const campaignParticipation = domainBuilder.buildCampaignParticipation({
          id: campaignParticipationId,
          userId,
          campaignId,
          createdAt: new Date('2020-01-02'),
        });

        campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves(campaignParticipation);
        organizationRepository.get.withArgs(organizationId).resolves({ isPoleEmploi: true });
        userRepository.get.withArgs(userId).resolves(domainBuilder.buildUser({ id: userId, firstName: 'Jean', lastName: 'Bonneau' }));
        campaignRepository.get.withArgs(campaignId).resolves(
          domainBuilder.buildCampaign({
            id: campaignId,
            name: 'Campagne Pôle Emploi',
            code: 'CODEPE123',
            createdAt: new Date('2020-01-01'),
            archivedAt: new Date('2020-02-01'),
            type: 'ASSESSMENT',
            targetProfile: { id: 'targetProfileId1' },
            organization: { id: organizationId },
          }),
        );
        targetProfileRepository.get.withArgs('targetProfileId1').resolves({ name: 'Diagnostic initial' });

        event = new CampaignParticipationStarted({ campaignParticipationId });
      });

      it('should notify pole emploi and create pole emploi sending accordingly', async function() {
        // given
        const expectedResponse = { isSuccessful: 'someValue', code: 'someCode' };
        poleEmploiNotifier.notify.withArgs(userId, expectedResults).resolves(expectedResponse);
        const poleEmploiSending = Symbol('Pole emploi sending');
        sinon.stub(PoleEmploiSending, 'buildForParticipationStarted').withArgs({
          campaignParticipationId,
          payload: expectedResults,
          isSuccessful: expectedResponse.isSuccessful,
          responseCode: expectedResponse.code,
        }).returns(poleEmploiSending);

        // when
        await handlePoleEmploiParticipationStarted({
          event,
          ...dependencies,
        });

        // then
        expect(poleEmploiSendingRepository.create).to.have.been.calledWith({ poleEmploiSending });
      });
    });

    context('when campaign is of type ASSESSMENT but organization is not Pole Emploi', function() {
      beforeEach(function() {
        const campaignParticipation = domainBuilder.buildCampaignParticipation({
          id: campaignParticipationId,
          userId,
          campaignId,
          createdAt: new Date('2020-01-02'),
        });

        campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves(campaignParticipation);
        campaignRepository.get.withArgs(campaignId).resolves(domainBuilder.buildCampaign({ type: 'ASSESSMENT', organization: { id: organizationId } }));
        organizationRepository.get.withArgs(organizationId).resolves({ isPoleEmploi: false });

        event = new CampaignParticipationStarted({ campaignParticipationId });
      });

      it('it should not notify to Pole Emploi', async function() {
        // when
        await handlePoleEmploiParticipationStarted({
          event,
          ...dependencies,
        });

        // then
        sinon.assert.notCalled(poleEmploiNotifier.notify);
      });
    });

    context('when organization is Pole Emploi but campaign is of type PROFILES_COLLECTION', function() {
      beforeEach(function() {
        const campaignParticipation = domainBuilder.buildCampaignParticipation({
          id: campaignParticipationId,
          userId,
          campaignId,
          createdAt: new Date('2020-01-02'),
        });

        campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves(campaignParticipation);
        campaignRepository.get.withArgs(campaignId).resolves(domainBuilder.buildCampaign({ type: 'PROFILES_COLLECTION', organization: { id: organizationId } }));
        organizationRepository.get.withArgs(organizationId).resolves({ isPoleEmploi: true });

        event = new CampaignParticipationStarted({ campaignParticipationId });
      });

      it('it should not notify to Pole Emploi', async function() {
        // when
        await handlePoleEmploiParticipationStarted({
          event,
          ...dependencies,
        });

        sinon.assert.notCalled(poleEmploiNotifier.notify);
      });
    });
  });
});
