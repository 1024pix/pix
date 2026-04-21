import crypto from 'node:crypto';

import sinon from 'sinon';

import { CampaignParticipationForUserManagement } from '../../../../../../src/prescription/campaign-participation/domain/models/CampaignParticipationForUserManagement.js';
import { usecases } from '../../../../../../src/prescription/campaign-participation/domain/usecases/index.js';
import {
  CampaignParticipationStatuses,
  CampaignTypes,
} from '../../../../../../src/prescription/shared/domain/constants.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | UseCase | find-campaign-participations-for-user-management', function () {
  let userId;

  beforeEach(async function () {
    userId = databaseBuilder.factory.buildUser().id;

    await databaseBuilder.commit();
    sinon.stub(crypto, 'randomUUID').returns(1234);
  });

  it(`return empty array when user has no participation`, async function () {
    //when
    const results = await usecases.findCampaignParticipationsForUserManagement({ userId });

    expect(results).lengthOf(0);
  });

  it(`return list of user participations`, async function () {
    const sharedAt = new Date('2024-04-04');
    // Assessment Campaign
    const campaignofTypeAssessment = databaseBuilder.factory.buildCampaign({
      code: 'ASSESS666',
      type: CampaignTypes.ASSESSMENT,
    });
    const assessmentParticipation = databaseBuilder.factory.buildCampaignParticipation({
      userId,
      campaignId: campaignofTypeAssessment.id,
      status: CampaignParticipationStatuses.STARTED,
    });
    databaseBuilder.factory.buildAssessment({ userId, campaignParticipationId: assessmentParticipation.id });

    // Profile Collection Campaign
    const campaignofTypeProfileCollection = databaseBuilder.factory.buildCampaign({
      code: 'COLLECT666',
      type: CampaignTypes.PROFILES_COLLECTION,
    });
    databaseBuilder.factory.buildCampaignParticipation({
      userId,
      campaignId: campaignofTypeProfileCollection.id,
      status: CampaignParticipationStatuses.STARTED,
    });

    // Exam Campaign
    const campaignofTypeExam = databaseBuilder.factory.buildCampaign({
      type: CampaignTypes.EXAM,
      code: 'EXAM666',
    });
    const examParticipation = databaseBuilder.factory.buildCampaignParticipation({
      userId,
      campaignId: campaignofTypeExam.id,
      status: CampaignParticipationStatuses.SHARED,
      sharedAt,
    });
    databaseBuilder.factory.buildAssessment({ userId, campaignParticipationId: examParticipation.id });

    await databaseBuilder.commit();

    //when
    const results = await usecases.findCampaignParticipationsForUserManagement({ userId });

    // then
    expect(results).lengthOf(3);
  });

  it(`return one assessments if user has improved his participation`, async function () {
    const createdAt = new Date('2020-01-02');
    const sharedAt = new Date('2021-01-02');
    const campaignofTypeAssessment = databaseBuilder.factory.buildCampaign({
      code: 'ASSESS666',
      type: CampaignTypes.ASSESSMENT,
    });
    const assessmentParticipation = databaseBuilder.factory.buildCampaignParticipation({
      userId,
      campaignId: campaignofTypeAssessment.id,
      status: CampaignParticipationStatuses.SHARED,
      sharedAt,
      createdAt,
    });
    databaseBuilder.factory.buildAssessment({ userId, campaignParticipationId: assessmentParticipation.id, createdAt });
    databaseBuilder.factory.buildAssessment({
      createdAt: new Date('2024-01-03'),
      userId,
      campaignParticipationId: assessmentParticipation.id,
      isImproving: true,
    });

    await databaseBuilder.commit();

    //when
    const results = await usecases.findCampaignParticipationsForUserManagement({ userId });

    // then
    expect(results).lengthOf(1);
    expect(results[0]).instanceOf(CampaignParticipationForUserManagement);
    expect(results[0]).deep.equals({
      id: 1234,
      campaignParticipationId: assessmentParticipation.id,
      createdAt,
      participantExternalId: assessmentParticipation.participantExternalId,
      status: assessmentParticipation.status,
      campaignId: campaignofTypeAssessment.id,
      campaignCode: campaignofTypeAssessment.code,
      sharedAt,
      deletedAt: null,
      organizationLearnerFullName: 'first-name last-name',
    });
  });

  context('anonymized context', function () {
    it(`return one assessments if user has improved assessment`, async function () {
      const createdAt = new Date('2025-01-05');
      const updatedAt = new Date('2025-06-06');
      databaseBuilder.factory.buildAssessment({
        userId,
        campaignParticipationId: null,
        type: Assessment.types.CAMPAIGN,
        createdAt,
        updatedAt,
      });
      databaseBuilder.factory.buildAssessment({
        userId,
        campaignParticipationId: null,
        type: Assessment.types.CAMPAIGN,
        isImproving: true,
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2020-05-04'),
      });

      await databaseBuilder.commit();

      //when
      const results = await usecases.findCampaignParticipationsForUserManagement({ userId });

      // then
      expect(results).lengthOf(1);
      expect(results[0]).deep.equals({
        id: 1234,
        campaignParticipationId: null,
        createdAt,
        participantExternalId: null,
        status: null,
        campaignId: null,
        campaignCode: null,
        sharedAt: null,
        deletedAt: updatedAt,
        organizationLearnerFullName: '-',
      });
    });

    it(`return two assessments if user has assessment without improving`, async function () {
      databaseBuilder.factory.buildAssessment({
        userId,
        campaignParticipationId: null,
        type: Assessment.types.CAMPAIGN,
        createdAt: new Date('2024-01-12'),
        isImproving: false,
      });
      databaseBuilder.factory.buildAssessment({
        userId,
        campaignParticipationId: null,
        type: Assessment.types.CAMPAIGN,
        createdAt: new Date('2024-12-01'),
        isImproving: false,
      });

      await databaseBuilder.commit();

      //when
      const results = await usecases.findCampaignParticipationsForUserManagement({ userId });

      // then
      expect(results).lengthOf(2);
    });
  });
});
