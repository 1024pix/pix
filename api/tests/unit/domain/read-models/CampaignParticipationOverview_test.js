const Stage = require('../../../../lib/domain/models/Stage');
const Skill = require('../../../../lib/domain/models/Skill');
const TargetProfileWithLearningContent = require('../../../../lib/domain/models/TargetProfileWithLearningContent');
const CampaignParticipationOverview = require('../../../../lib/domain/read-models/CampaignParticipationOverview');
const { expect } = require('../../../test-helper');

describe('Unit | Domain | Read-Models | CampaignParticipationOverview', () => {
  describe('constructor', () => {

    it('should create CampaignParticipationOverview', () => {
      const targetProfile = new TargetProfileWithLearningContent({ id: 2, skills: [new Skill()] });

      // when
      const campaignParticipationOverview = new CampaignParticipationOverview({
        id: 3,
        createdAt: new Date('2020-02-15T15:00:34Z'),
        isShared: true,
        sharedAt: new Date('2020-03-15T15:00:34Z'),
        targetProfile: targetProfile,
        validatedSkillsCount: 1,
        organizationName: 'Pix',
        assessmentState: 'completed',
        campaignCode: 'campaignCode',
        campaignTitle: 'campaignTitle',
      });

      // then
      expect(campaignParticipationOverview.id).to.equal(3);
      expect(campaignParticipationOverview.createdAt).to.deep.equal(new Date('2020-02-15T15:00:34Z'));
      expect(campaignParticipationOverview.sharedAt).to.deep.equal(new Date('2020-03-15T15:00:34Z'));
      expect(campaignParticipationOverview.isShared).to.be.true;
      expect(campaignParticipationOverview.targetProfileId).to.equal(2);
      expect(campaignParticipationOverview.validatedSkillsCount).to.equal(1);
      expect(campaignParticipationOverview.organizationName).to.equal('Pix');
      expect(campaignParticipationOverview.assessmentState).to.equal('completed');
      expect(campaignParticipationOverview.campaignCode).to.equal('campaignCode');
      expect(campaignParticipationOverview.campaignTitle).to.equal('campaignTitle');
    });
  });

  describe('#masteryPercentage', () => {
    it('should compute mastery percentage', () => {
      const targetProfile = new TargetProfileWithLearningContent({ skills: [new Skill(), new Skill()] });

      // when
      const campaignParticipationOverview = new CampaignParticipationOverview({
        isShared: true,
        validatedSkillsCount: 1,
        targetProfile,
      });

      // then
      expect(campaignParticipationOverview.masteryPercentage).to.equal(50);
    });

    it('should return 0 if total skills count is zero', () => {
      const targetProfile = new TargetProfileWithLearningContent({ skills: [] });

      // when
      const campaignParticipationOverview = new CampaignParticipationOverview({
        isShared: true,
        validatedSkillsCount: 1,
        targetProfile,
      });

      // then
      expect(campaignParticipationOverview.masteryPercentage).to.equal(0);
    });

    it('should return null the participation is not shared', () => {
      const targetProfile = new TargetProfileWithLearningContent({ skills: [new Skill()] });

      // when
      const campaignParticipationOverview = new CampaignParticipationOverview({
        isShared: false,
        validatedSkillsCount: 1,
        targetProfile,
      });

      // then
      expect(campaignParticipationOverview.masteryPercentage).to.equal(null);
    });
  });

  describe('#validatedStagesCount', ()=> {
    context('when the participation is shared', ()=> {
      context('when the targetProfile has stages', () => {
        it('should return validated stages count', ()=> {
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
          });

          expect(campaignParticipationOverview.validatedStagesCount).to.equal(2);
        });
      });

      context('when the targetProfile doesn\'t have stages', () => {
        it('should return null', () => {
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

    context('when the participation is not shared', ()=> {
      it('should return null', ()=> {
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

  describe('#totalStagesCount', ()=> {
    context('the target profile has stages', () => {
      it('should return the count of stages with a threshold over 0', ()=> {
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

    context('target profile doesn\'t have stages', () => {
      it('should return 0', ()=> {
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
