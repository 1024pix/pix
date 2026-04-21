import { CampaignAssessmentParticipation } from '../../../../../../src/prescription/campaign-participation/domain/models/CampaignAssessmentParticipation.js';
import { DetachedAssessment } from '../../../../../../src/prescription/campaign-participation/domain/read-models/DetachedAssessment.js';
import * as campaignAssessmentParticipationRepository from '../../../../../../src/prescription/campaign-participation/infrastructure/repositories/campaign-assessment-participation-repository.js';
import { CampaignParticipationStatuses } from '../../../../../../src/prescription/shared/domain/constants.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

const { STARTED } = CampaignParticipationStatuses;

describe('Integration | Repository | Campaign Assessment Participation', function () {
  describe('#getByCampaignIdAndCampaignParticipationId', function () {
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
        databaseBuilder.factory.learningContent.build({ skills: [skill1, skill2] });
        campaignId = databaseBuilder.factory.buildAssessmentCampaign({}).id;

        const assessment = databaseBuilder.factory.buildAssessmentFromParticipation(
          {
            ...participation,
            campaignId,
          },
          participant,
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

    context('When campaign participation is not shared', function () {
      let campaignParticipation, skill1;

      beforeEach(async function () {
        skill1 = { id: 'skill1', status: 'actif' };
        const skill2 = { id: 'skill2', status: 'actif' };
        databaseBuilder.factory.learningContent.build({ skills: [skill1, skill2] });
        campaignId = databaseBuilder.factory.buildAssessmentCampaign({}, [skill1, skill2]).id;

        campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          status: STARTED,
          sharedAt: null,
          campaignId,
        });
        campaignParticipationId = campaignParticipation.id;
        await databaseBuilder.commit();
      });

      it('create CampaignAssessmentParticipation with empty results', async function () {
        //given
        databaseBuilder.factory.buildAssessment({
          userId: campaignParticipation.userId,
          campaignParticipationId,
          state: Assessment.states.COMPLETED,
        });
        await databaseBuilder.commit();

        const campaignAssessmentParticipation =
          await campaignAssessmentParticipationRepository.getByCampaignIdAndCampaignParticipationId({
            campaignId,
            campaignParticipationId,
          });

        expect(campaignAssessmentParticipation.masteryRate).to.equal(null);
      });
    });

    context('when there are several organization-learners for the same participant', function () {
      let organizationLearnerId;

      beforeEach(async function () {
        const skill = { id: 'skill', status: 'actif' };
        databaseBuilder.factory.learningContent.build({ skills: [skill] });
        const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        campaignId = databaseBuilder.factory.buildAssessmentCampaignForSkills({ organizationId }, [skill]).id;
        const userId = databaseBuilder.factory.buildUser().id;

        organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
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

      it('return the id, first name and the last name of the correct organization-learner', async function () {
        const campaignAssessmentParticipation =
          await campaignAssessmentParticipationRepository.getByCampaignIdAndCampaignParticipationId({
            campaignId,
            campaignParticipationId,
          });

        expect(campaignAssessmentParticipation.organizationLearnerId).to.equal(organizationLearnerId);
        expect(campaignAssessmentParticipation.firstName).to.equal('John');
        expect(campaignAssessmentParticipation.lastName).to.equal('Doe');
      });
    });

    context('When something is wrong with a campaign participations', function () {
      it('throw a NotFoundError when campaign participation does not exist', async function () {
        const skill1 = { id: 'skill1', status: 'actif' };
        databaseBuilder.factory.learningContent.build({ skills: [skill1] });

        campaignId = databaseBuilder.factory.buildAssessmentCampaign({}, [skill1]).id;

        await databaseBuilder.commit();

        const error = await catchErr(
          campaignAssessmentParticipationRepository.getByCampaignIdAndCampaignParticipationId,
        )({ campaignId, campaignParticipationId: 77777 });

        //then
        expect(error).to.be.instanceof(NotFoundError);
      });

      it('throw a NotFoundError when campaign participation is deleted', async function () {
        const skill1 = { id: 'skill1', status: 'actif' };
        databaseBuilder.factory.learningContent.build({ skills: [skill1] });

        campaignId = databaseBuilder.factory.buildAssessmentCampaign({}, [skill1]).id;
        campaignParticipationId = databaseBuilder.factory.buildAssessmentFromParticipation({
          status: STARTED,
          sharedAt: null,
          deletedAt: new Date('2022-01-01'),
          campaignId,
        }).campaignParticipationId;

        await databaseBuilder.commit();

        const error = await catchErr(
          campaignAssessmentParticipationRepository.getByCampaignIdAndCampaignParticipationId,
        )({ campaignId, campaignParticipationId });

        //then
        expect(error).to.be.instanceof(NotFoundError);
      });
    });
  });

  describe('#getDetachedByUserId', function () {
    let userId, assessment, assessment2;

    beforeEach(async function () {
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
      userId = databaseBuilder.factory.buildUser().id;
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ userId, organizationId }).id;
      const participation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        userId,
        organizationLearnerId,
      });
      assessment = databaseBuilder.factory.buildAssessment({
        type: Assessment.types.CAMPAIGN,
        userId,
        campaignParticipationId: null,
        createdAt: new Date('2025-02-23'),
        updatedAt: new Date('2025-02-25'),
      });
      assessment2 = databaseBuilder.factory.buildAssessment({
        type: Assessment.types.CAMPAIGN,
        userId,
        campaignParticipationId: null,
        createdAt: new Date('2025-02-25'),
        updatedAt: new Date('2025-02-27'),
      });
      databaseBuilder.factory.buildAssessment({
        type: Assessment.types.CAMPAIGN,
        userId,
        campaignParticipationId: participation.id,
        createdAt: new Date('2025-02-25'),
        updatedAt: new Date('2025-02-27'),
      });
      await databaseBuilder.commit();
    });

    context('when userId has no assessment', function () {
      it('should return an empty array', async function () {
        const otherUser = databaseBuilder.factory.buildUser();
        await databaseBuilder.commit();

        const result = await campaignAssessmentParticipationRepository.getDetachedByUserId({ userId: otherUser.id });
        expect(result).to.be.empty;
      });
    });

    context('when user has anonymised participation', function () {
      it('should return an array of DetachAssessment', async function () {
        const result = await campaignAssessmentParticipationRepository.getDetachedByUserId({ userId });
        expect(result).lengthOf(2);
        expect(result[0]).instanceOf(DetachedAssessment);
        expect(result[0].id).equal(assessment2.id);
        expect(result[0].updatedAt).deep.equal(assessment2.updatedAt);
        expect(result[0].state).equal(assessment2.state);
        expect(result[1]).instanceOf(DetachedAssessment);
        expect(result[1].id).equal(assessment.id);
        expect(result[1].updatedAt).deep.equal(assessment.updatedAt);
        expect(result[1].state).equal(assessment.state);
      });
    });
  });
});
