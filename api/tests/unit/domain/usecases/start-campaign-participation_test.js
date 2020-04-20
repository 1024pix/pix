const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');

const Assessment = require('../../../../lib/domain/models/Assessment');
const usecases = require('../../../../lib/domain/usecases');
const { AlreadyExistingCampaignParticipationError, NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | start-campaign-participation', () => {

  const userId = 19837482;
  const campaignParticipation = domainBuilder.buildCampaignParticipation({});
  const campaignRepository = { get: () => undefined };
  const campaignParticipationRepository = { save: () => undefined, findOneByCampaignIdAndUserId: () => undefined };
  const assessmentRepository = { save: () => undefined };

  beforeEach(() => {
    sinon.stub(campaignRepository, 'get');
    sinon.stub(campaignParticipationRepository, 'save');
    sinon.stub(campaignParticipationRepository, 'findOneByCampaignIdAndUserId');
    sinon.stub(assessmentRepository, 'save');

    campaignRepository.get.resolves(domainBuilder.buildCampaign());
    campaignParticipationRepository.findOneByCampaignIdAndUserId.resolves(null);
  });

  it('should throw an error if the campaign does not exists', async () => {
    // given
    campaignRepository.get.resolves(null);

    // when
    const error = await catchErr(usecases.startCampaignParticipation)({ campaignParticipation, userId, campaignParticipationRepository, assessmentRepository, campaignRepository });

    // then
    return expect(error).to.be.instanceOf(NotFoundError);
  });

  it('should throw an error if the user has already participated to the campaign', async () => {
    // given
    campaignParticipationRepository.findOneByCampaignIdAndUserId.resolves({});

    // when
    const error = await catchErr(usecases.startCampaignParticipation)({ campaignParticipation, userId, campaignParticipationRepository, assessmentRepository, campaignRepository });

    // then
    return expect(error).to.be.instanceOf(AlreadyExistingCampaignParticipationError);
  });

  it('should save the campaign participation with userId', async () => {
    // given
    const assessmentId = 987654321;
    assessmentRepository.save.resolves({ id: assessmentId });
    campaignParticipationRepository.save.resolves({});

    // when
    await usecases.startCampaignParticipation({ campaignParticipation, userId, campaignParticipationRepository, assessmentRepository, campaignRepository });

    // then
    expect(campaignParticipationRepository.save).to.have.been.called;
    const campaignParticipationToSave = campaignParticipationRepository.save.firstCall.args[0];
    expect(campaignParticipationToSave.userId).to.equal(userId);
    expect(campaignParticipationToSave).to.deep.equal({
      ...campaignParticipation,
      userId,
    });
  });

  context('when campaign is of type ASSESSMENT', () => {

    beforeEach(() => {
      campaignRepository.get.resolves(domainBuilder.buildCampaign.ofTypeAssessment());
    });

    it('should create a smart placement assessment', async () => {
      // given
      assessmentRepository.save.resolves({});
      campaignParticipationRepository.save.resolves({ id: 1 });

      // when
      await usecases.startCampaignParticipation({ campaignParticipation, userId, campaignParticipationRepository, assessmentRepository, campaignRepository });

      // then
      expect(assessmentRepository.save).to.have.been.called;
      const assessmentToSave = assessmentRepository.save.firstCall.args[0].assessment;
      expect(assessmentToSave.type).to.equal(Assessment.types.SMARTPLACEMENT);
      expect(assessmentToSave.state).to.equal(Assessment.states.STARTED);
      expect(assessmentToSave.userId).to.equal(userId);
      expect(assessmentToSave.courseId).to.equal('Smart Placement Tests CourseId Not Used');
      expect(assessmentToSave.campaignParticipationId).to.equal(campaignParticipation.id);
    });
  });

  context('when campaign is of type PROFILES_COLLECTION', () => {

    beforeEach(() => {
      campaignRepository.get.resolves(domainBuilder.buildCampaign.ofTypeProfilesCollection());
    });

    it('should not create a smart placement assessment', async () => {
      // given
      campaignParticipationRepository.save.resolves({ id: 1 });

      // when
      await usecases.startCampaignParticipation({ campaignParticipation, userId, campaignParticipationRepository, assessmentRepository, campaignRepository });

      // then
      expect(assessmentRepository.save).to.not.have.been.called;
    });
  });

  it('should return the saved campaign participation', async () => {
    // given
    const assessmentId = 987654321;
    const createdCampaignParticipation = domainBuilder.buildCampaignParticipation();
    assessmentRepository.save.resolves({ id: assessmentId });
    campaignParticipationRepository.save.resolves(createdCampaignParticipation);

    // when
    const campaignParticipationReturned = await usecases.startCampaignParticipation({ campaignParticipation, userId, campaignParticipationRepository, assessmentRepository, campaignRepository });

    // then
    expect(campaignParticipationReturned).to.deep.equal(createdCampaignParticipation);
  });
});
