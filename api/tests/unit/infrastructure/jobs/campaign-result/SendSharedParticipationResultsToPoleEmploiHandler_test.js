const { expect, sinon, domainBuilder } = require('../../../../test-helper');
const CampaignParticipationResultsShared = require('../../../../../lib/domain/events/CampaignParticipationResultsShared');
const PoleEmploiSending = require('../../../../../lib/domain/models/PoleEmploiSending');
const SendSharedParticipationResultsToPoleEmploiHandler = require('../../../../../lib/infrastructure/jobs/campaign-result/SendSharedParticipationResultsToPoleEmploiHandler');

describe('Unit | Infrastructure | Jobs | SendSharedParticipationResultsToPoleEmploiHandler', function () {
  let event, dependencies, expectedResults;
  let campaignRepository,
    campaignParticipationRepository,
    campaignParticipationResultRepository,
    organizationRepository,
    targetProfileRepository,
    userRepository,
    poleEmploiNotifier,
    poleEmploiSendingRepository;

  beforeEach(function () {
    campaignRepository = { get: sinon.stub() };
    campaignParticipationRepository = { get: sinon.stub() };
    campaignParticipationResultRepository = { getByParticipationId: sinon.stub() };
    organizationRepository = { get: sinon.stub() };
    targetProfileRepository = { get: sinon.stub() };
    userRepository = { get: sinon.stub() };
    poleEmploiNotifier = { notify: sinon.stub() };
    poleEmploiSendingRepository = { create: sinon.stub() };

    dependencies = {
      campaignRepository,
      campaignParticipationRepository,
      campaignParticipationResultRepository,
      organizationRepository,
      poleEmploiSendingRepository,
      targetProfileRepository,
      userRepository,
      poleEmploiNotifier,
    };

    expectedResults = JSON.stringify({
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
  });

  afterEach(function () {
    sinon.restore();
  });

  context('#handle', function () {
    let campaignId, campaignParticipationId, userId, organizationId;

    beforeEach(function () {
      campaignId = Symbol('campaignId');
      campaignParticipationId = 55667788;
      userId = Symbol('userId');
      organizationId = Symbol('organizationId');
    });

    context('when campaign is of type ASSESSMENT and organization is Pole Emploi', function () {
      beforeEach(function () {
        event = new CampaignParticipationResultsShared({ campaignParticipationId });

        organizationRepository.get.withArgs(organizationId).resolves({ isPoleEmploi: true });
        userRepository.get
          .withArgs(userId)
          .resolves(domainBuilder.buildUser({ id: userId, firstName: 'Jean', lastName: 'Bonneau' }));
        targetProfileRepository.get.withArgs('targetProfileId1').resolves({ name: 'Diagnostic initial' });
        const campaign = domainBuilder.buildCampaign({
          id: campaignId,
          name: 'Campagne Pôle Emploi',
          code: 'CODEPE123',
          createdAt: new Date('2020-01-01'),
          archivedAt: new Date('2020-02-01'),
          type: 'ASSESSMENT',
          targetProfile: { id: 'targetProfileId1' },
          organization: { id: organizationId },
        });
        campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves(
          domainBuilder.buildCampaignParticipation({
            id: campaignParticipationId,
            campaign,
            userId,
            sharedAt: new Date('2020-01-03'),
            createdAt: new Date('2020-01-02'),
          })
        );
        campaignRepository.get.withArgs(campaignId).resolves(campaign);
        campaignParticipationResultRepository.getByParticipationId.withArgs(campaignParticipationId).resolves(
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
          })
        );
      });

      it('should notify pole emploi and create pole emploi sending accordingly', async function () {
        // given
        const expectedResponse = { isSuccessful: 'someValue', code: 'someCode' };
        poleEmploiNotifier.notify.withArgs(userId, expectedResults).resolves(expectedResponse);
        const poleEmploiSending = Symbol('Pole emploi sending');
        sinon
          .stub(PoleEmploiSending, 'buildForParticipationShared')
          .withArgs({
            campaignParticipationId,
            payload: expectedResults,
            isSuccessful: expectedResponse.isSuccessful,
            responseCode: expectedResponse.code,
          })
          .returns(poleEmploiSending);

        //given
        const sendSharedParticipationResultsToPoleEmploiHandler = new SendSharedParticipationResultsToPoleEmploiHandler(
          dependencies
        );

        // when
        await sendSharedParticipationResultsToPoleEmploiHandler.handle(event);

        // then
        expect(poleEmploiSendingRepository.create).to.have.been.calledWith({ poleEmploiSending });
      });
    });

    context('when campaign is of type ASSESSMENT but organization is not Pole Emploi', function () {
      beforeEach(function () {
        event = new CampaignParticipationResultsShared({ campaignParticipationId });
        const campaign = domainBuilder.buildCampaign({
          id: campaignId,
          type: 'ASSESSMENT',
          organization: { id: organizationId },
        });
        campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves(
          domainBuilder.buildCampaignParticipation({
            id: campaignParticipationId,
            campaign,
            userId,
            sharedAt: new Date('2020-01-03'),
            createdAt: new Date('2020-01-02'),
          })
        );
        campaignRepository.get.withArgs(campaignId).resolves(campaign);
        organizationRepository.get.withArgs(organizationId).resolves({ isPoleEmploi: false });
      });

      it('should not notify to Pole Emploi', async function () {
        //given
        const sendSharedParticipationResultsToPoleEmploiHandler = new SendSharedParticipationResultsToPoleEmploiHandler(
          dependencies
        );

        // when
        await sendSharedParticipationResultsToPoleEmploiHandler.handle(event);

        // then
        sinon.assert.notCalled(poleEmploiNotifier.notify);
      });
    });

    context('when organization is Pole Emploi but campaign is of type PROFILES_COLLECTION', function () {
      beforeEach(function () {
        event = new CampaignParticipationResultsShared({ campaignParticipationId });
        const campaign = domainBuilder.buildCampaign({ id: campaignId, campaignId, type: 'PROFILES_COLLECTION' });
        campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves(
          domainBuilder.buildCampaignParticipation({
            id: campaignParticipationId,
            campaign,
            userId,
            sharedAt: new Date('2020-01-03'),
            createdAt: new Date('2020-01-02'),
          })
        );
        campaignRepository.get.withArgs(campaignId).resolves(campaign);
        organizationRepository.get
          .withArgs(organizationId)
          .resolves({ isPoleEmploi: true, organization: { id: organizationId } });
      });

      it('should not notify to Pole Emploi', async function () {
        //given
        const sendSharedParticipationResultsToPoleEmploiHandler = new SendSharedParticipationResultsToPoleEmploiHandler(
          dependencies
        );

        // when
        await sendSharedParticipationResultsToPoleEmploiHandler.handle(event);

        // then
        sinon.assert.notCalled(poleEmploiNotifier.notify);
      });
    });
  });
});
