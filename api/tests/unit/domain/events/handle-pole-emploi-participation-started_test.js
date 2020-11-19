const { catchErr, expect, sinon, domainBuilder } = require('../../../test-helper');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const campaignParticipationRepository = require('../../../../lib/infrastructure/repositories/campaign-participation-repository');
const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');
const targetProfileRepository = require('../../../../lib/infrastructure/repositories/target-profile-repository');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const CampaignParticipationStarted = require('../../../../lib/domain/events/CampaignParticipationStarted');
const { handlePoleEmploiParticipationStarted } = require('../../../../lib/domain/events')._forTestOnly.handlers;

describe('Unit | Domain | Events | handle-pole-emploi-participation-started', () => {
  let event;
  let campaignRepositoryStub;
  let campaignParticipationRepositoryStub;
  let organizationRepositoryStub;
  let targetProfileRepositoryStub;
  let userRepositoryStub;

  const dependencies = {
    campaignRepository,
    campaignParticipationRepository,
    organizationRepository,
    targetProfileRepository,
    userRepository,
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

  beforeEach(() => {
    campaignRepositoryStub = sinon.stub(campaignRepository, 'get');
    campaignParticipationRepositoryStub = sinon.stub(campaignParticipationRepository, 'get');
    organizationRepositoryStub = sinon.stub(organizationRepository, 'get');
    targetProfileRepositoryStub = sinon.stub(targetProfileRepository, 'get');
    userRepositoryStub = sinon.stub(userRepository, 'get');
  });

  it('fails when event is not of correct type', async () => {
    // given
    const event = 'not an event of the correct type';
    // when / then
    const error = await catchErr(handlePoleEmploiParticipationStarted)({ event, ...dependencies });

    // then
    expect(error).not.to.be.null;
  });

  context('#handlePoleEmploiParticipationStarted', () => {
    const campaignParticipationId = 55667788;
    const campaignId = Symbol('campaignId');
    const userId = Symbol('userId');
    const organizationId = Symbol('organizationId');

    context('when campaign is of type ASSESSMENT and organization is Pole Emploi', () => {
      beforeEach(() => {
        const campaignParticipation = domainBuilder.buildCampaignParticipation({
          id: campaignParticipationId,
          userId,
          campaignId,
          createdAt: new Date('2020-01-02'),
        });

        campaignParticipationRepositoryStub.withArgs(campaignParticipationId).resolves(campaignParticipation);
        organizationRepositoryStub.withArgs(organizationId).resolves({ isPoleEmploi: true });
        userRepositoryStub.withArgs(userId).resolves({ firstName: 'Jean', lastName: 'Bonneau' });
        campaignRepositoryStub.withArgs(campaignId).resolves(
          domainBuilder.buildCampaign({
            id: campaignId,
            name: 'Campagne Pôle Emploi',
            code: 'CODEPE123',
            createdAt: new Date('2020-01-01'),
            archivedAt: new Date('2020-02-01'),
            type: 'ASSESSMENT',
            targetProfileId: 'targetProfileId1',
            organizationId,
          }),
        );
        targetProfileRepositoryStub.withArgs('targetProfileId1').resolves({ name: 'Diagnostic initial' });

        event = new CampaignParticipationStarted({ campaignParticipationId });
        
        sinon.stub(console, 'log');
      });

      it('it should console.log results', async () => {
        // when
        await handlePoleEmploiParticipationStarted({
          event,
          ...dependencies,
        });

        // then
        expect(console.log).to.have.been.calledOnce;
        const results = console.log.firstCall.args[0];
        expect(results).to.deep.equal(expectedResults);
      });
    });

    context('when campaign is of type ASSESSMENT but organization is not Pole Emploi', () => {
      beforeEach(() => {
        const campaignParticipation = domainBuilder.buildCampaignParticipation({
          id: campaignParticipationId,
          userId,
          campaignId,
          createdAt: new Date('2020-01-02'),
        });
        
        campaignParticipationRepositoryStub.withArgs(campaignParticipationId).resolves(campaignParticipation);
        campaignRepositoryStub.withArgs(campaignId).resolves(domainBuilder.buildCampaign({ type: 'ASSESSMENT', organizationId }));
        organizationRepositoryStub.withArgs(organizationId).resolves({ isPoleEmploi: false });
        
        event = new CampaignParticipationStarted({ campaignParticipationId });
        
        sinon.stub(console, 'log');
      });

      it('it should not console.log results', async () => {
        // when
        await handlePoleEmploiParticipationStarted({
          event,
          ...dependencies,
        });

        // then
        sinon.assert.notCalled(console.log);
      });
    });

    context('when organization is Pole Emploi but campaign is of type PROFILES_COLLECTION', () => {
      beforeEach(() => {
        const campaignParticipation = domainBuilder.buildCampaignParticipation({
          id: campaignParticipationId,
          userId,
          campaignId,
          createdAt: new Date('2020-01-02'),
        });
        
        campaignParticipationRepositoryStub.withArgs(campaignParticipationId).resolves(campaignParticipation);
        campaignRepositoryStub
          .withArgs(campaignId)
          .resolves(domainBuilder.buildCampaign({ type: 'PROFILES_COLLECTION', organizationId }));
        organizationRepositoryStub.withArgs(organizationId).resolves({ isPoleEmploi: true });

        sinon.stub(console, 'log');

        event = new CampaignParticipationStarted({ campaignParticipationId });
      });

      it('it should not console.log results', async () => {
        // when
        await handlePoleEmploiParticipationStarted({
          event,
          ...dependencies,
        });

        // then
        sinon.assert.notCalled(console.log);
      });
    });
  });
});
