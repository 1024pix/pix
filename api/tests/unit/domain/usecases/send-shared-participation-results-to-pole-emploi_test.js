const { expect, sinon, domainBuilder } = require('../../../test-helper');
const PoleEmploiSending = require('../../../../lib/domain/models/PoleEmploiSending');
const PoleEmploiPayload = require('../../../../lib/infrastructure/externals/pole-emploi/PoleEmploiPayload');
const sendSharedParticipationResultsToPoleEmploi = require('../../../../lib/domain/usecases/send-shared-participation-results-to-pole-emploi');

describe('Unit | Domain | UseCase | send-shared-participation-results-to-pole-emploi', function () {
  let dependencies, expectedResults;
  let campaignRepository,
    badgeRepository,
    badgeAcquisitionRepository,
    campaignParticipationRepository,
    campaignParticipationResultRepository,
    organizationRepository,
    targetProfileRepository,
    userRepository,
    poleEmploiNotifier,
    poleEmploiSendingRepository;
  let campaignId, campaignParticipationId, userId, organizationId, badges, badgeAcquiredIds;

  beforeEach(function () {
    badgeRepository = { findByCampaignId: sinon.stub() };
    badgeAcquisitionRepository = { getAcquiredBadgeIds: sinon.stub() };
    campaignRepository = { get: sinon.stub() };
    campaignParticipationRepository = { get: sinon.stub() };
    campaignParticipationResultRepository = { getByParticipationId: sinon.stub() };
    organizationRepository = { get: sinon.stub() };
    targetProfileRepository = { get: sinon.stub() };
    userRepository = { get: sinon.stub() };
    poleEmploiNotifier = { notify: sinon.stub() };
    poleEmploiSendingRepository = { create: sinon.stub() };

    dependencies = {
      badgeRepository,
      badgeAcquisitionRepository,
      campaignRepository,
      campaignParticipationRepository,
      campaignParticipationResultRepository,
      organizationRepository,
      poleEmploiSendingRepository,
      targetProfileRepository,
      userRepository,
      poleEmploiNotifier,
    };

    expectedResults = new PoleEmploiPayload({
      campagne: {
        nom: 'Campagne Pôle Emploi',
        dateDebut: new Date('2020-01-01'),
        dateFin: new Date('2020-02-01'),
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
        dateDebut: new Date('2020-01-02'),
        dateProgression: new Date('2020-01-03'),
        dateValidation: new Date('2020-01-03'),
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
      badges: [
        {
          cle: 1,
          titre: 'titre',
          message: 'message',
          imageUrl: 'imageUrl',
          messageAlternatif: 'messageAlternatif',
          certifiable: true,
          obtenu: true,
        },
      ],
    });
    badges = [
      {
        id: 1,
        key: 1,
        title: 'titre',
        message: 'message',
        imageUrl: 'imageUrl',
        altMessage: 'messageAlternatif',
        isCertifiable: true,
      },
    ];
    badgeAcquiredIds = [1];
    campaignId = Symbol('campaignId');
    campaignParticipationId = 55667788;
    userId = Symbol('userId');
    organizationId = Symbol('organizationId');
  });

  context('when campaign is of type ASSESSMENT and organization is Pole Emploi', function () {
    beforeEach(function () {
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
      badgeRepository.findByCampaignId.withArgs(campaignId).resolves(badges);
      badgeAcquisitionRepository.getAcquiredBadgeIds.withArgs({ badgeIds: [1], userId }).resolves(badgeAcquiredIds);
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
          payload: expectedResults.toString(),
          isSuccessful: expectedResponse.isSuccessful,
          responseCode: expectedResponse.code,
        })
        .returns(poleEmploiSending);

      // when
      await sendSharedParticipationResultsToPoleEmploi({
        ...dependencies,
        campaignParticipationId,
      });

      // then
      expect(poleEmploiSendingRepository.create).to.have.been.calledWith({ poleEmploiSending });
    });
  });

  context('when campaign is of type ASSESSMENT but organization is not Pole Emploi', function () {
    beforeEach(function () {
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
      // when
      await sendSharedParticipationResultsToPoleEmploi({
        ...dependencies,
        campaignParticipationId,
      });

      // then
      sinon.assert.notCalled(poleEmploiNotifier.notify);
    });
  });

  context('when organization is Pole Emploi but campaign is of type PROFILES_COLLECTION', function () {
    beforeEach(function () {
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
      // when
      await sendSharedParticipationResultsToPoleEmploi({
        ...dependencies,
        campaignParticipationId,
      });

      // then
      sinon.assert.notCalled(poleEmploiNotifier.notify);
    });
  });
});
