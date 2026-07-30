import sinon from 'sinon';

import { CampaignParticipation } from '../../../../../../src/prescription/campaign-participation/domain/models/CampaignParticipation.js';
import {
  CampaignParticipationStatuses,
  CampaignTypes,
} from '../../../../../../src/prescription/shared/domain/constants.js';
import { ArchivedCampaignError } from '../../../../../../src/prescription/shared/domain/errors.js';
import {
  AlreadySharedCampaignParticipationError,
  AssessmentNotCompletedError,
  CampaignParticipationDeletedError,
} from '../../../../../../src/shared/domain/errors.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { CampaignParticipationLoggerContext } from '../../../../../../src/shared/domain/models/jobs/AuditLoggingJob.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

const { SHARED } = CampaignParticipationStatuses;

describe('Unit | Domain | Models | CampaignParticipation', function () {
  describe('delete', function () {
    let clock;
    const now = new Date('2021-09-25');

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now: now.getTime(), toFake: ['Date'] });
    });

    afterEach(function () {
      clock.restore();
    });

    it('updates attributes deletedAt,deletedBy and userId', function () {
      const userId = 4567;
      const campaignParticipation = new CampaignParticipation({ userId: 666, deletedAt: null, deletedBy: null });

      campaignParticipation.delete(userId);

      expect(campaignParticipation.loggerContext).to.equal(CampaignParticipationLoggerContext.DELETION);
      expect(campaignParticipation.userId).to.equal(null);
      expect(campaignParticipation.deletedAt).to.deep.equal(now);
      expect(campaignParticipation.deletedBy).to.deep.equal(userId);
    });
  });

  describe('anonymize', function () {
    it('updates userId', function () {
      const campaignParticipation = new CampaignParticipation({
        userId: 666,
        participantExternalId: 'thisismyemailbuddy@buddy.org',
        deletedAt: null,
        deletedBy: null,
      });

      campaignParticipation.anonymize();

      expect(campaignParticipation.loggerContext).to.equal(CampaignParticipationLoggerContext.ANONYMIZATION);
      expect(campaignParticipation.userId).to.equal(null);
      expect(campaignParticipation.participantExternalId).to.equal(null);
    });
  });

  describe('dataToUpdateOnDeletion', function () {
    it('should return payload to send on repository with specific field', function () {
      const campaignParticipation = new CampaignParticipation({
        userId: 666,
        participantExternalId: 'thisismyemailbuddy@buddy.org',
        deletedAt: new Date('2024-04-03'),
        deletedBy: 777,
      });

      expect(campaignParticipation.dataToUpdateOnDeletion).to.deep.equal({
        id: campaignParticipation.id,
        userId: campaignParticipation.userId,
        participantExternalId: campaignParticipation.participantExternalId,
        deletedAt: campaignParticipation.deletedAt,
        deletedBy: campaignParticipation.deletedBy,
      });
    });
  });

  describe('dataToUpdateOnAnonymisation', function () {
    it('should return payload to send on repository with specific field', function () {
      const campaignParticipation = new CampaignParticipation({
        userId: 666,
        participantExternalId: 'thisismyemailbuddy@buddy.org',
        deletedAt: new Date('2024-04-03'),
        deletedBy: 777,
      });

      expect(campaignParticipation.dataToUpdateOnAnonymisation).to.deep.equal({
        id: campaignParticipation.id,
        userId: campaignParticipation.userId,
      });
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

    context('when the campaign is not accessible', function () {
      it('throws an ArchivedCampaignError error', async function () {
        const campaign = { isAccessible: false };
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
    const userId = 123;
    const organizationLearnerId = 456;
    const participantExternalId = 'someExternalId';

    it('should return an instance of CampaignParticipation', function () {
      const campaign = domainBuilder.buildCampaignToStartParticipation();
      const campaignParticipation = CampaignParticipation.start({
        campaign,
        userId,
        organizationLearnerId,
        participantExternalId,
      });

      expect(campaignParticipation instanceof CampaignParticipation).to.be.true;
    });

    context('organizationLearnerId', function () {
      it('it should set organizationLearnerId', function () {
        const campaign = domainBuilder.buildCampaignToStartParticipation();
        const campaignParticipation = CampaignParticipation.start({
          campaign,
          userId,
          organizationLearnerId,
          participantExternalId,
        });

        expect(campaignParticipation.organizationLearnerId).to.be.equal(organizationLearnerId);
      });

      it('it should set organizationLearnerId to null if it is not provided', function () {
        const campaign = domainBuilder.buildCampaignToStartParticipation();
        const campaignParticipation = CampaignParticipation.start({
          campaign,
          userId,
          participantExternalId,
        });

        expect(campaignParticipation.organizationLearnerId).to.be.equal(null);
      });
    });

    context('status', function () {
      context('when the campaign has the type PROFILES_COLLECTION', function () {
        it('should set status to STARTED', function () {
          const campaign = domainBuilder.buildCampaignToStartParticipation({ type: CampaignTypes.PROFILES_COLLECTION });
          const campaignParticipation = CampaignParticipation.start({
            campaign,
            userId,
            organizationLearnerId,
            participantExternalId,
          });

          expect(campaignParticipation.status).to.be.equal(CampaignParticipationStatuses.STARTED);
        });
      });

      context('when the campaign has the type ASSESSMENT', function () {
        it('should set status to STARTED', function () {
          const campaign = domainBuilder.buildCampaignToStartParticipation({ type: CampaignTypes.ASSESSMENT });
          const campaignParticipation = CampaignParticipation.start({
            campaign,
            userId,
            organizationLearnerId,
            participantExternalId,
          });

          expect(campaignParticipation.status).to.be.equal(CampaignParticipationStatuses.STARTED);
        });
      });

      context('when the campaign has the type EXAM', function () {
        it('should set status to STARTED', function () {
          const campaign = domainBuilder.buildCampaignToStartParticipation({ type: CampaignTypes.EXAM });
          const campaignParticipation = CampaignParticipation.start({
            campaign,
            userId,
            organizationLearnerId,
            participantExternalId,
          });

          expect(campaignParticipation.status).to.be.equal(CampaignParticipationStatuses.STARTED);
        });
      });
    });
  });

  describe('#detachUser', function () {
    it('should remove userId', function () {
      const campaignParticipation = new CampaignParticipation({
        userId: 666,
      });

      campaignParticipation.detachUser();

      expect(campaignParticipation.userId).to.be.null;
    });
  });
});
