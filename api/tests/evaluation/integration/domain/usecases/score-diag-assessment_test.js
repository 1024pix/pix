import { expect } from 'chai';

import { evaluationUsecases } from '../../../../../src/evaluation/domain/usecases/index.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Integration | Usecases | score diag assessment', function () {
  describe('#scoreDiagAssessment()', function () {
    it('should return a capacity of score diag assessment', async function () {
      // given
      const firstChallengeId = 'recFirstChallenge';
      const secondChallengeId = 'recSecondChallenge';
      const thirdChallengeId = 'recThirdChallenge';

      const userId = 1234;
      const locale = 'fr';
      databaseBuilder.factory.buildUser({ id: userId });
      const version = domainBuilder.certification.configuration
        .versionBuilder()
        .withParameters({
          challengesConfiguration: {
            maximumAssessmentLength: 3,
            challengesBetweenSameCompetence: 0,
            limitToOneQuestionPerTube: false,
            enablePassageByAllCompetences: false,
            variationPercent: 0.5,
            defaultCandidateCapacity: -3,
            defaultProbabilityToPickChallenge: 51,
            questionNumberToPickFromSkillList: [2],
          },
        })
        .insertToDB({ databaseBuilder });

      databaseBuilder.factory.buildCertificationFrameworksChallenge({
        challengeId: firstChallengeId,
        versionId: version.id,
      });

      databaseBuilder.factory.buildCertificationFrameworksChallenge({
        challengeId: secondChallengeId,
        versionId: version.id,
      });

      databaseBuilder.factory.buildCertificationFrameworksChallenge({
        challengeId: thirdChallengeId,
        versionId: version.id,
      });
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileVersion({ versionId: version.id, targetProfileId });

      const campaign = databaseBuilder.factory.buildCampaign({ assessmentMethod: 'IRT', targetProfileId });
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId: campaign.id,
      });

      const assessment = databaseBuilder.factory.buildAssessment({
        type: Assessment.types.CAMPAIGN,
        method: Assessment.methods.IRT,
        userId,
        campaignParticipationId: campaignParticipation.id,
        lastQuestionDate: new Date('2020-01-20'),
        state: 'started',
      });

      databaseBuilder.factory.buildAnswer({ assessmentId: assessment.id, challengeId: firstChallengeId });
      databaseBuilder.factory.buildAnswer({ assessmentId: assessment.id, challengeId: secondChallengeId });
      databaseBuilder.factory.buildAnswer({ assessmentId: assessment.id, challengeId: firstChallengeId });
      await databaseBuilder.commit();

      // when
      const capacity = await evaluationUsecases.scoreDiagAssessment({
        assessmentId: assessment.id,
        locale,
      });

      // then
      expect(capacity).to.equal(-3);
    });
  });
});
