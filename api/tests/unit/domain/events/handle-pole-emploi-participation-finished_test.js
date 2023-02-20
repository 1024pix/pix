import { catchErr, expect, sinon, domainBuilder } from '../../../test-helper';
import AssessmentCompleted from '../../../../lib/domain/events/AssessmentCompleted';
import PoleEmploiSending from '../../../../lib/domain/models/PoleEmploiSending';
import PoleEmploiPayload from '../../../../lib/infrastructure/externals/pole-emploi/PoleEmploiPayload';
const { handlePoleEmploiParticipationFinished } = require('../../../../lib/domain/events')._forTestOnly.handlers;

describe('Unit | Domain | Events | handle-pole-emploi-participation-finished', function () {
  let event, dependencies, expectedResults;
  let assessmentRepository,
    campaignRepository,
    campaignParticipationRepository,
    organizationRepository,
    targetProfileRepository,
    userRepository,
    poleEmploiNotifier,
    poleEmploiSendingRepository;

  beforeEach(function () {
    assessmentRepository = { get: sinon.stub() };
    campaignRepository = { get: sinon.stub() };
    campaignParticipationRepository = { get: sinon.stub() };
    organizationRepository = { get: sinon.stub() };
    targetProfileRepository = { get: sinon.stub() };
    userRepository = { get: sinon.stub() };
    poleEmploiNotifier = { notify: sinon.stub() };
    poleEmploiSendingRepository = { create: sinon.stub() };

    dependencies = {
      assessmentRepository,
      campaignRepository,
      campaignParticipationRepository,
      organizationRepository,
      targetProfileRepository,
      userRepository,
      poleEmploiNotifier,
      poleEmploiSendingRepository,
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
        etat: 3,
        progression: 100,
        typeTest: 'DI',
        referenceExterne: 55667788,
        dateDebut: new Date('2020-01-02'),
        dateProgression: new Date('2020-01-03'),
        dateValidation: null,
        evaluation: null,
        uniteEvaluation: 'A',
        elementsEvalues: [],
      },
    });
  });

  afterEach(function () {
    sinon.restore();
  });

  it('fails when event is not of correct type', async function () {
    // given
    const event = 'not an event of the correct type';
    // when / then
    const error = await catchErr(handlePoleEmploiParticipationFinished)({ event, ...dependencies });

    // then
    expect(error).not.to.be.null;
  });

  context('#handlePoleEmploiParticipationFinished', function () {
    let campaignId, userId, organizationId, assessmentId;

    beforeEach(function () {
      campaignId = Symbol('campaignId');
      userId = Symbol('userId');
      organizationId = Symbol('organizationId');
      assessmentId = Symbol('assessmentId');
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
          id: 55667788,
          userId,
          campaign,
          assessments: [domainBuilder.buildAssessment({ id: assessmentId })],
          createdAt: new Date('2020-01-02'),
        });
        event = new AssessmentCompleted({ campaignParticipationId: campaignParticipation.id });

        campaignParticipationRepository.get.withArgs(campaignParticipation.id).resolves(campaignParticipation);
        assessmentRepository.get.withArgs(assessmentId).resolves(
          domainBuilder.buildAssessment({
            updatedAt: new Date('2020-01-03'),
          })
        );
        organizationRepository.get.withArgs(organizationId).resolves({ isPoleEmploi: true });
        userRepository.get
          .withArgs(userId)
          .resolves(domainBuilder.buildUser({ id: userId, firstName: 'Jean', lastName: 'Bonneau' }));
        campaignRepository.get.withArgs(campaignId).resolves(campaign);
        targetProfileRepository.get.withArgs('targetProfileId1').resolves({ name: 'Diagnostic initial' });
      });

      it('should notify pole emploi and create pole emploi sending accordingly', async function () {
        // given

        const expectedResponse = { isSuccessful: 'someValue', code: 'someCode' };
        poleEmploiNotifier.notify.withArgs(userId, expectedResults).resolves(expectedResponse);
        const poleEmploiSending = Symbol('Pole emploi sending');
        sinon
          .stub(PoleEmploiSending, 'buildForParticipationFinished')
          .withArgs({
            campaignParticipationId: 55667788,
            payload: expectedResults.toString(),
            isSuccessful: expectedResponse.isSuccessful,
            responseCode: expectedResponse.code,
          })
          .returns(poleEmploiSending);

        // when
        await handlePoleEmploiParticipationFinished({
          event,
          ...dependencies,
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
        const campaignParticipation = domainBuilder.buildCampaignParticipation({
          id: 55667788,
          userId,
          campaign,
          createdAt: new Date('2020-01-02'),
        });
        event = new AssessmentCompleted({ campaignParticipationId: campaignParticipation.id });

        campaignParticipationRepository.get.withArgs(campaignParticipation.id).resolves(campaignParticipation);
        campaignRepository.get.withArgs(campaignId).resolves(domainBuilder.buildCampaign(campaign));
        organizationRepository.get.withArgs(organizationId).resolves({ isPoleEmploi: false });
      });

      it('should not notify to Pole Emploi', async function () {
        // when
        await handlePoleEmploiParticipationFinished({
          event,
          ...dependencies,
        });

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
          id: 55667788,
          userId,
          campaign,
          createdAt: new Date('2020-01-02'),
        });
        event = new AssessmentCompleted({ campaignParticipationId: campaignParticipation.id });

        campaignParticipationRepository.get.withArgs(campaignParticipation.id).resolves(campaignParticipation);
        campaignRepository.get.withArgs(campaignId).resolves(domainBuilder.buildCampaign(campaign));
        organizationRepository.get.withArgs(organizationId).resolves({ isPoleEmploi: true });
      });

      it('should not notify to Pole Emploi', async function () {
        // when
        await handlePoleEmploiParticipationFinished({
          event,
          ...dependencies,
        });

        // then
        sinon.assert.notCalled(poleEmploiNotifier.notify);
      });
    });
  });
});
