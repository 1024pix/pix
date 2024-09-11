import { PoleEmploiPayload } from '../../../../../../lib/infrastructure/externals/pole-emploi/PoleEmploiPayload.js';
import { ParticipationStartedJobController } from '../../../../../../src/prescription/campaign-participation/application/jobs/participation-started-job-controller.js';
import { ParticipationStartedJob } from '../../../../../../src/prescription/campaign-participation/domain/models/ParticipationStartedJob.js';
import { PoleEmploiSending } from '../../../../../../src/shared/domain/models/PoleEmploiSending.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Application | Controller | Jobs | participation-started-controller', function () {
  let data, dependencies, expectedResults;
  let httpAgent,
    httpErrorsHelper,
    logger,
    campaignRepository,
    campaignParticipationRepository,
    organizationRepository,
    targetProfileRepository,
    userRepository,
    poleEmploiNotifier,
    poleEmploiSendingRepository,
    authenticationMethodRepository;

  beforeEach(function () {
    authenticationMethodRepository = {
      findOneByUserIdAndIdentityProvider: sinon.stub(),
      updateAuthenticationComplementByUserIdAndIdentityProvider: sinon.stub(),
    };
    campaignRepository = { get: sinon.stub() };
    campaignParticipationRepository = { get: sinon.stub() };
    organizationRepository = { get: sinon.stub() };
    targetProfileRepository = { get: sinon.stub() };
    userRepository = { get: sinon.stub() };
    poleEmploiNotifier = { notify: sinon.stub() };
    poleEmploiSendingRepository = { create: sinon.stub() };

    httpAgent = Symbol('httpAgent');
    logger = Symbol('logger');
    httpErrorsHelper = Symbol('httpErrorsHelper');

    dependencies = {
      authenticationMethodRepository,
      campaignRepository,
      campaignParticipationRepository,
      organizationRepository,
      poleEmploiSendingRepository,
      targetProfileRepository,
      userRepository,
      poleEmploiNotifier,
      httpAgent,
      logger,
      httpErrorsHelper,
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
        etat: 2,
        progression: 0,
        typeTest: 'DI',
        referenceExterne: 55667788,
        dateDebut: new Date('2020-01-02'),
        dateProgression: null,
        dateValidation: null,
        evaluation: null,
        uniteEvaluation: 'A',
        elementsEvalues: [],
      },
    });
  });

  it('fails when data is not of correct type', async function () {
    // given
    const data = 'not an data of the correct type';
    // when / then
    const handler = new ParticipationStartedJobController();

    const error = await catchErr(handler.handle)(data, { ...dependencies });

    // then
    expect(error).not.to.be.null;
  });

  context('#ParticipationStarted', function () {
    let campaignParticipationId, campaignId, userId, organizationId;

    beforeEach(function () {
      campaignParticipationId = 55667788;
      campaignId = Symbol('campaignId');
      userId = Symbol('userId');
      organizationId = Symbol('organizationId');
    });

    context('when campaign is of type ASSESSMENT and organization is Pole Emploi', function () {
      beforeEach(function () {
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
        const campaignParticipation = domainBuilder.buildCampaignParticipation({
          id: campaignParticipationId,
          userId,
          campaign,
          createdAt: new Date('2020-01-02'),
        });

        campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves(campaignParticipation);
        campaignRepository.get.withArgs(campaignId).resolves(campaign);
        organizationRepository.get.withArgs(organizationId).resolves({ isPoleEmploi: true });
        userRepository.get
          .withArgs(userId)
          .resolves(domainBuilder.buildUser({ id: userId, firstName: 'Jean', lastName: 'Bonneau' }));
        targetProfileRepository.get.withArgs('targetProfileId1').resolves({ name: 'Diagnostic initial' });

        data = new ParticipationStartedJob({ campaignParticipationId });
      });

      it('should notify pole emploi and create pole emploi sending accordingly', async function () {
        // given
        const expectedResponse = { isSuccessful: 'someValue', code: 'someCode' };
        poleEmploiNotifier.notify
          .withArgs(userId, expectedResults, {
            authenticationMethodRepository,
            httpAgent,
            httpErrorsHelper,
            logger,
          })
          .resolves(expectedResponse);
        const poleEmploiSending = Symbol('Pole emploi sending');
        sinon
          .stub(PoleEmploiSending, 'buildForParticipationStarted')
          .withArgs({
            campaignParticipationId,
            payload: expectedResults.toString(),
            isSuccessful: expectedResponse.isSuccessful,
            responseCode: expectedResponse.code,
          })
          .returns(poleEmploiSending);

        // when
        const handler = new ParticipationStartedJobController();

        await handler.handle({ data, dependencies });
        // then
        expect(poleEmploiSendingRepository.create).to.have.been.calledWithExactly({ poleEmploiSending });
      });
    });

    context('when campaign is of type ASSESSMENT but organization is not Pole Emploi', function () {
      beforeEach(function () {
        const campaign = domainBuilder.buildCampaign({
          id: campaignId,
          type: 'ASSESSMENT',
          organization: { id: organizationId },
        });
        const campaignParticipation = domainBuilder.buildCampaignParticipation({
          id: campaignParticipationId,
          userId,
          campaign,
          createdAt: new Date('2020-01-02'),
        });

        campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves(campaignParticipation);
        campaignRepository.get.withArgs(campaignId).resolves(campaign);
        organizationRepository.get.withArgs(organizationId).resolves({ isPoleEmploi: false });

        data = new ParticipationStartedJob({ campaignParticipationId });
      });

      it('should not notify to Pole Emploi', async function () {
        // when
        const handler = new ParticipationStartedJobController();

        await handler.handle({ data, dependencies });

        // then
        sinon.assert.notCalled(poleEmploiNotifier.notify);
      });
    });

    context('when organization is Pole Emploi but campaign is of type PROFILES_COLLECTION', function () {
      beforeEach(function () {
        const campaign = domainBuilder.buildCampaign({
          id: campaignId,
          type: 'PROFILES_COLLECTION',
          organization: { id: organizationId },
        });
        const campaignParticipation = domainBuilder.buildCampaignParticipation({
          id: campaignParticipationId,
          userId,
          campaign,
          createdAt: new Date('2020-01-02'),
        });

        campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves(campaignParticipation);
        campaignRepository.get.withArgs(campaignId).resolves(campaign);
        organizationRepository.get.withArgs(organizationId).resolves({ isPoleEmploi: true });

        data = new ParticipationStartedJob({ campaignParticipationId });
      });

      it('should not notify to Pole Emploi', async function () {
        // when
        const handler = new ParticipationStartedJobController();

        await handler.handle({ data, dependencies });

        sinon.assert.notCalled(poleEmploiNotifier.notify);
      });
    });
  });
});
