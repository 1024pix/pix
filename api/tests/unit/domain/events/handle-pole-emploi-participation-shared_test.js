const { catchErr, expect, sinon, domainBuilder } = require('../../../test-helper');
const CampaignParticipationResultsShared = require('../../../../lib/domain/events/CampaignParticipationResultsShared');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const campaignParticipationRepository = require('../../../../lib/infrastructure/repositories/campaign-participation-repository');
const campaignParticipationResultRepository = require('../../../../lib/infrastructure/repositories/campaign-participation-result-repository');
const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');
const targetProfileRepository = require('../../../../lib/infrastructure/repositories/target-profile-repository');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const { handlePoleEmploiParticipationShared } = require('../../../../lib/domain/events')._forTestOnly.handlers;

describe('Unit | Domain | Events | handle-pole-emploi-participation-shared', () => {
  let event;
  let campaignRepositoryStub;
  let campaignParticipationRepositoryStub;
  let campaignParticipationResultRepositoryStub;
  let organizationRepositoryStub;
  let targetProfileRepositoryStub;
  let userRepositoryStub;

  const dependencies = {
    campaignRepository,
    campaignParticipationRepository,
    campaignParticipationResultRepository,
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
      etat: 4,
      progression: 100,
      typeTest: 'DI',
      referenceExterne: 55667788,
      dateDebut: '2020-01-02T00:00:00.000Z',
      dateProgression: '2020-01-03T00:00:00.000Z',
      dateValidation: '2020-01-03T00:00:00.000Z',
      evaluation: 70,
      uniteEvaluation: 'A',
      elementsEvalues: [
        {
          libelle: 'Gérer des données',
          categorie: 'competence',
          type: 'competence Pix',
          domaineRattachement: 'Information et données',
          nbSousElements: 4,
          evaluation: {
            scoreObtenu: 50,
            uniteScore: 'A',
            nbSousElementValide: 2,
          },
        },
        {
          libelle: 'Gérer des données 2',
          categorie: 'competence',
          type: 'competence Pix',
          domaineRattachement: 'Information et données',
          nbSousElements: 3,
          evaluation: {
            scoreObtenu: 100,
            uniteScore: 'A',
            nbSousElementValide: 3,
          },
        },
      ],
    },
  });

  beforeEach(() => {
    campaignRepositoryStub = sinon.stub(campaignRepository, 'get');
    campaignParticipationRepositoryStub = sinon.stub(campaignParticipationRepository, 'get');
    campaignParticipationResultRepositoryStub = sinon.stub(
      campaignParticipationResultRepository,
      'getByParticipationId',
    );
    organizationRepositoryStub = sinon.stub(organizationRepository, 'get');
    targetProfileRepositoryStub = sinon.stub(targetProfileRepository, 'get');
    userRepositoryStub = sinon.stub(userRepository, 'get');
  });

  it('fails when event is not of correct type', async () => {
    // given
    const event = 'not an event of the correct type';
    // when / then
    const error = await catchErr(handlePoleEmploiParticipationShared)({ event, ...dependencies });

    // then
    expect(error).not.to.be.null;
  });

  context('#handlePoleEmploiParticipationShared', () => {
    const campaignParticipationId = Symbol('campaignParticipationId');
    const campaignId = Symbol('campaignId');
    const userId = Symbol('userId');
    const organizationId = Symbol('organizationId');

    context('when campaign is of type ASSESSMENT and organization is Pole Emploi', () => {
      beforeEach(() => {
        event = new CampaignParticipationResultsShared({
          campaignId,
          campaignParticipationId,
          userId,
          organizationId,
        });

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
          }),
        );
        targetProfileRepositoryStub.withArgs('targetProfileId1').resolves({ name: 'Diagnostic initial' });
        campaignParticipationRepositoryStub.withArgs(campaignParticipationId).resolves(
          domainBuilder.buildCampaignParticipation({
            id: 55667788,
            sharedAt: new Date('2020-01-03'),
            createdAt: new Date('2020-01-02'),
          }),
        );
        campaignParticipationResultRepositoryStub.withArgs(campaignParticipationId).resolves(
          domainBuilder.buildCampaignParticipationResult({
            totalSkillsCount: 10,
            validatedSkillsCount: 7,
            competenceResults: [
              domainBuilder.buildCompetenceResult({
                name: 'Gérer des données',
                areaName: 'Information et données',
                totalSkillsCount: 4,
                testedSkillsCount: 2,
                validatedSkillsCount: 2,
              }),
              domainBuilder.buildCompetenceResult({
                name: 'Gérer des données 2',
                areaName: 'Information et données',
                totalSkillsCount: 3,
                testedSkillsCount: 3,
                validatedSkillsCount: 3,
              }),
            ],
          }),
        );

        sinon.stub(console, 'log');
      });

      it('it should console.log results', async () => {
        // when
        await handlePoleEmploiParticipationShared({
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
        event = new CampaignParticipationResultsShared({
          campaignId,
          campaignParticipationId,
          userId,
          organizationId,
        });
        campaignRepositoryStub.withArgs(campaignId).resolves(domainBuilder.buildCampaign({ type: 'ASSESSMENT' }));
        organizationRepositoryStub.withArgs(organizationId).resolves({ isPoleEmploi: false });
        sinon.stub(console, 'log');
      });

      it('it should not console.log results', async () => {
        // when
        await handlePoleEmploiParticipationShared({
          event,
          ...dependencies,
        });

        // then
        sinon.assert.notCalled(console.log);
      });
    });

    context('when organization is Pole Emploi but campaign is of type PROFILES_COLLECTION', () => {
      beforeEach(() => {
        event = new CampaignParticipationResultsShared({
          campaignId,
          campaignParticipationId,
          userId,
          organizationId,
        });

        campaignRepositoryStub
          .withArgs(campaignId)
          .resolves(domainBuilder.buildCampaign({ type: 'PROFILES_COLLECTION' }));
        organizationRepositoryStub.withArgs(organizationId).resolves({ isPoleEmploi: true });
        sinon.stub(console, 'log');
      });

      it('it should not console.log results', async () => {
        // when
        await handlePoleEmploiParticipationShared({
          event,
          ...dependencies,
        });

        // then
        sinon.assert.notCalled(console.log);
      });
    });
  });
});
