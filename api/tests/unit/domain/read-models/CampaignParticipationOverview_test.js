const Stage = require('../../../../lib/domain/models/Stage');
const Skill = require('../../../../lib/domain/models/Skill');
const TargetProfileWithLearningContent = require('../../../../lib/domain/models/TargetProfileWithLearningContent');
const CampaignParticipationOverview = require('../../../../lib/domain/read-models/CampaignParticipationOverview');
const { expect } = require('../../../test-helper');

describe('Unit | Domain | Read-Models | CampaignParticipationOverview', function() {
  describe('constructor', function() {

    it('should create CampaignParticipationOverview', function() {
      const targetProfile = new TargetProfileWithLearningContent({ id: 2, skills: [new Skill()] });

      // when
      const campaignParticipationOverview = new CampaignParticipationOverview({
        id: 3,
        createdAt: new Date('2020-02-15T15:00:34Z'),
        isShared: true,
        sharedAt: new Date('2020-03-15T15:00:34Z'),
        targetProfile: targetProfile,
        organizationName: 'Pix',
        assessmentState: 'completed',
        campaignCode: 'campaignCode',
        campaignTitle: 'campaignTitle',
        masteryPercentage: '0.50',
      });

      // then
      expect(campaignParticipationOverview.id).to.equal(3);
      expect(campaignParticipationOverview.createdAt).to.deep.equal(new Date('2020-02-15T15:00:34Z'));
      expect(campaignParticipationOverview.sharedAt).to.deep.equal(new Date('2020-03-15T15:00:34Z'));
      expect(campaignParticipationOverview.isShared).to.be.true;
      expect(campaignParticipationOverview.targetProfileId).to.equal(2);
      expect(campaignParticipationOverview.organizationName).to.equal('Pix');
      expect(campaignParticipationOverview.assessmentState).to.equal('completed');
      expect(campaignParticipationOverview.campaignCode).to.equal('campaignCode');
      expect(campaignParticipationOverview.campaignTitle).to.equal('campaignTitle');
      expect(campaignParticipationOverview.masteryPercentage).to.equal('0.50');
    });
  });

  describe('#validatedStagesCount', function() {
    context('when the participation is shared', function() {
      context('when the targetProfile has stages', function() {
        it('should return validated stages count', function() {
          const stage1 = new Stage({
            threshold: 0,
          });
          const stage2 = new Stage({
            threshold: 10,
          });
          const stage3 = new Stage({
            threshold: 30,
          });
          const stage4 = new Stage({
            threshold: 70,
          });
          const targetProfile = new TargetProfileWithLearningContent({ stages: [ stage3, stage1, stage2, stage4], skills: [new Skill(), new Skill()] });
          const campaignParticipationOverview = new CampaignParticipationOverview({
            isShared: true,
            validatedSkillsCount: 1,
            targetProfile,
            masteryPercentage: '0.5',
          });

          expect(campaignParticipationOverview.validatedStagesCount).to.equal(2);
        });
      });

      context('when the targetProfile doesn\'t have stages', function() {
        it('should return null', function() {
          const targetProfile = new TargetProfileWithLearningContent();
          const campaignParticipationOverview = new CampaignParticipationOverview({
            isShared: true,
            validatedSkillsCount: 2,
            totalSkillsCount: 3,
            targetProfile,
          });

          expect(campaignParticipationOverview.validatedStagesCount).to.equal(null);
        });
      });
    });

    context('when the participation is not shared', function() {
      it('should return null', function() {
        const stage1 = new Stage({
          threshold: 0,
        });
        const stage2 = new Stage({
          threshold: 30,
        });
        const stage3 = new Stage({
          threshold: 70,
        });
        const targetProfile = new TargetProfileWithLearningContent({ stages: [ stage3, stage1, stage2] });
        const campaignParticipationOverview = new CampaignParticipationOverview({
          isShared: false,
          validatedSkillsCount: 2,
          totalSkillsCount: 3,
          targetProfile,
        });

        expect(campaignParticipationOverview.validatedStagesCount).to.equal(null);
      });
    });
  });

  describe('#totalStagesCount', function() {
    context('the target profile has stages', function() {
      it('should return the count of stages with a threshold over 0', function() {
        const stage1 = new Stage({
          threshold: 0,
        });
        const stage2 = new Stage({
          threshold: 3,
        });
        const stage3 = new Stage({
          threshold: 5,
        });
        const stage4 = new Stage({
          threshold: 8,
        });
        const stage5 = new Stage({
          threshold: 11,
        });
        const stage6 = new Stage({
          threshold: 14,
        });
        const targetProfileWithLearningContent = new TargetProfileWithLearningContent({ stages: [ stage1, stage2, stage3, stage4, stage5, stage6] });
        const campaignParticipationOverview = new CampaignParticipationOverview({
          isShared: true,
          targetProfile: targetProfileWithLearningContent,
        });

        expect(campaignParticipationOverview.totalStagesCount).to.equal(5);
      });
    });

    context('target profile doesn\'t have stages', function() {
      it('should return 0', function() {
        const targetProfileWithLearningContent = new TargetProfileWithLearningContent();
        const campaignParticipationOverview = new CampaignParticipationOverview({
          isShared: true,
          targetProfile: targetProfileWithLearningContent,
        });

        expect(campaignParticipationOverview.totalStagesCount).to.equal(0);
      });
    });
  });
});
