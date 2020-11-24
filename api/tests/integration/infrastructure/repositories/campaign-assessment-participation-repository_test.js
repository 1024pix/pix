const _ = require('lodash');
const { expect, databaseBuilder, mockLearningContent, knex } = require('../../../test-helper');
const Assessment = require('../../../../lib/domain/models/Assessment');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const CampaignAssessmentParticipation = require('../../../../lib/domain/read-models/CampaignAssessmentParticipation');
const campaignAssessmentParticipationRepository = require('../../../../lib/infrastructure/repositories/campaign-assessment-participation-repository');

describe('Integration | Repository | Campaign Assessment Participation', () => {

  describe('#getByCampaignIdAndCampaignParticipationId', () => {

    afterEach(() => {
      return knex('knowledge-element-snapshots').delete();
    });

    let campaignId, campaignParticipationId;

    context('When there is an assessment for another campaign and another participation', () => {
      const participant = {
        firstName: 'Josette',
        lastName: 'Gregorio',
      };
      const participation = {
        participantExternalId: '123AZ',
        createdAt: new Date('2020-10-10'),
        isShared: true,
        sharedAt: new Date('2020-12-12'),
      };
      beforeEach(async () => {
        const skill1 = { id: 'skill1' };
        const skill2 = { id: 'skill2' };
        mockLearningContent({ skills: [skill1, skill2] });
        campaignId = databaseBuilder.factory.buildAssessmentCampaign({}).id;

        campaignParticipationId = databaseBuilder.factory.buildAssessmentFromParticipation({
          ...participation,
          campaignId,
        }, participant).campaignParticipationId;

        databaseBuilder.factory.buildAssessmentFromParticipation({
          campaignId,
        }, {});

        const otherCampaign = databaseBuilder.factory.buildCampaign();
        databaseBuilder.factory.buildAssessmentFromParticipation({
          campaignId: otherCampaign.id,
        }, {});

        await databaseBuilder.commit();
      });

      it('matches the given campaign and given participation', async () => {
        const campaignAssessmentParticipation = await campaignAssessmentParticipationRepository.getByCampaignIdAndCampaignParticipationId({ campaignId, campaignParticipationId });

        expect(campaignAssessmentParticipation.campaignId).to.equal(campaignId);
        expect(campaignAssessmentParticipation.campaignParticipationId).to.equal(campaignParticipationId);
      });

      it('create CampaignAssessmentParticipation with attributes', async () => {
        const expectedResult = {
          ...participant,
          ...participation,
          campaignId,
          campaignParticipationId,
          targetedSkillsCount: 0,
          validatedSkillsCount: 0,
          masteryPercentage: 0,
          progression: 100,
        };

        const campaignAssessmentParticipation = await campaignAssessmentParticipationRepository.getByCampaignIdAndCampaignParticipationId({ campaignId, campaignParticipationId });

        expect(campaignAssessmentParticipation).to.be.instanceOf(CampaignAssessmentParticipation);
        expect(_.omit(campaignAssessmentParticipation, ['campaignAnalysis', 'campaignAssessmentParticipationResult'])).to.deep.equal(expectedResult);
      });
    });

    context('When there is another assessment for the same participation', () => {
      beforeEach(async () => {
        const skill1 = { id: 'skill1', status: 'actif' };
        const skill2 = { id: 'skill2', status: 'actif' };
        mockLearningContent({ skills: [skill1, skill2] });

        campaignId = databaseBuilder.factory.buildAssessmentCampaignForSkills({}, [skill1, skill2]).id;
        const userId = databaseBuilder.factory.buildUser().id;
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          isShared: true,
          sharedAt: new Date('2020-12-12'),
        }).id;
        databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId, createdAt: new Date('2020-10-10'), state: Assessment.states.COMPLETED }).id;
        databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId, createdAt: new Date('2020-11-11'), state: Assessment.states.STARTED }).id;

        databaseBuilder.factory.buildKnowledgeElement({
          userId,
          skillId: skill1.id,
          createdAt: new Date('2020-11-11'),
        });

        await databaseBuilder.commit();
      });

      it('computes progression with last assessment', async () => {
        const campaignAssessmentParticipation = await campaignAssessmentParticipationRepository.getByCampaignIdAndCampaignParticipationId({ campaignId, campaignParticipationId });

        expect(campaignAssessmentParticipation.progression).to.equal(50);
      });
    });

    context('When campaign participation is not shared', () => {
      beforeEach(async () => {
        const skill1 = { id: 'skill1', status: 'actif' };
        mockLearningContent({ skills: [skill1] });
        campaignId = databaseBuilder.factory.buildAssessmentCampaign({}, [skill1]).id;
        campaignParticipationId = databaseBuilder.factory.buildAssessmentFromParticipation({
          isShared: false,
          sharedAt: null,
          campaignId,
        }, {}).campaignParticipationId;

        await databaseBuilder.commit();
      });

      it('create CampaignAssessmentParticipation with empty results', async () => {
        const campaignAssessmentParticipation = await campaignAssessmentParticipationRepository.getByCampaignIdAndCampaignParticipationId({ campaignId, campaignParticipationId });

        expect(campaignAssessmentParticipation.targetedSkillsCount).to.equal(1);
        expect(campaignAssessmentParticipation.validatedSkillsCount).to.equal(undefined);
      });
    });

    context('When campaign participation is shared', () => {

      context('targetedSkillsCount', () => {
        beforeEach(async () => {
          const skill1 = { id: 'skill1', status: 'actif' };
          const skill2 = { id: 'skill2', status: 'actif' };
          mockLearningContent({ skills: [skill1, skill2] });

          campaignId = databaseBuilder.factory.buildAssessmentCampaignForSkills({}, [skill1, skill2]).id;
          campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;
          databaseBuilder.factory.buildAssessment({ campaignParticipationId });

          await databaseBuilder.commit();
        });
        it('should equal 2', async () => {
          const campaignAssessmentParticipation = await campaignAssessmentParticipationRepository.getByCampaignIdAndCampaignParticipationId({ campaignId, campaignParticipationId });

          expect(campaignAssessmentParticipation.targetedSkillsCount).to.equal(2);
        });
      });

      context('validatedSkillsCount', () => {
        beforeEach(async () => {
          const skill1 = { id: 'skill1', status: 'actif' };
          const skill2 = { id: 'skill2', status: 'actif' };
          const skill3 = { id: 'skill3', status: 'actif' };
          mockLearningContent({ skills: [skill1, skill2, skill3] });

          campaignId = databaseBuilder.factory.buildAssessmentCampaignForSkills({}, [skill1, skill2]).id;
          const userId = databaseBuilder.factory.buildUser().id;
          campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
            userId,
            isShared: true,
            sharedAt: new Date('2020-01-02'),
          }).id;

          databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId });

          databaseBuilder.factory.buildKnowledgeElement({
            userId,
            skillId: skill1.id,
            createdAt: new Date('2020-01-01'),
          });
          databaseBuilder.factory.buildKnowledgeElement({
            userId,
            skillId: skill2.id,
            createdAt: new Date('2020-01-03'),
          });
          databaseBuilder.factory.buildKnowledgeElement({
            userId,
            skillId: skill3.id,
            createdAt: new Date('2020-01-01'),
          });

          await databaseBuilder.commit();
        });

        it('computes the number of validated skills', async () => {
          const campaignAssessmentParticipation = await campaignAssessmentParticipationRepository.getByCampaignIdAndCampaignParticipationId({ campaignId, campaignParticipationId });

          expect(campaignAssessmentParticipation.validatedSkillsCount).to.equal(1);
        });
      });

      context('masteryPercentage', () => {
        beforeEach(async () => {
          const skill1 = { id: 'skill1', status: 'actif' };
          const skill2 = { id: 'skill2', status: 'actif' };
          mockLearningContent({ skills: [skill1, skill2] });

          campaignId = databaseBuilder.factory.buildAssessmentCampaignForSkills({}, [skill1, skill2]).id;
          const userId = databaseBuilder.factory.buildUser().id;
          campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
            userId,
            isShared: true,
            sharedAt: new Date('2020-01-02'),
          }).id;

          databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId });

          databaseBuilder.factory.buildKnowledgeElement({
            userId,
            skillId: skill1.id,
            createdAt: new Date('2020-01-01'),
          });
          databaseBuilder.factory.buildKnowledgeElement({
            userId,
            skillId: skill2.id,
            createdAt: new Date('2020-01-03'),
          });

          await databaseBuilder.commit();
        });

        it('computes the mastery percentage', async () => {
          const campaignAssessmentParticipation = await campaignAssessmentParticipationRepository.getByCampaignIdAndCampaignParticipationId({ campaignId, campaignParticipationId });

          expect(campaignAssessmentParticipation.masteryPercentage).to.equal(50);
        });
      });

      context('progression', () => {
        let userId;
        beforeEach(async () => {
          const skill1 = { id: 'skill1', status: 'actif' };
          const skill2 = { id: 'skill2', status: 'actif' };
          const skill3 = { id: 'skill3', status: 'actif' };
          mockLearningContent({ skills: [skill1, skill2, skill3] });

          campaignId = databaseBuilder.factory.buildAssessmentCampaignForSkills({}, [skill1, skill3]).id;
          userId = databaseBuilder.factory.buildUser().id;
          campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
            userId,
            isShared: false,
            sharedAt: null,
          }).id;

          databaseBuilder.factory.buildKnowledgeElement({
            status: KnowledgeElement.StatusType.VALIDATED,
            userId,
            skillId: skill1.id,
            createdAt: new Date('2020-01-01'),
          });
          databaseBuilder.factory.buildKnowledgeElement({
            status: KnowledgeElement.StatusType.INVALIDATED,
            userId,
            skillId: skill2.id,
            createdAt: new Date('2020-01-01'),
          });
          await databaseBuilder.commit();
        });

        it('computes the progression when assessment is completed', async () => {
          databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId, state: Assessment.states.COMPLETED });
          await databaseBuilder.commit();

          const campaignAssessmentParticipation = await campaignAssessmentParticipationRepository.getByCampaignIdAndCampaignParticipationId({ campaignId, campaignParticipationId });

          expect(campaignAssessmentParticipation.progression).to.equal(100);
        });

        it('computes the progression when assessment is started', async () => {
          databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId, state: Assessment.states.STARTED });
          await databaseBuilder.commit();

          const campaignAssessmentParticipation = await campaignAssessmentParticipationRepository.getByCampaignIdAndCampaignParticipationId({ campaignId, campaignParticipationId });

          expect(campaignAssessmentParticipation.progression).to.equal(50);
        });
      });
    });

    context('when there are several schooling-registrations for the same participant', () => {
      beforeEach(async () => {
        const skill = { id: 'skill', status: 'actif' };
        mockLearningContent({ skills: [skill] });
        const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        campaignId = databaseBuilder.factory.buildAssessmentCampaignForSkills({ organizationId }, [skill]).id;
        const userId = databaseBuilder.factory.buildUser().id;

        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          isShared: true,
          sharedAt: new Date('2020-12-12'),
        }).id;

        databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId, createdAt: new Date('2020-10-10'), state: Assessment.states.COMPLETED });
        databaseBuilder.factory.buildSchoolingRegistration({ organizationId, userId, firstName: 'John', lastName: 'Doe' });
        databaseBuilder.factory.buildSchoolingRegistration({ organizationId: otherOrganizationId, userId, firstName: 'Jane', lastName: 'Doe' });

        await databaseBuilder.commit();
      });

      it('return the first name and the last name of the correct schooling-registration', async () => {
        const campaignAssessmentParticipation = await campaignAssessmentParticipationRepository.getByCampaignIdAndCampaignParticipationId({ campaignId, campaignParticipationId });

        expect(campaignAssessmentParticipation.firstName).to.equal('John');
        expect(campaignAssessmentParticipation.lastName).to.equal('Doe');
      });
    });
  });
});
