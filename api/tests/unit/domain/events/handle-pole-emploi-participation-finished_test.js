const { catchErr, expect, sinon, domainBuilder } = require('../../../test-helper');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const campaignParticipationRepository = require('../../../../lib/infrastructure/repositories/campaign-participation-repository');
const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');
const targetProfileRepository = require('../../../../lib/infrastructure/repositories/target-profile-repository');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const { handlePoleEmploiParticipationFinished } = require('../../../../lib/domain/events')._forTestOnly.handlers;
const AssessmentCompleted = require('../../../../lib/domain/events/AssessmentCompleted');

describe('Unit | Domain | Events | handle-pole-emploi-participation-finished', () => {
  let event;
  let campaignRepositoryStub;
  let assessmentRepositoryStub;
  let campaignParticipationRepositoryStub;
  let organizationRepositoryStub;
  let targetProfileRepositoryStub;
  let userRepositoryStub;

  const dependencies = {
    campaignRepository,
    assessmentRepository,
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
      etat: 3,
      progression: 100,
      typeTest: 'DI',
      referenceExterne: 55667788,
      dateDebut: '2020-01-02T00:00:00.000Z',
      dateProgression: '2020-01-03T00:00:00.000Z',
      dateValidation: null,
      evaluation: null,
      uniteEvaluation: 'A',
      elementsEvalues: [],
    },
  });

  beforeEach(() => {
    campaignRepositoryStub = sinon.stub(campaignRepository, 'get');
    assessmentRepositoryStub = sinon.stub(assessmentRepository, 'get');
    campaignParticipationRepositoryStub = sinon.stub(campaignParticipationRepository, 'get');
    organizationRepositoryStub = sinon.stub(organizationRepository, 'get');
    targetProfileRepositoryStub = sinon.stub(targetProfileRepository, 'get');
    userRepositoryStub = sinon.stub(userRepository, 'get');
  });

  it('fails when event is not of correct type', async () => {
    // given
    const event = 'not an event of the correct type';
    // when / then
    const error = await catchErr(handlePoleEmploiParticipationFinished)({ event, ...dependencies });

    // then
    expect(error).not.to.be.null;
  });

  context('#handlePoleEmploiParticipationFinished', () => {
    const campaignId = Symbol('campaignId');
    const userId = Symbol('userId');
    const organizationId = Symbol('organizationId');
    const assessmentId = Symbol('assessmentId');

    context('when campaign is of type ASSESSMENT and organization is Pole Emploi', () => {
      beforeEach(() => {
        const campaignParticipation = domainBuilder.buildCampaignParticipation({
          id: 55667788,
          userId,
          campaignId,
          assessmentId,
          createdAt: new Date('2020-01-02'),
        });
        event = new AssessmentCompleted({ campaignParticipationId: campaignParticipation.id });

        campaignParticipationRepositoryStub.withArgs(campaignParticipation.id).resolves(campaignParticipation);
        assessmentRepositoryStub.withArgs(assessmentId).resolves(domainBuilder.buildAssessment({
          updatedAt: new Date('2020-01-03'),
        }));
        organizationRepositoryStub.withArgs(organizationId).resolves({ isPoleEmploi: true });
        userRepositoryStub.withArgs(userId).resolves({ firstName: 'Jean', lastName: 'Bonneau' });
        campaignRepositoryStub.withArgs(campaignId).resolves(
          domainBuilder.buildCampaign({
            id: 11223344,
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

        sinon.stub(console, 'log');
      });

      it('it should console.log results', async () => {
        // when
        await handlePoleEmploiParticipationFinished({
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
          id: 55667788,
          userId,
          campaignId,
          createdAt: new Date('2020-01-02'),
        });
        event = new AssessmentCompleted({ campaignParticipationId: campaignParticipation.id });
    
        campaignParticipationRepositoryStub.withArgs(campaignParticipation.id).resolves(campaignParticipation);
        campaignRepositoryStub.withArgs(campaignId).resolves(domainBuilder.buildCampaign({ type: 'ASSESSMENT', organizationId }));
        organizationRepositoryStub.withArgs(organizationId).resolves({ isPoleEmploi: false });
        sinon.stub(console, 'log');
      });

      it('it should not console.log results', async () => {
        // when
        await handlePoleEmploiParticipationFinished({
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
          id: 55667788,
          userId,
          campaignId,
          createdAt: new Date('2020-01-02'),
        });
        event = new AssessmentCompleted({ campaignParticipationId: campaignParticipation.id });
        
        campaignParticipationRepositoryStub.withArgs(campaignParticipation.id).resolves(campaignParticipation);
        campaignRepositoryStub
          .withArgs(campaignId)
          .resolves(domainBuilder.buildCampaign({ type: 'PROFILES_COLLECTION', organizationId }));
        organizationRepositoryStub.withArgs(organizationId).resolves({ isPoleEmploi: true });
        sinon.stub(console, 'log');
      });

      it('it should not console.log results', async () => {
        // when
        await handlePoleEmploiParticipationFinished({
          event,
          ...dependencies,
        });

        // then
        sinon.assert.notCalled(console.log);
      });
    });
  });
});
