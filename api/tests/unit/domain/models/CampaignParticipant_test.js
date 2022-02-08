const CampaignParticipant = require('../../../../lib/domain/models/CampaignParticipant');
const { expect, domainBuilder, catchErr } = require('../../../test-helper');
const {
  EntityValidationError,
  ForbiddenAccess,
  AlreadyExistingCampaignParticipationError,
} = require('../../../../lib/domain/errors');

describe('Unit | Domain | Models | CampaignParticipant', function () {
  describe('#start', function () {
    context('when this is an assessment campaign', function () {
      it('should create a campaign campaign participation', function () {
        const campaignToStartParticipation = domainBuilder.buildCampaignToStartParticipation({
          type: 'ASSESSMENT',
          multipleSendings: true,
          idPixLabel: null,
        });
        const schoolingRegistrationId = 12;
        const userId = 13;
        const participantExternalId = 13;
        const campaignParticipant = new CampaignParticipant({
          campaignToStartParticipation,
          userId,
          schoolingRegistrationId,
        });
        campaignParticipant.start({ participantExternalId });

        expect(campaignParticipant.campaignParticipation).to.deep.include({
          campaignId: campaignToStartParticipation.id,
          status: 'STARTED',
          userId,
          schoolingRegistrationId,
        });
      });

      it('should create an assessment', function () {
        const campaignToStartParticipation = domainBuilder.buildCampaignToStartParticipation({
          type: 'ASSESSMENT',
          multipleSendings: true,
          idPixLabel: null,
        });
        const schoolingRegistrationId = 12;
        const userId = 13;
        const participantExternalId = 13;
        const campaignParticipant = new CampaignParticipant({
          campaignToStartParticipation,
          userId,
          schoolingRegistrationId,
        });
        campaignParticipant.start({ participantExternalId });

        expect(campaignParticipant.assessment).to.deep.include({
          courseId: '[NOT USED] Campaign Assessment CourseId Not Used',
          isImproving: false,
          method: 'SMART_RANDOM',
          state: 'started',
          type: 'CAMPAIGN',
        });
      });

      context('when campaign allows multiple participation and has a previous campaign participation', function () {
        it('should create an assessment for improving campaign results', function () {
          const campaignToStartParticipation = domainBuilder.buildCampaignToStartParticipation({
            type: 'ASSESSMENT',
            multipleSendings: true,
            idPixLabel: null,
            skillCount: 1,
          });
          const previousCampaignParticipation = { status: 'SHARED', validatedSkillsCount: 0, id: 1 };
          const campaignParticipant = new CampaignParticipant({
            campaignToStartParticipation,
            previousCampaignParticipation,
          });
          campaignParticipant.start({ participantExternalId: null });

          expect(campaignParticipant.assessment).to.deep.include({
            courseId: '[NOT USED] Campaign Assessment CourseId Not Used',
            isImproving: true,
            method: 'SMART_RANDOM',
            state: 'started',
            type: 'CAMPAIGN',
          });
        });

        it('throws a AlreadyExistingCampaignParticipationError exception when the participant has validated the maximum number of skills', async function () {
          const userId = 1;
          const campaignToStartParticipation = domainBuilder.buildCampaignToStartParticipation({
            type: 'ASSESSMENT',
            idPixLabel: null,
            skillCount: 2,
          });

          const campaignParticipant = new CampaignParticipant({
            campaignToStartParticipation,
            userId,
            previousCampaignParticipation: {
              status: 'SHARED',
              validatedSkillsCount: 2,
            },
          });
          const error = await catchErr(campaignParticipant.start, campaignParticipant)({ participantExternalId: null });

          expect(error).to.be.an.instanceof(AlreadyExistingCampaignParticipationError);
          expect(error.message).to.equal(
            `User ${userId} has already a campaign participation with campaign ${campaignToStartParticipation.id}`
          );
        });

        it('throws a AlreadyExistingCampaignParticipationError exception when the participant has validated more than the maximum number of skills (when a skill has been deprecated)', async function () {
          const userId = 1;
          const campaignToStartParticipation = domainBuilder.buildCampaignToStartParticipation({
            type: 'ASSESSMENT',
            idPixLabel: null,
            skillCount: 2,
          });

          const campaignParticipant = new CampaignParticipant({
            campaignToStartParticipation,
            userId,
            previousCampaignParticipation: {
              status: 'SHARED',
              validatedSkillsCount: 3,
            },
          });
          const error = await catchErr(campaignParticipant.start, campaignParticipant)({ participantExternalId: null });

          expect(error).to.be.an.instanceof(AlreadyExistingCampaignParticipationError);
          expect(error.message).to.equal(
            `User ${userId} has already a campaign participation with campaign ${campaignToStartParticipation.id}`
          );
        });
      });
    });

    context('when this is a profiles collection campaign', function () {
      it('should create a campaign campaign participation', function () {
        const campaignToStartParticipation = domainBuilder.buildCampaignToStartParticipation({
          type: 'PROFILES_COLLECTION',
          idPixLabel: null,
          skillCount: 0,
        });
        const schoolingRegistrationId = 12;
        const userId = 13;
        const participantExternalId = 13;
        const campaignParticipant = new CampaignParticipant({
          campaignToStartParticipation,
          userId,
          schoolingRegistrationId,
        });
        campaignParticipant.start({ participantExternalId });

        expect(campaignParticipant.campaignParticipation).to.deep.include({
          campaignId: campaignToStartParticipation.id,
          status: 'TO_SHARE',
          userId,
          schoolingRegistrationId,
        });
      });

      it('should not create an assessment', async function () {
        const campaignToStartParticipation = domainBuilder.buildCampaignToStartParticipation({
          type: 'PROFILES_COLLECTION',
          idPixLabel: null,
        });
        const campaignParticipant = new CampaignParticipant({
          campaignToStartParticipation,
        });
        campaignParticipant.start({ participantExternalId: null });

        expect(campaignParticipant.assessment).to.be.undefined;
      });

      context('when campaign allows multiple participation and has a previous campaign participation', function () {
        it('should not throw an error when there is no validated skill count', async function () {
          const campaignToStartParticipation = domainBuilder.buildCampaignToStartParticipation({
            type: 'PROFILES_COLLECTION',
            multipleSendings: true,
            idPixLabel: null,
          });
          const previousCampaignParticipation = { status: 'SHARED', validatedSkillsCount: null, id: 1 };
          const campaignParticipant = new CampaignParticipant({
            campaignToStartParticipation,
            previousCampaignParticipation,
          });

          expect(() => campaignParticipant.start({ participantExternalId: null })).to.not.throw();
        });
      });
    });

    context('when the campaign is restricted', function () {
      let userId;
      let restrictedCampaign;
      beforeEach(function () {
        userId = 1;
        restrictedCampaign = domainBuilder.buildCampaignToStartParticipation({
          idPixLabel: null,
          isRestricted: true,
        });
      });

      it('throws a ForbiddenAccess exception when the user is not in the organization trainees', async function () {
        const campaignParticipant = new CampaignParticipant({
          campaignToStartParticipation: restrictedCampaign,
          userId,
          schoolingRegistrationId: null,
        });
        const error = await catchErr(campaignParticipant.start, campaignParticipant)({ participantExternalId: null });

        expect(error).to.be.an.instanceof(ForbiddenAccess);
        expect(error.message).to.equal("Vous n'êtes pas autorisé à rejoindre la campagne");
      });

      it('creates a new participation when the user is in the organization trainees', function () {
        const campaignParticipant = new CampaignParticipant({
          campaignToStartParticipation: restrictedCampaign,
          userId,
          schoolingRegistrationId: 1,
        });

        campaignParticipant.start({ participantExternalId: null });

        expect(campaignParticipant.campaignParticipation.campaignId).to.equal(restrictedCampaign.id);
      });
    });

    context('when the campaign has an idPixLabel', function () {
      let campaignToStartParticipation;
      let userId;
      beforeEach(function () {
        userId = 1;
        campaignToStartParticipation = domainBuilder.buildCampaignToStartParticipation({ idPixLabel: 'something' });
      });

      it('should throw an error if participantExternalId is missing in parameters', async function () {
        const campaignParticipant = new CampaignParticipant({
          campaignToStartParticipation,
          userId,
        });

        const error = await catchErr(campaignParticipant.start, campaignParticipant)({ participantExternalId: null });

        expect(error).instanceof(EntityValidationError);
      });

      it('should get participant external id from parameters', async function () {
        const campaignParticipant = new CampaignParticipant({
          campaignToStartParticipation,
          userId,
        });

        const expectedParticipantExternalId = 'YvoLol';
        campaignParticipant.start({ participantExternalId: expectedParticipantExternalId });

        expect(campaignParticipant.campaignParticipation.participantExternalId).equal(expectedParticipantExternalId);
      });

      it('should get participant externalid from the previous participation', async function () {
        campaignToStartParticipation = domainBuilder.buildCampaignToStartParticipation({
          idPixLabel: 'something',
          multipleSendings: true,
          skillCount: 1,
        });
        const expectedParticipantExternalId = 'YvoLol';
        const campaignParticipant = new CampaignParticipant({
          campaignToStartParticipation,
          previousCampaignParticipation: {
            status: 'SHARED',
            validatedSkillsCount: 0,
            participantExternalId: expectedParticipantExternalId,
          },
          userId,
        });

        campaignParticipant.start({ participantExternalId: null });

        expect(campaignParticipant.campaignParticipation.participantExternalId).equal(expectedParticipantExternalId);
      });
    });

    context('when campaign allows multiple participation and has a previous campaign participation', function () {
      it('should improve the previous campaign participation', function () {
        const campaignToStartParticipation = domainBuilder.buildCampaignToStartParticipation({
          multipleSendings: true,
          idPixLabel: null,
        });
        const previousCampaignParticipation = { status: 'SHARED', id: 1 };
        const campaignParticipant = new CampaignParticipant({
          campaignToStartParticipation,
          previousCampaignParticipation,
        });
        campaignParticipant.start({ participantExternalId: null });

        expect(campaignParticipant.previousCampaignParticipation.isImproved).to.equal(true);
      });

      it('throws a AlreadyExistingCampaignParticipationError exception when the previous participation is not shared', async function () {
        const userId = 1;
        const campaignToStartParticipation = domainBuilder.buildCampaignToStartParticipation({
          idPixLabel: null,
        });

        const campaignParticipant = new CampaignParticipant({
          campaignToStartParticipation,
          userId,
          previousCampaignParticipation: {
            status: 'STARTED',
          },
        });
        const error = await catchErr(campaignParticipant.start, campaignParticipant)({ participantExternalId: null });

        expect(error).to.be.an.instanceof(AlreadyExistingCampaignParticipationError);
        expect(error.message).to.equal(
          `User ${userId} has already a campaign participation with campaign ${campaignToStartParticipation.id}`
        );
      });
    });

    it('throws a ForbiddenAccess exception when the campaign is archived', async function () {
      const userId = 1;
      const campaignToStartParticipation = domainBuilder.buildCampaignToStartParticipation({
        archivedAt: new Date('2022-01-01'),
        idPixLabel: null,
      });

      const campaignParticipant = new CampaignParticipant({
        campaignToStartParticipation,
        userId,
      });
      const error = await catchErr(campaignParticipant.start, campaignParticipant)({ participantExternalId: null });

      expect(error).to.be.an.instanceof(ForbiddenAccess);
      expect(error.message).to.equal("Vous n'êtes pas autorisé à rejoindre la campagne");
    });

    context('when campaign does not allow multiple participation', function () {
      it('throws a AlreadyExistingCampaignParticipationError exception when there is a previous participation', async function () {
        const userId = 1;
        const campaignToStartParticipation = domainBuilder.buildCampaignToStartParticipation({
          multipleSendings: false,
          idPixLabel: null,
        });

        const campaignParticipant = new CampaignParticipant({
          campaignToStartParticipation,
          userId,
          previousCampaignParticipation: { id: 1, status: 'SHARED' },
        });
        const error = await catchErr(campaignParticipant.start, campaignParticipant)({ participantExternalId: null });

        expect(error).to.be.an.instanceof(AlreadyExistingCampaignParticipationError);
        expect(error.message).to.equal(
          `User ${userId} has already a campaign participation with campaign ${campaignToStartParticipation.id}`
        );
      });
    });
  });
});
