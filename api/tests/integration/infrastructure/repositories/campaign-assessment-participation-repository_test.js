import { expect, databaseBuilder, mockLearningContent, knex, catchErr } from '../../../test-helper';
import Assessment from '../../../../lib/domain/models/Assessment';
import KnowledgeElement from '../../../../lib/domain/models/KnowledgeElement';
import CampaignAssessmentParticipation from '../../../../lib/domain/read-models/CampaignAssessmentParticipation';
import campaignAssessmentParticipationRepository from '../../../../lib/infrastructure/repositories/campaign-assessment-participation-repository';
import CampaignParticipationStatuses from '../../../../lib/domain/models/CampaignParticipationStatuses';
import { NotFoundError } from '../../../../lib/domain/errors';

const { STARTED } = CampaignParticipationStatuses;

describe('Integration | Repository | Campaign Assessment Participation', function () {
  describe('#getByCampaignIdAndCampaignParticipationId', function () {
    afterEach(function () {
      return knex('knowledge-element-snapshots').delete();
    });

    let campaignId, campaignParticipationId, userId;

    context('When there is an assessment for another campaign and another participation', function () {
      const participant = {
        firstName: 'Josette',
        lastName: 'Gregorio',
      };
      const participation = {
        participantExternalId: '123AZ',
        createdAt: new Date('2020-10-10'),
        sharedAt: new Date('2020-12-12'),
        masteryRate: 0.5,
      };
      beforeEach(async function () {
        const skill1 = { id: 'skill1' };
        const skill2 = { id: 'skill2' };
        mockLearningContent({ skills: [skill1, skill2] });
        campaignId = databaseBuilder.factory.buildAssessmentCampaign({}).id;

        const assessment = databaseBuilder.factory.buildAssessmentFromParticipation(
          {
            ...participation,
            campaignId,
          },
          participant
        );
        campaignParticipationId = assessment.campaignParticipationId;
        userId = assessment.userId;

        databaseBuilder.factory.buildAssessmentFromParticipation({ campaignId });

        const otherCampaign = databaseBuilder.factory.buildCampaign();
        databaseBuilder.factory.buildAssessmentFromParticipation({ campaignId: otherCampaign.id });

        await databaseBuilder.commit();
      });

      it('matches the given campaign and given participation', async function () {
        const campaignAssessmentParticipation =
          await campaignAssessmentParticipationRepository.getByCampaignIdAndCampaignParticipationId({
            campaignId,
            campaignParticipationId,
          });

        expect(campaignAssessmentParticipation.campaignId).to.equal(campaignId);
        expect(campaignAssessmentParticipation.campaignParticipationId).to.equal(campaignParticipationId);
      });

      it('create CampaignAssessmentParticipation with attributes', async function () {
        const expectedResult = {
          ...participant,
          ...participation,
          userId,
          campaignId,
          campaignParticipationId,
          masteryRate: 0.5,
          progression: 1,
          badges: [],
        };

        const campaignAssessmentParticipation =
          await campaignAssessmentParticipationRepository.getByCampaignIdAndCampaignParticipationId({
            campaignId,
            campaignParticipationId,
          });

        expect(campaignAssessmentParticipation).to.be.instanceOf(CampaignAssessmentParticipation);
        expect(campaignAssessmentParticipation).to.deep.contains(expectedResult);
      });
    });

    context('When there is another assessment for the same participation', function () {
      beforeEach(async function () {
        const skill1 = { id: 'skill1', status: 'actif' };
        const skill2 = { id: 'skill2', status: 'actif' };
        mockLearningContent({ skills: [skill1, skill2] });

        campaignId = databaseBuilder.factory.buildAssessmentCampaignForSkills({}, [skill1, skill2]).id;
        const userId = databaseBuilder.factory.buildUser().id;
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          sharedAt: new Date('2020-12-12'),
        }).id;
        databaseBuilder.factory.buildAssessment({
          campaignParticipationId,
          userId,
          createdAt: new Date('2020-10-10'),
          state: Assessment.states.COMPLETED,
        });
        databaseBuilder.factory.buildAssessment({
          campaignParticipationId,
          userId,
          createdAt: new Date('2020-11-11'),
          state: Assessment.states.STARTED,
        });

        databaseBuilder.factory.buildKnowledgeElement({
          userId,
          skillId: skill1.id,
          createdAt: new Date('2020-11-11'),
        });

        await databaseBuilder.commit();
      });

      it('computes progression with last assessment', async function () {
        const campaignAssessmentParticipation =
          await campaignAssessmentParticipationRepository.getByCampaignIdAndCampaignParticipationId({
            campaignId,
            campaignParticipationId,
          });

        expect(campaignAssessmentParticipation.progression).to.equal(0.5);
      });
    });

    context('When campaign participation is not shared', function () {
      beforeEach(async function () {
        const skill1 = { id: 'skill1', status: 'actif' };
        mockLearningContent({ skills: [skill1] });
        campaignId = databaseBuilder.factory.buildAssessmentCampaign({}, [skill1]).id;
        campaignParticipationId = databaseBuilder.factory.buildAssessmentFromParticipation({
          status: STARTED,
          sharedAt: null,
          campaignId,
        }).campaignParticipationId;

        await databaseBuilder.commit();
      });

      it('create CampaignAssessmentParticipation with empty results', async function () {
        const campaignAssessmentParticipation =
          await campaignAssessmentParticipationRepository.getByCampaignIdAndCampaignParticipationId({
            campaignId,
            campaignParticipationId,
          });

        expect(campaignAssessmentParticipation.masteryRate).to.equal(null);
        expect(campaignAssessmentParticipation.progression).to.equal(1);
      });
    });

    context('When campaign participation is shared', function () {
      context('progression', function () {
        let userId;
        beforeEach(async function () {
          const skill1 = { id: 'skill1', status: 'actif' };
          const skill2 = { id: 'skill2', status: 'actif' };
          const skill3 = { id: 'skill3', status: 'actif' };
          const skill4 = { id: 'skill4', status: 'périmé' };
          mockLearningContent({ skills: [skill1, skill2, skill3] });

          campaignId = databaseBuilder.factory.buildAssessmentCampaignForSkills({}, [skill1, skill3, skill4]).id;
          userId = databaseBuilder.factory.buildUser().id;
          campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
            userId,
            status: STARTED,
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

        context('when assessment is completed', function () {
          it('returns a progression of 1', async function () {
            databaseBuilder.factory.buildAssessment({
              campaignParticipationId,
              userId,
              state: Assessment.states.COMPLETED,
            });
            await databaseBuilder.commit();

            const campaignAssessmentParticipation =
              await campaignAssessmentParticipationRepository.getByCampaignIdAndCampaignParticipationId({
                campaignId,
                campaignParticipationId,
              });

            expect(campaignAssessmentParticipation.progression).to.equal(1);
          });
        });

        context('when assessment is started', function () {
          it('computes the progression', async function () {
            databaseBuilder.factory.buildAssessment({
              campaignParticipationId,
              userId,
              state: Assessment.states.STARTED,
            });
            await databaseBuilder.commit();

            const campaignAssessmentParticipation =
              await campaignAssessmentParticipationRepository.getByCampaignIdAndCampaignParticipationId({
                campaignId,
                campaignParticipationId,
              });

            expect(campaignAssessmentParticipation.progression).to.equal(0.5);
          });
        });
      });
    });

    context('when there are several organization-learners for the same participant', function () {
      beforeEach(async function () {
        const skill = { id: 'skill', status: 'actif' };
        mockLearningContent({ skills: [skill] });
        const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        campaignId = databaseBuilder.factory.buildAssessmentCampaignForSkills({ organizationId }, [skill]).id;
        const userId = databaseBuilder.factory.buildUser().id;

        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          userId,
          firstName: 'John',
          lastName: 'Doe',
        }).id;
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          organizationLearnerId,
          sharedAt: new Date('2020-12-12'),
        }).id;

        databaseBuilder.factory.buildAssessment({
          campaignParticipationId,
          userId,
          createdAt: new Date('2020-10-10'),
          state: Assessment.states.COMPLETED,
        });

        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: otherOrganizationId,
          userId,
          firstName: 'Jane',
          lastName: 'Doe',
        });

        await databaseBuilder.commit();
      });

      it('return the first name and the last name of the correct organization-learner', async function () {
        const campaignAssessmentParticipation =
          await campaignAssessmentParticipationRepository.getByCampaignIdAndCampaignParticipationId({
            campaignId,
            campaignParticipationId,
          });

        expect(campaignAssessmentParticipation.firstName).to.equal('John');
        expect(campaignAssessmentParticipation.lastName).to.equal('Doe');
      });
    });

    context('When something is wrong with a campaign participations', function () {
      it('throw a NotFoundError when campaign participation does not exist', async function () {
        const skill1 = { id: 'skill1', status: 'actif' };
        mockLearningContent({ skills: [skill1] });

        campaignId = databaseBuilder.factory.buildAssessmentCampaign({}, [skill1]).id;

        await databaseBuilder.commit();

        const error = await catchErr(
          campaignAssessmentParticipationRepository.getByCampaignIdAndCampaignParticipationId
        )({ campaignId, campaignParticipationId: 77777 });

        //then
        expect(error).to.be.instanceof(NotFoundError);
      });

      it('throw a NotFoundError when campaign participation is deleted', async function () {
        const skill1 = { id: 'skill1', status: 'actif' };
        mockLearningContent({ skills: [skill1] });

        campaignId = databaseBuilder.factory.buildAssessmentCampaign({}, [skill1]).id;
        campaignParticipationId = databaseBuilder.factory.buildAssessmentFromParticipation({
          status: STARTED,
          sharedAt: null,
          deletedAt: new Date('2022-01-01'),
          campaignId,
        }).campaignParticipationId;

        await databaseBuilder.commit();

        const error = await catchErr(
          campaignAssessmentParticipationRepository.getByCampaignIdAndCampaignParticipationId
        )({ campaignId, campaignParticipationId });

        //then
        expect(error).to.be.instanceof(NotFoundError);
      });
    });
  });
});
