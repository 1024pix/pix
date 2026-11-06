import { databaseBuffer } from '../database-buffer.ts';

type UserCampaignSurveyAttributes = {
  id?: number;
  userId?: number;
  campaignId?: number;
  satisfactionScore?: number;
  usefulnessScore?: number;
  personalizationScore?: number;
  attractivenessScore?: number;
  comment?: string;
  createdAt?: Date;
};

const buildUserCampaignSurvey = ({
  id = databaseBuffer.getNextId(),
  userId,
  campaignId,
  satisfactionScore = 3,
  usefulnessScore,
  personalizationScore,
  attractivenessScore,
  comment,
  createdAt = new Date(),
}: UserCampaignSurveyAttributes = {}) => {
  const survey = JSON.stringify({
    attractivenessScore,
    comment,
    personalizationScore,
    satisfactionScore,
    usefulnessScore,
  });
  return databaseBuffer.pushInsertable({
    tableName: 'user-campaign-surveys',
    values: { id, userId, campaignId, survey, createdAt },
  });
};

export { buildUserCampaignSurvey };
