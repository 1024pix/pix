const _ = require('lodash');
const { catchErr, expect, sinon, domainBuilder } = require('../../../test-helper');
const AssessmentCompleted = require('../../../../lib/domain/events/AssessmentCompleted');
const PoleEmploiSending = require('../../../../lib/domain/models/PoleEmploiSending');
const { handlePoleEmploiParticipationFinished } = require('../../../../lib/domain/events')._forTestOnly.handlers;

describe('Unit | Domain | Events | handle-pole-emploi-participation-finished', () => {
  let event;

  const assessmentRepository = { get: _.noop() };
  const campaignRepository = { get: _.noop() };
  const campaignParticipationRepository = { get: _.noop() };
  const organizationRepository = { get: _.noop() };
  const targetProfileRepository = { get: _.noop() };
  const userRepository = { get: _.noop() };
  const poleEmploiNotifier = { notify: _.noop() };
  const poleEmploiSendingRepository = { create: _.noop() };

  const dependencies = {
    campaignRepository,
    assessmentRepository,
    campaignParticipationRepository,
    organizationRepository,
    targetProfileRepository,
    userRepository,
    poleEmploiNotifier,
    poleEmploiSendingRepository,
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
    assessmentRepository.get = sinon.stub();
    campaignRepository.get = sinon.stub();
    campaignParticipationRepository.get = sinon.stub();
    organizationRepository.get = sinon.stub();
    targetProfileRepository.get = sinon.stub();
    userRepository.get = sinon.stub();
    poleEmploiNotifier.notify = sinon.stub();
    poleEmploiSendingRepository.create = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
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

        campaignParticipationRepository.get.withArgs(campaignParticipation.id).resolves(campaignParticipation);
        assessmentRepository.get.withArgs(assessmentId).resolves(domainBuilder.buildAssessment({
          updatedAt: new Date('2020-01-03'),
        }));
        organizationRepository.get.withArgs(organizationId).resolves({ isPoleEmploi: true });
        userRepository.get.withArgs(userId).resolves(domainBuilder.buildUser({ id: userId, firstName: 'Jean', lastName: 'Bonneau' }));
        campaignRepository.get.withArgs(campaignId).resolves(
          domainBuilder.buildCampaign({
            id: 11223344,
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
      });

      it('should notify pole emploi and create pole emploi sending accordingly', async () => {
        // given

        const expectedResponse = { isSuccessful: 'someValue', code: 'someCode' };
        const domainTransaction = Symbol('domainTransaction');
        poleEmploiNotifier.notify.withArgs(userId, expectedResults).resolves(expectedResponse);
        const poleEmploiSending = Symbol('Pole emploi sending');
        sinon.stub(PoleEmploiSending, 'buildForParticipationFinished').withArgs({
          campaignParticipationId: 55667788,
          payload: expectedResults,
          isSuccessful: expectedResponse.isSuccessful,
          responseCode: expectedResponse.code,
        }).returns(poleEmploiSending);

        // when
        await handlePoleEmploiParticipationFinished({
          event,
          domainTransaction,
          ...dependencies,
        });

        // then
        expect(poleEmploiSendingRepository.create).to.have.been.calledWith({ poleEmploiSending, domainTransaction });
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

        campaignParticipationRepository.get.withArgs(campaignParticipation.id).resolves(campaignParticipation);
        campaignRepository.get.withArgs(campaignId).resolves(domainBuilder.buildCampaign({ type: 'ASSESSMENT', organization: { id: organizationId } }));
        organizationRepository.get.withArgs(organizationId).resolves({ isPoleEmploi: false });
      });

      it('it should not notify to Pole Emploi', async () => {
        // when
        await handlePoleEmploiParticipationFinished({
          event,
          ...dependencies,
        });

        // then
        sinon.assert.notCalled(poleEmploiNotifier.notify);
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

        campaignParticipationRepository.get.withArgs(campaignParticipation.id).resolves(campaignParticipation);
        campaignRepository.get.withArgs(campaignId).resolves(domainBuilder.buildCampaign({ type: 'PROFILES_COLLECTION', organization: { id: organizationId } }));
        organizationRepository.get.withArgs(organizationId).resolves({ isPoleEmploi: true });
      });

      it('it should not notify to Pole Emploi', async () => {
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
