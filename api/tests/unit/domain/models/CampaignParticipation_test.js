import { CampaignParticipation } from '../../../../lib/domain/models/CampaignParticipation.js';
import { CampaignParticipationStatuses } from '../../../../lib/domain/models/CampaignParticipationStatuses.js';
import { expect, domainBuilder, sinon, catchErr } from '../../../test-helper.js';
import { CampaignTypes } from '../../../../src/prescription/campaign/domain/read-models/CampaignTypes.js';
import { Assessment } from '../../../../src/shared/domain/models/Assessment.js';

import {
  ArchivedCampaignError,
  AssessmentNotCompletedError,
  AlreadySharedCampaignParticipationError,
  CantImproveCampaignParticipationError,
  CampaignParticipationDeletedError,
} from '../../../../lib/domain/errors.js';

const { TO_SHARE, SHARED } = CampaignParticipationStatuses;

describe('Unit | Domain | Models | CampaignParticipation', function () {
  describe('#getTargetProfileId', function () {
    it('should return the targetProfileId from campaign associated', function () {
      // given
      const campaign = domainBuilder.buildCampaign.ofTypeAssessment();
      const campaignParticipation = new CampaignParticipation({
        id: 1,
        campaign,
        assessmentId: 1,
      });

      // when
      const targetProfileId = campaignParticipation.getTargetProfileId();

      // then
      expect(targetProfileId).to.equal(campaign.targetProfile.id);
    });

    it('should return null if has not campaign', function () {
      // given
      const campaignParticipation = new CampaignParticipation({
        id: 1,
        campaign: null,
        assessmentId: 1,
      });

      // when
      const targetProfileId = campaignParticipation.getTargetProfileId();

      // then
      expect(targetProfileId).to.equal(null);
    });
  });

  describe('lastAssessment', function () {
    it('should retrieve the last assessment by creation date', function () {
      const campaignParticipation = new CampaignParticipation({
        assessments: [
          { createdAt: new Date('2010-10-02') },
          { createdAt: new Date('2010-10-06') },
          { createdAt: new Date('2010-10-04') },
        ],
      });
      expect(campaignParticipation.lastAssessment).to.deep.equal({ createdAt: new Date('2010-10-06') });
    });
  });

  describe('improve', function () {
    context('when the campaign has the type PROFILES_COLLECTION', function () {
      it('throws an CantImproveCampaignParticipationError', async function () {
        const campaign = domainBuilder.buildCampaign({ type: CampaignTypes.PROFILES_COLLECTION });
        const campaignParticipation = new CampaignParticipation({ campaign });

        const error = await catchErr(campaignParticipation.improve, campaignParticipation)();

        expect(error).to.be.an.instanceOf(CantImproveCampaignParticipationError);
      });
    });

    context('when the campaign participation status is different from STARTED', function () {
      it('changes the status to STARTED', async function () {
        const campaign = domainBuilder.buildCampaign({ type: CampaignTypes.ASSESSMENT });
        const campaignParticipation = new CampaignParticipation({ campaign, status: TO_SHARE });

        campaignParticipation.improve();

        expect(campaignParticipation.status).to.equal('STARTED');
      });
    });
  });

  describe('share', function () {
    context('when the campaign is not archived nor deleted', function () {
      let clock;
      const now = new Date('2021-09-25');

      beforeEach(function () {
        clock = sinon.useFakeTimers({ now: now.getTime(), toFake: ['Date'] });
      });

      afterEach(function () {
        clock.restore();
      });

      context('when the campaign is already shared', function () {
        it('throws an AlreadySharedCampaignParticipationError error', async function () {
          const campaign = domainBuilder.buildCampaign({ type: CampaignTypes.PROFILES_COLLECTION });
          const campaignParticipation = new CampaignParticipation({ campaign, status: SHARED });

          const error = await catchErr(campaignParticipation.share, campaignParticipation)();

          expect(error).to.be.an.instanceOf(AlreadySharedCampaignParticipationError);
        });
      });

      context('when the campaign has the type PROFILES_COLLECTION', function () {
        it('share the CampaignParticipation', function () {
          const campaign = domainBuilder.buildCampaign({ type: CampaignTypes.PROFILES_COLLECTION });
          const campaignParticipation = new CampaignParticipation({ campaign });

          campaignParticipation.share();

          expect(campaignParticipation.isShared).to.be.true;
          expect(campaignParticipation.sharedAt).to.deep.equals(now);
          expect(campaignParticipation.status).to.equals(CampaignParticipationStatuses.SHARED);
        });
      });

      context('when the campaign as the type ASSESSMENT', function () {
        context('when there is no assessment', function () {
          it('throws an AssessmentNotCompletedError', async function () {
            const campaign = domainBuilder.buildCampaign({ type: CampaignTypes.ASSESSMENT });
            const campaignParticipation = new CampaignParticipation({ campaign, assessments: [] });

            const error = await catchErr(campaignParticipation.share, campaignParticipation)();

            expect(error).to.be.an.instanceOf(AssessmentNotCompletedError);
          });
        });

        context('when the last assessment is not completed', function () {
          it('throws an AssessmentNotCompletedError', async function () {
            const campaign = domainBuilder.buildCampaign({ type: CampaignTypes.ASSESSMENT });
            const assessments = [
              domainBuilder.buildAssessment({ createdAt: new Date('2020-01-01'), state: Assessment.states.COMPLETED }),
              domainBuilder.buildAssessment({ createdAt: new Date('2020-01-02'), state: Assessment.states.STARTED }),
            ];
            const campaignParticipation = new CampaignParticipation({ campaign, assessments });

            const error = await catchErr(campaignParticipation.share, campaignParticipation)();

            expect(error).to.be.an.instanceOf(AssessmentNotCompletedError);
          });
        });

        context('when the last assessment is completed', function () {
          it('share the CampaignParticipation', function () {
            const campaign = domainBuilder.buildCampaign({ type: CampaignTypes.ASSESSMENT });
            const assessments = [
              domainBuilder.buildAssessment({ createdAt: new Date('2020-03-01'), state: Assessment.states.COMPLETED }),
              domainBuilder.buildAssessment({ createdAt: new Date('2020-01-01'), state: Assessment.states.STARTED }),
            ];
            const campaignParticipation = new CampaignParticipation({ campaign, assessments });

            campaignParticipation.share();

            expect(campaignParticipation.isShared).to.be.true;
            expect(campaignParticipation.sharedAt).to.deep.equals(now);
            expect(campaignParticipation.status).to.equals(CampaignParticipationStatuses.SHARED);
          });
        });
      });
    });

    context('when the campaign is archived', function () {
      it('throws an ArchivedCampaignError error', async function () {
        const campaign = domainBuilder.buildCampaign({ archivedAt: new Date() });
        const campaignParticipation = new CampaignParticipation({ campaign });

        const error = await catchErr(campaignParticipation.share, campaignParticipation)();

        expect(error).to.be.an.instanceOf(ArchivedCampaignError);
        expect(error.message).to.equals('Cannot share results on an archived campaign.');
      });
    });

    context('when the participation is deleted', function () {
      it('throws a CampaignParticipationDeletedError', async function () {
        const campaign = domainBuilder.buildCampaign();
        const campaignParticipation = new CampaignParticipation({ campaign, deletedAt: new Date() });

        const error = await catchErr(campaignParticipation.share, campaignParticipation)();

        expect(error).to.be.an.instanceOf(CampaignParticipationDeletedError);
        expect(error.message).to.equals('Cannot share results on a deleted participation.');
      });
    });
  });

  describe('#start', function () {
    it('should return an instance of CampaignParticipation', function () {
      const campaign = domainBuilder.buildCampaignToJoin();
      const campaignParticipation = CampaignParticipation.start({ campaign });

      expect(campaignParticipation instanceof CampaignParticipation).to.be.true;
    });

    context('organizationLearnerId', function () {
      it('it should set organizationLearnerId', function () {
        const organizationLearnerId = 1;
        const campaign = domainBuilder.buildCampaignToJoin();
        const campaignParticipation = CampaignParticipation.start({ campaign, organizationLearnerId });

        expect(campaignParticipation.organizationLearnerId).to.be.equal(organizationLearnerId);
      });

      it('it should set organizationLearnerId to null if it is not provided', function () {
        const campaign = domainBuilder.buildCampaignToJoin();
        const campaignParticipation = CampaignParticipation.start({ campaign });

        expect(campaignParticipation.organizationLearnerId).to.be.equal(null);
      });
    });

    context('status', function () {
      context('when the campaign as the type PROFILES_COLLECTION', function () {
        it('status to TO_SHARE', function () {
          const campaign = domainBuilder.buildCampaignToJoin({ type: CampaignTypes.PROFILES_COLLECTION });
          const campaignParticipation = CampaignParticipation.start({ campaign });

          expect(campaignParticipation.status).to.be.equal(CampaignParticipationStatuses.TO_SHARE);
        });
      });

      context('when the campaign as the type ASSESSMENT', function () {
        it('status to STARTED', function () {
          const campaign = domainBuilder.buildCampaignToJoin({ type: CampaignTypes.ASSESSMENT });
          const campaignParticipation = CampaignParticipation.start({ campaign });

          expect(campaignParticipation.status).to.be.equal(CampaignParticipationStatuses.STARTED);
        });
      });
    });
  });

  describe('delete', function () {
    let clock;
    const now = new Date('2021-09-25');

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now: now.getTime(), toFake: ['Date'] });
    });

    afterEach(function () {
      clock.restore();
    });

    it('updates attributes deletedAt and deletedBy', function () {
      const userId = 4567;
      const campaignParticipation = new CampaignParticipation({ deletedAt: null, deletedBy: null });

      campaignParticipation.delete(userId);

      expect(campaignParticipation.deletedAt).to.deep.equal(now);
      expect(campaignParticipation.deletedBy).to.deep.equal(userId);
    });
  });
});
