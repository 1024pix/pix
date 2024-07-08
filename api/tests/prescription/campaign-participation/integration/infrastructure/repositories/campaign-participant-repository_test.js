import pick from 'lodash/pick.js';

import { knex } from '../../../../../../db/knex-database-connection.js';
import {
  AlreadyExistingCampaignParticipationError,
  OrganizationLearnersCouldNotBeSavedError,
} from '../../../../../../lib/domain/errors.js';
import { DomainTransaction } from '../../../../../../lib/infrastructure/DomainTransaction.js';
import { CampaignParticipant } from '../../../../../../src/prescription/campaign-participation/domain/models/CampaignParticipant.js';
import { CampaignToStartParticipation } from '../../../../../../src/prescription/campaign-participation/domain/models/CampaignToStartParticipation.js';
import * as campaignParticipantRepository from '../../../../../../src/prescription/campaign-participation/infrastructure/repositories/campaign-participant-repository.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, databaseBuilder, expect, mockLearningContent, sinon } from '../../../../../test-helper.js';

const campaignParticipationDBAttributes = [
  'id',
  'campaignId',
  'userId',
  'status',
  'organizationLearnerId',
  'participantExternalId',
];

const assessmentAttributes = ['userId', 'method', 'state', 'type', 'courseId', 'isImproving'];

describe('Integration | Infrastructure | Repository | CampaignParticipant', function () {
  describe('get', function () {
    let organizationId, organizationFeatureAPI;

    beforeEach(function () {
      organizationId = 12;
      const learningContent = { skills: [{ id: 'skill1', status: 'actif' }] };

      organizationFeatureAPI = {
        getAllFeaturesFromOrganization: sinon.stub().resolves({ hasLearnersImportFeature: false }),
      };

      mockLearningContent(learningContent);
    });

    it('set the userId', async function () {
      const campaign = buildCampaignWithSkills({});
      const { id: userId } = databaseBuilder.factory.buildUser();

      await databaseBuilder.commit();

      const campaignParticipant = await DomainTransaction.execute(async (domainTransaction) => {
        return campaignParticipantRepository.get({
          userId,
          campaignId: campaign.id,
          domainTransaction,
          organizationFeatureAPI,
        });
      });

      expect(campaignParticipant.userIdentity.id).to.equal(userId);
    });

    context('when there is a previous campaign participation', function () {
      it('find the most recent campaign participation', async function () {
        const campaignToStartParticipation = buildCampaignWithSkills({
          organizationId,
          multipleSendings: true,
          idPixLabel: 'externalId',
        });
        const { id: userId } = databaseBuilder.factory.buildUser();

        databaseBuilder.factory.buildCampaignParticipation({ userId });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaignToStartParticipation.id });
        databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId: campaignToStartParticipation.id,
          isImproved: true,
        });

        const sharedAt = new Date('2020-01-01');
        const expectedAttributes = {
          id: 10,
          participantExternalId: 'something',
          validatedSkillsCount: 1,
          status: 'SHARED',
          isDeleted: true,
          isTargetProfileResetAllowed: false,
          isCampaignMultipleSendings: true,
          isOrganizationLearnerActive: true,
          sharedAt,
        };
        databaseBuilder.factory.buildCampaignParticipation({
          id: 10,
          participantExternalId: 'something',
          validatedSkillsCount: 1,
          status: 'SHARED',
          deletedAt: new Date(),
          userId,
          campaignId: campaignToStartParticipation.id,
          sharedAt,
        });

        await databaseBuilder.commit();

        const campaignParticipant = await DomainTransaction.execute(async (domainTransaction) => {
          return campaignParticipantRepository.get({
            userId,
            campaignId: campaignToStartParticipation.id,
            domainTransaction,
            organizationFeatureAPI,
          });
        });

        expect(campaignParticipant.previousCampaignParticipationForUser).to.deep.equal(expectedAttributes);
      });
    });

    context('when there is no previous campaign participation', function () {
      it('return null', async function () {
        const campaignToStartParticipation = buildCampaignWithSkills({
          organizationId,
          idPixLabel: 'externalId',
        });
        const { id: userId } = databaseBuilder.factory.buildUser();

        await databaseBuilder.commit();

        const campaignParticipant = await DomainTransaction.execute(async (domainTransaction) => {
          return campaignParticipantRepository.get({
            userId,
            campaignId: campaignToStartParticipation.id,
            domainTransaction,
            organizationFeatureAPI,
          });
        });

        expect(campaignParticipant.previousCampaignParticipationForUser).to.be.null;
      });
    });

    context('when there is a deleted organization learner', function () {
      it('find the organization learner', async function () {
        const campaignToStartParticipation = buildCampaignWithSkills({ organizationId });
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({
          organizationId,
        });
        const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({
          userId,
          organizationId,
          deletedAt: new Date(),
        });
        databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId,
          campaignId,
          deletedAt: new Date(),
        });

        await databaseBuilder.commit();

        const campaignParticipant = await DomainTransaction.execute(async (domainTransaction) => {
          return campaignParticipantRepository.get({
            userId,
            campaignId: campaignToStartParticipation.id,
            domainTransaction,
            organizationFeatureAPI,
          });
        });

        expect(campaignParticipant.organizationLearnerId).to.equal(null);
      });
    });

    context('when there is one organization learner', function () {
      it('find the organization learner', async function () {
        const campaignToStartParticipation = buildCampaignWithSkills({ organizationId });
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({
          userId,
          organizationId,
          isDisabled: false,
        });

        await databaseBuilder.commit();

        const campaignParticipant = await DomainTransaction.execute(async (domainTransaction) => {
          return campaignParticipantRepository.get({
            userId,
            campaignId: campaignToStartParticipation.id,
            domainTransaction,
            organizationFeatureAPI,
          });
        });

        expect(campaignParticipant.organizationLearnerId).to.equal(organizationLearnerId);
        expect(campaignParticipant.isOrganizationLearnerDisabled).to.be.false;
        expect(campaignParticipant.hasOrganizationLearnerParticipatedForAnotherUser).to.equal(false);
      });

      it('find only organization learner which is not disabled', async function () {
        const campaignToStartParticipation = buildCampaignWithSkills({ organizationId });
        const { id: userId } = databaseBuilder.factory.buildUser();
        databaseBuilder.factory.buildOrganizationLearner({
          userId,
          organizationId,
          isDisabled: true,
        });

        await databaseBuilder.commit();

        const campaignParticipant = await DomainTransaction.execute(async (domainTransaction) => {
          return campaignParticipantRepository.get({
            userId,
            campaignId: campaignToStartParticipation.id,
            domainTransaction,
            organizationFeatureAPI,
          });
        });

        expect(campaignParticipant.organizationLearnerId).to.equal(null);
      });

      context('when the organization learner has already participated', function () {
        context('when the participation associated to the same user', function () {
          it('returns false for organizationLearnerHasParticipatedForAnotherUser', async function () {
            const campaignToStartParticipation = buildCampaignWithSkills({
              organizationId,
            });
            const { id: userId } = databaseBuilder.factory.buildUser();
            const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({
              userId,
              organizationId,
            });
            databaseBuilder.factory.buildCampaignParticipation({
              organizationLearnerId,
              campaignId: campaignToStartParticipation.id,
              organizationId,
              userId,
            });

            await databaseBuilder.commit();

            const campaignParticipant = await DomainTransaction.execute(async (domainTransaction) => {
              return campaignParticipantRepository.get({
                userId,
                campaignId: campaignToStartParticipation.id,
                domainTransaction,
                organizationFeatureAPI,
              });
            });

            expect(campaignParticipant.organizationLearnerId).to.equal(organizationLearnerId);
            expect(campaignParticipant.hasOrganizationLearnerParticipatedForAnotherUser).to.equal(false);
          });

          context('when there is participation for another campaign', function () {
            it('returns organization learner id', async function () {
              const campaignToStartParticipation = buildCampaignWithSkills({ organizationId });
              const { id: userId } = databaseBuilder.factory.buildUser();
              const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({
                userId,
                organizationId,
              });
              databaseBuilder.factory.buildCampaignParticipation({
                organizationLearnerId,
                organizationId,
              });

              await databaseBuilder.commit();

              const campaignParticipant = await DomainTransaction.execute(async (domainTransaction) => {
                return campaignParticipantRepository.get({
                  userId,
                  campaignId: campaignToStartParticipation.id,
                  domainTransaction,
                  organizationFeatureAPI,
                });
              });

              expect(campaignParticipant.organizationLearnerId).to.equal(organizationLearnerId);
              expect(campaignParticipant.hasOrganizationLearnerParticipatedForAnotherUser).to.equal(false);
            });
          });
        });

        context('when the participation associated to another user', function () {
          it('takes into account the participation', async function () {
            const campaignToStartParticipation = buildCampaignWithSkills({ organizationId });
            const { id: userId } = databaseBuilder.factory.buildUser();
            const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({
              userId,
              organizationId,
            });
            databaseBuilder.factory.buildCampaignParticipation({
              organizationLearnerId,
              campaignId: campaignToStartParticipation.id,
              organizationId,
            });

            await databaseBuilder.commit();

            const campaignParticipant = await DomainTransaction.execute(async (domainTransaction) => {
              return campaignParticipantRepository.get({
                userId,
                campaignId: campaignToStartParticipation.id,
                domainTransaction,
                organizationFeatureAPI,
              });
            });

            expect(campaignParticipant.organizationLearnerId).to.equal(organizationLearnerId);
            expect(campaignParticipant.hasOrganizationLearnerParticipatedForAnotherUser).to.equal(true);
          });

          context('when the participation is deleted', function () {
            it('does not take into account the participation', async function () {
              const campaignToStartParticipation = buildCampaignWithSkills({ organizationId });
              const { id: userId } = databaseBuilder.factory.buildUser();
              const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({
                userId,
                organizationId,
              });
              databaseBuilder.factory.buildCampaignParticipation({
                organizationLearnerId,
                campaignId: campaignToStartParticipation.id,
                organizationId,
                deletedAt: new Date('2020-01-01'),
                deletedBy: userId,
              });

              await databaseBuilder.commit();

              const campaignParticipant = await DomainTransaction.execute(async (domainTransaction) => {
                return campaignParticipantRepository.get({
                  userId,
                  campaignId: campaignToStartParticipation.id,
                  domainTransaction,
                  organizationFeatureAPI,
                });
              });

              expect(campaignParticipant.organizationLearnerId).to.equal(organizationLearnerId);
              expect(campaignParticipant.hasOrganizationLearnerParticipatedForAnotherUser).to.equal(false);
            });

            context('when there are several previous participations', function () {
              it('does not take into account participations', async function () {
                const campaignToStartParticipation = buildCampaignWithSkills({
                  multipleSendings: true,
                  organizationId,
                });
                const { id: userId } = databaseBuilder.factory.buildUser();
                const { id: otherUser } = databaseBuilder.factory.buildUser();
                const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({
                  userId,
                  organizationId,
                });
                databaseBuilder.factory.buildCampaignParticipation({
                  organizationLearnerId,
                  campaignId: campaignToStartParticipation.id,
                  organizationId,
                  userId: otherUser,
                  isImproved: true,
                  deletedBy: otherUser,
                });
                databaseBuilder.factory.buildCampaignParticipation({
                  organizationLearnerId,
                  campaignId: campaignToStartParticipation.id,
                  organizationId,
                  userId: otherUser,
                  deletedAt: new Date('2020-01-01'),
                  deletedBy: otherUser,
                });

                await databaseBuilder.commit();

                const campaignParticipant = await DomainTransaction.execute(async (domainTransaction) => {
                  return campaignParticipantRepository.get({
                    userId,
                    campaignId: campaignToStartParticipation.id,
                    domainTransaction,
                    organizationFeatureAPI,
                  });
                });

                expect(campaignParticipant.organizationLearnerId).to.equal(organizationLearnerId);
                expect(campaignParticipant.hasOrganizationLearnerParticipatedForAnotherUser).to.equal(false);
              });
            });
          });
        });
      });
    });

    context('when there are several organization learners', function () {
      context('when there are several organization Learners for the same user', function () {
        it('find the organizationLearnerId for the correct organization', async function () {
          const campaignToStartParticipation = buildCampaignWithSkills({ organizationId });
          const { id: userId } = databaseBuilder.factory.buildUser();
          databaseBuilder.factory.buildOrganizationLearner({
            userId,
          });
          const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({
            userId,
            organizationId,
          });

          await databaseBuilder.commit();

          const campaignParticipant = await DomainTransaction.execute(async (domainTransaction) => {
            return campaignParticipantRepository.get({
              userId,
              campaignId: campaignToStartParticipation.id,
              domainTransaction,
              organizationFeatureAPI,
            });
          });

          expect(campaignParticipant.organizationLearnerId).to.equal(organizationLearnerId);
        });
      });

      context('when there are several organization learners for the same organization', function () {
        it('find the organizationLearnerId for the correct user', async function () {
          const campaignToStartParticipation = buildCampaignWithSkills({ organizationId });
          const { id: userId } = databaseBuilder.factory.buildUser();
          databaseBuilder.factory.buildOrganizationLearner({
            organizationId,
          });
          const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({
            userId,
            organizationId,
          });

          await databaseBuilder.commit();

          const campaignParticipant = await DomainTransaction.execute(async (domainTransaction) => {
            return campaignParticipantRepository.get({
              userId,
              campaignId: campaignToStartParticipation.id,
              domainTransaction,
              organizationFeatureAPI,
            });
          });

          expect(campaignParticipant.organizationLearnerId).to.equal(organizationLearnerId);
        });
      });
    });

    context('when there is one campaign', function () {
      it('find campaign with operative skills', async function () {
        const learningContent = {
          skills: [
            { id: 'skill1', status: 'actif' },
            { id: 'skill2', status: 'archivé' },
            { id: 'skill3', status: 'inactif' },
          ],
        };

        mockLearningContent(learningContent);
        const campaignToStartParticipation = buildCampaignWithSkills(
          {
            idPixLabel: 'email',
            type: 'ASSESSMENT',
            isManagingStudents: true,
            deletedAt: new Date('2023-01-01'),
            archivedAt: new Date('2022-01-01'),
            assessmentMethod: 'SMART_RANDOM',
            skillCount: 1,
          },
          ['skill1'],
        );
        const { id: userId } = databaseBuilder.factory.buildUser();

        await databaseBuilder.commit();

        const campaignParticipant = await DomainTransaction.execute(async (domainTransaction) => {
          return campaignParticipantRepository.get({
            userId,
            campaignId: campaignToStartParticipation.id,
            domainTransaction,
            organizationFeatureAPI,
          });
        });

        expect(campaignParticipant.campaignToStartParticipation).to.deep.equal(campaignToStartParticipation);
      });
    });

    context('when there are several campaigns', function () {
      it('find skills for the correct campaign', async function () {
        const learningContent = {
          skills: [
            { id: 'skill1', status: 'actif' },
            { id: 'skill2', status: 'actif' },
          ],
        };

        mockLearningContent(learningContent);

        const campaignToStartParticipation = buildCampaignWithSkills(
          {
            idPixLabel: 'email',
            type: 'ASSESSMENT',
            isManagingStudents: false,
            archivedAt: new Date('2022-01-01'),
            deletedAt: null,
            assessmentMethod: 'SMART_RANDOM',
            skillCount: 1,
          },
          ['skill1'],
        );
        buildCampaignWithSkills(
          {
            idPixLabel: 'id',
            type: 'ASSESSMENT',
            isManagingStudents: true,
            archivedAt: new Date('2022-01-02'),
            assessmentMethod: 'SMART_RANDOM',
            skillCount: 1,
          },
          ['skill2'],
        );
        const { id: userId } = databaseBuilder.factory.buildUser();

        await databaseBuilder.commit();

        const campaignParticipant = await DomainTransaction.execute(async (domainTransaction) => {
          return campaignParticipantRepository.get({
            userId,
            campaignId: campaignToStartParticipation.id,
            domainTransaction,
            organizationFeatureAPI,
          });
        });

        expect(campaignParticipant.campaignToStartParticipation).to.deep.equal(campaignToStartParticipation);
      });
    });

    context('isRestrictedAccess', function () {
      let userId;
      beforeEach(async function () {
        userId = databaseBuilder.factory.buildUser().id;

        await databaseBuilder.commit();
      });

      it('should return restricted access on organization with import feature', async function () {
        const campaign = buildCampaignWithSkills({ isManagingStudents: false });
        organizationFeatureAPI.getAllFeaturesFromOrganization
          .withArgs(campaign.organizationId)
          .resolves({ hasLearnersImportFeature: true });

        await databaseBuilder.commit();

        const campaignParticipant = await DomainTransaction.execute(async (domainTransaction) => {
          return campaignParticipantRepository.get({
            userId,
            campaignId: campaign.id,
            domainTransaction,
            organizationFeatureAPI,
          });
        });

        expect(campaignParticipant.campaignToStartParticipation.isRestricted).to.be.true;
      });

      it('should return restricted access on organization managing students', async function () {
        const campaign = buildCampaignWithSkills({ isManagingStudents: true });

        await databaseBuilder.commit();

        const campaignParticipant = await DomainTransaction.execute(async (domainTransaction) => {
          return campaignParticipantRepository.get({
            userId,
            campaignId: campaign.id,
            domainTransaction,
            organizationFeatureAPI,
          });
        });

        expect(campaignParticipant.campaignToStartParticipation.isRestricted).to.be.true;
      });

      it('should return authorize access on basic organization', async function () {
        const campaign = buildCampaignWithSkills({ isManagingStudents: false });

        await databaseBuilder.commit();

        const campaignParticipant = await DomainTransaction.execute(async (domainTransaction) => {
          return campaignParticipantRepository.get({
            userId,
            campaignId: campaign.id,
            domainTransaction,
            organizationFeatureAPI,
          });
        });

        expect(campaignParticipant.campaignToStartParticipation.isRestricted).to.be.false;
      });
    });

    it('throws an error when the campaign does not exist', async function () {
      const { id: userId } = databaseBuilder.factory.buildUser();

      await databaseBuilder.commit();

      const error = await catchErr(() => {
        return DomainTransaction.execute(async (domainTransaction) => {
          await campaignParticipantRepository.get({
            userId,
            campaignId: 12,
            domainTransaction,
            organizationFeatureAPI,
          });
        });
      })();

      expect(error).to.be.an.instanceof(NotFoundError);
      expect(error.message).to.equal("La campagne d'id 12 n'existe pas ou son accès est restreint");
    });
  });

  describe('save', function () {
    let userIdentity;

    beforeEach(async function () {
      const user = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();
      userIdentity = { id: user.id, firstName: user.firstName, lastName: user.lastName };
    });

    it('returns campaign participation id', async function () {
      const campaignParticipant = await makeCampaignParticipant({
        campaignAttributes: { idPixLabel: null },
        userIdentity,
        participantExternalId: null,
        isManagingStudents: false,
      });

      const id = await DomainTransaction.execute(async (domainTransaction) => {
        return campaignParticipantRepository.save({ campaignParticipant, domainTransaction });
      });

      const [campaignParticipationId] = await knex('campaign-participations').pluck('id');

      expect(id).to.equal(campaignParticipationId);
    });

    context('when user is disabled and the orga isManagingStudent is set to false', function () {
      let learnerDisabled, otherLearnerDisabled, campaignParticipant;
      beforeEach(async function () {
        const orga = databaseBuilder.factory.buildOrganization({
          isManagingStudents: false,
        });
        learnerDisabled = databaseBuilder.factory.buildOrganizationLearner({
          userId: userIdentity.id,
          isDisabled: true,
          organizationId: orga.id,
        });

        otherLearnerDisabled = databaseBuilder.factory.buildOrganizationLearner({
          isDisabled: true,
          organizationId: orga.id,
        });

        await databaseBuilder.commit();

        campaignParticipant = await makeCampaignParticipant({
          campaignAttributes: { organizationId: orga.id, idPixLabel: null },
          userIdentity,
          participantExternalId: 'null',
          isManagingStudents: orga.isManagingStudents,
        });
      });

      it('creates a campaign participation', async function () {
        // when
        await DomainTransaction.execute(async (domainTransaction) => {
          await campaignParticipantRepository.save({ campaignParticipant, domainTransaction });
        });

        const campaignParticipation = await knex('campaign-participations')
          .select(campaignParticipationDBAttributes)
          .first();

        expect(campaignParticipation).to.deep.equal(
          getExpectedCampaignParticipation(campaignParticipation.id, campaignParticipant),
        );
      });

      it('enabled only the learner assigned to the campaign participant', async function () {
        // when
        await DomainTransaction.execute(async (domainTransaction) => {
          await campaignParticipantRepository.save({ campaignParticipant, domainTransaction });
        });

        const { isDisabled: expectedEnabledLearner } = await knex('organization-learners')
          .select('isDisabled')
          .where('id', learnerDisabled.id)
          .first();

        const { isDisabled: expectedDisabledLearner } = await knex('organization-learners')
          .select('isDisabled')
          .where('id', otherLearnerDisabled.id)
          .first();

        expect(expectedEnabledLearner).to.be.false;
        expect(expectedDisabledLearner).to.be.true;
      });
    });

    context('when the campaign is profile collection', function () {
      it('creates a campaign participation', async function () {
        const campaignParticipant = await makeCampaignParticipant({
          campaignAttributes: { type: 'PROFILES_COLLECTION', idPixLabel: null },
          userIdentity,
          participantExternalId: null,
          isManagingStudents: false,
        });

        await DomainTransaction.execute(async (domainTransaction) => {
          await campaignParticipantRepository.save({ campaignParticipant, domainTransaction });
        });

        const campaignParticipation = await knex('campaign-participations')
          .select(campaignParticipationDBAttributes)
          .first();

        expect(campaignParticipation).to.deep.equal(
          getExpectedCampaignParticipation(campaignParticipation.id, campaignParticipant),
        );
      });

      it('does not create an assessment', async function () {
        const campaignParticipant = await makeCampaignParticipant({
          campaignAttributes: { type: 'PROFILES_COLLECTION', idPixLabel: null },
          userIdentity,
          participantExternalId: null,
          isManagingStudents: false,
        });

        await DomainTransaction.execute(async (domainTransaction) => {
          await campaignParticipantRepository.save({ campaignParticipant, domainTransaction });
        });

        const assessments = await knex('assessments');

        expect(assessments).to.be.empty;
      });
    });

    context('when the campaign is assessment', function () {
      it('create a campaign participation and an assessment', async function () {
        //GIVEN
        const campaignParticipant = await makeCampaignParticipant({
          campaignAttributes: {
            type: 'ASSESSMENT',
            idPixLabel: null,
            method: 'SMART_RANDOM',
          },
          userIdentity,
          participantExternalId: null,
          isManagingStudents: false,
        });

        //WHEN
        await DomainTransaction.execute(async (domainTransaction) => {
          await campaignParticipantRepository.save({ campaignParticipant, domainTransaction });
        });

        //THEN
        const campaignParticipation = await knex('campaign-participations')
          .select(['id', ...campaignParticipationDBAttributes])
          .first();

        const assessment = await knex('assessments')
          .select(['campaignParticipationId', ...assessmentAttributes])
          .first();

        expect(campaignParticipation).to.deep.equal(
          getExpectedCampaignParticipation(campaignParticipation.id, campaignParticipant),
        );
        expect(assessment).to.deep.equal(getExpectedAssessment(campaignParticipation.id, campaignParticipant));
      });
    });

    context('when there is already an organization learner', function () {
      it('create a campaign participation linked to this organization learner', async function () {
        //GIVEN
        const campaign = databaseBuilder.factory.buildCampaign({ idPixLabel: null });
        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
        await databaseBuilder.commit();

        const campaignToStartParticipation = new CampaignToStartParticipation(campaign);
        const campaignParticipant = new CampaignParticipant({
          campaignToStartParticipation,
          organizationLearnerId,
          organizationLearner: {
            id: organizationLearnerId,
            hasParticipated: false,
          },
          userIdentity,
          previousCampaignParticipationForUser: null,
        });

        campaignParticipant.start({ participantExternalId: null });

        //WHEN
        await DomainTransaction.execute(async (domainTransaction) => {
          await campaignParticipantRepository.save({ campaignParticipant, domainTransaction });
        });

        //THEN
        const campaignParticipation = await knex('campaign-participations').select('organizationLearnerId').first();
        expect(campaignParticipation.organizationLearnerId).to.equal(organizationLearnerId);
      });
    });

    context('when there is no organization learner linked', function () {
      it('create a new organization learner', async function () {
        //GIVEN
        userIdentity = databaseBuilder.factory.buildUser({ firstName: 'Valentin', lastName: 'Tamare' });
        const campaign = databaseBuilder.factory.buildCampaign({ idPixLabel: null });
        await databaseBuilder.commit();

        const campaignToStartParticipation = new CampaignToStartParticipation(campaign);
        const campaignParticipant = new CampaignParticipant({
          campaignToStartParticipation,
          organizationLearner: {
            id: null,
            hasParticipated: false,
          },
          userIdentity,
          previousCampaignParticipationForUser: null,
        });

        campaignParticipant.start({ participantExternalId: null });

        //WHEN
        await DomainTransaction.execute(async (domainTransaction) => {
          await campaignParticipantRepository.save({ campaignParticipant, domainTransaction });
        });

        //THEN
        const organizationLearner = await knex('organization-learners')
          .select('firstName', 'lastName', 'userId', 'organizationId')
          .first();

        expect(organizationLearner).to.deep.equal({
          firstName: userIdentity.firstName,
          lastName: userIdentity.lastName,
          organizationId: campaignToStartParticipation.organizationId,
          userId: userIdentity.id,
        });
      });

      it('create a campaign participation linked to the new organization learner', async function () {
        //GIVEN
        const campaign = databaseBuilder.factory.buildCampaign({ idPixLabel: null });
        await databaseBuilder.commit();

        const campaignToStartParticipation = new CampaignToStartParticipation(campaign);
        const campaignParticipant = new CampaignParticipant({
          campaignToStartParticipation,
          organizationLearner: {
            id: null,
            hasParticipated: false,
          },
          userIdentity,
          previousCampaignParticipationForUser: null,
        });

        campaignParticipant.start({ participantExternalId: null });

        //WHEN
        await DomainTransaction.execute(async (domainTransaction) => {
          await campaignParticipantRepository.save({ campaignParticipant, domainTransaction });
        });

        //THEN
        const campaignParticipation = await knex('campaign-participations').select('organizationLearnerId').first();
        const organizationLearner = await knex('organization-learners').select('id').first();
        expect(campaignParticipation.organizationLearnerId).to.equal(organizationLearner.id);
      });
    });

    context('when there is a previous participation', function () {
      it('update the previous participation', async function () {
        //GIVEN
        const campaign = databaseBuilder.factory.buildCampaign({
          multipleSendings: true,
        });
        const { id: previousCampaignParticipationForUserId } = databaseBuilder.factory.buildCampaignParticipation({
          userId: userIdentity.id,
          campaignId: campaign.id,
          isImproved: false,
          status: 'SHARED',
        });

        await databaseBuilder.commit();

        const campaignToStartParticipation = new CampaignToStartParticipation(campaign);
        const campaignParticipant = new CampaignParticipant({
          campaignToStartParticipation,
          userIdentity,
          previousCampaignParticipationForUser: {
            id: previousCampaignParticipationForUserId,
            status: 'SHARED',
            validatedSkillsCount: 0,
          },
          organizationLearner: {
            id: null,
            hasParticipated: false,
          },
        });

        campaignParticipant.start({ participantExternalId: null });

        //WHEN
        await DomainTransaction.execute(async (domainTransaction) => {
          await campaignParticipantRepository.save({ campaignParticipant, domainTransaction });
        });

        //THEN
        const campaignParticipation = await knex('campaign-participations')
          .select('isImproved')
          .where({ id: previousCampaignParticipationForUserId })
          .first();

        expect(campaignParticipation.isImproved).to.deep.equal(true);
      });

      it('does not update participation for other user or campaign', async function () {
        //GIVEN
        const campaign = databaseBuilder.factory.buildCampaign({
          idPixLabel: null,
          multipleSendings: true,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          isImproved: false,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          userId: userIdentity.id,
          isImproved: false,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          isImproved: false,
        });
        const { id: previousCampaignParticipationForUserId } = databaseBuilder.factory.buildCampaignParticipation({
          userId: userIdentity.id,
          campaignId: campaign.id,
          isImproved: false,
        });

        await databaseBuilder.commit();

        const campaignToStartParticipation = new CampaignToStartParticipation(campaign);
        const campaignParticipant = new CampaignParticipant({
          campaignToStartParticipation,
          userIdentity,
          previousCampaignParticipationForUser: {
            id: previousCampaignParticipationForUserId,
            status: 'SHARED',
            validatedSkillsCount: 0,
          },
          organizationLearner: {
            id: null,
            hasParticipated: false,
          },
        });

        campaignParticipant.start({ participantExternalId: null });

        //WHEN
        await DomainTransaction.execute(async (domainTransaction) => {
          await campaignParticipantRepository.save({ campaignParticipant, domainTransaction });
        });

        //THEN
        const campaignParticipations = await knex('campaign-participations').pluck('id').where({ isImproved: true });

        expect(campaignParticipations).to.deep.equal([previousCampaignParticipationForUserId]);
      });
    });

    context('when external id is asked', function () {
      it('save participant external id', async function () {
        const campaignParticipant = await makeCampaignParticipant({
          campaignAttributes: { idPixLabel: 'some external id' },
          userIdentity,
          participantExternalId: 'some participant external id',
          isManagingStudents: false,
        });

        await DomainTransaction.execute(async (domainTransaction) => {
          await campaignParticipantRepository.save({ campaignParticipant, domainTransaction });
        });

        const campaignParticipation = await knex('campaign-participations')
          .select(campaignParticipationDBAttributes)
          .first();

        expect(campaignParticipation).to.deep.equal(
          getExpectedCampaignParticipation(campaignParticipation.id, campaignParticipant),
        );
      });
    });

    context('when there is a deleted organization learner', function () {
      it('should create new participation with new organization learner', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization();

        const { id: deletedOrganizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          deletedAt: new Date(),
        });

        const { id: campaignId } = databaseBuilder.factory.buildCampaign({
          organizationId,
          idPixLabel: null,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId: deletedOrganizationLearnerId,
          deletedAt: new Date(),
          campaignId,
        });

        await databaseBuilder.commit();

        const campaignParticipant = await makeCampaignParticipant({
          campaignAttributes: { idPixLabel: null },
          userIdentity,
          participantExternalId: null,
          isManagingStudents: false,
        });

        const id = await DomainTransaction.execute(async (domainTransaction) => {
          return campaignParticipantRepository.save({ campaignParticipant, domainTransaction });
        });

        const startedParticipation = await knex('campaign-participations').where('id', id).first();

        expect(startedParticipation.organizationLearnerId).not.to.equal(deletedOrganizationLearnerId);
      });
    });

    context('when there is an exception', function () {
      context('when there already is a participation for this campaign', function () {
        it('throws an exception AlreadyExistingCampaignParticipationError', async function () {
          //GIVEN
          const campaign = databaseBuilder.factory.buildCampaign({
            idPixLabel: null,
          });
          databaseBuilder.factory.buildCampaignParticipation({
            userId: userIdentity.id,
            campaignId: campaign.id,
            isImproved: false,
          });

          await databaseBuilder.commit();

          const campaignToStartParticipation = new CampaignToStartParticipation(campaign);
          const campaignParticipant = new CampaignParticipant({
            campaignToStartParticipation,
            userIdentity,
            organizationLearner: {
              id: null,
              hasParticipated: false,
            },
          });

          campaignParticipant.start({ participantExternalId: null });

          //WHEN
          const error = await catchErr(() => {
            return DomainTransaction.execute(async (domainTransaction) => {
              await campaignParticipantRepository.save({ campaignParticipant, domainTransaction });
            });
          })();

          //THEN
          expect(error).to.be.an.instanceof(AlreadyExistingCampaignParticipationError);
          expect(error.message).to.equal(
            `User ${userIdentity.id} has already a campaign participation with campaign ${campaign.id}`,
          );
        });
      });

      context('when there is another error', function () {
        it('throws the original exception', async function () {
          //GIVEN
          const campaign = databaseBuilder.factory.buildCampaign({
            idPixLabel: null,
          });

          await databaseBuilder.commit();

          const campaignToStartParticipation = new CampaignToStartParticipation(campaign);
          const campaignParticipant = new CampaignParticipant({
            campaignToStartParticipation,
            userIdentity: { id: 12, firstName: '', lastName: '' },
            organizationLearner: {
              id: null,
              hasParticipated: false,
            },
          });

          campaignParticipant.start({ participantExternalId: null });

          //WHEN
          const error = await catchErr(() => {
            return DomainTransaction.execute(async (domainTransaction) => {
              await campaignParticipantRepository.save({ campaignParticipant, domainTransaction });
            });
          })();

          //THEN
          expect(error.constraint).to.equal('organization_learners_userid_foreign');
        });
      });

      it('throw one_active_learner', async function () {
        const campaignParticipant = await makeCampaignParticipant({
          campaignAttributes: { idPixLabel: null },
          userIdentity,
          participantExternalId: null,
          isManagingStudents: false,
        });

        const error = await catchErr(() => {
          return DomainTransaction.execute(async (domainTransaction) => {
            await Promise.all([
              campaignParticipantRepository.save({ campaignParticipant, domainTransaction }),
              campaignParticipantRepository.save({ campaignParticipant, domainTransaction }),
            ]);
          });
        })();

        expect(error).to.be.instanceOf(OrganizationLearnersCouldNotBeSavedError);
      });

      it('does not update data', async function () {
        const campaign = databaseBuilder.factory.buildCampaign({
          multipleSendings: true,
          idPixLabel: null,
        });
        const { id: previousCampaignParticipationForUserId } = databaseBuilder.factory.buildCampaignParticipation({
          userId: userIdentity.id,
          campaignId: campaign.id,
          isImproved: false,
        });

        await databaseBuilder.commit();

        const campaignToStartParticipation = new CampaignToStartParticipation({ ...campaign, id: 13 });
        const campaignParticipant = new CampaignParticipant({
          campaignToStartParticipation,
          userIdentity,
          previousCampaignParticipationForUser: {
            id: previousCampaignParticipationForUserId,
            status: 'SHARED',
            validatedSkillsCount: 0,
          },
          organizationLearner: {
            id: null,
            hasParticipated: false,
          },
        });

        campaignParticipant.start({ participantExternalId: null });

        //WHEN
        await catchErr(() => {
          return DomainTransaction.execute(async (domainTransaction) => {
            await campaignParticipantRepository.save({ campaignParticipant, domainTransaction });
          });
        })();

        //THEN
        const campaignParticipations = await knex('campaign-participations').select(['id', 'isImproved']);
        const assessments = await knex('assessments');

        expect(campaignParticipations).to.deep.equal([
          { id: previousCampaignParticipationForUserId, isImproved: false },
        ]);
        expect(assessments).to.be.empty;
      });
    });
  });
});

function buildCampaignWithSkills(attributes, skills = ['skill1']) {
  const { id: organizationId } = databaseBuilder.factory.buildOrganization({
    isManagingStudents: attributes.isManagingStudents,
    id: attributes.organizationId,
  });
  const campaign = databaseBuilder.factory.buildCampaign({
    ...attributes,
    organizationId,
  });
  skills.forEach((skillId) => {
    databaseBuilder.factory.buildCampaignSkill({ skillId, campaignId: campaign.id });
  });

  return new CampaignToStartParticipation({ ...campaign, hasLearnersImportFeature: false, ...attributes });
}

function getExpectedCampaignParticipation(campaignParticipationId, campaignParticipant) {
  return {
    ...pick(campaignParticipant.campaignParticipation, [
      'id',
      'campaignId',
      'userId',
      'status',
      'organizationLearnerId',
      'participantExternalId',
    ]),
    id: campaignParticipationId,
  };
}

function getExpectedAssessment(campaignParticipationId, campaignParticipant) {
  return {
    ...pick(campaignParticipant.assessment, assessmentAttributes),
    campaignParticipationId,
  };
}

async function makeCampaignParticipant({
  campaignAttributes,
  userIdentity,
  organizationLearnerId,
  participantExternalId,
  isRestricted,
}) {
  const campaign = databaseBuilder.factory.buildCampaign(campaignAttributes);

  await databaseBuilder.commit();

  const campaignToStartParticipation = new CampaignToStartParticipation({ ...campaign, isRestricted });
  const organizationLearner = {
    id: organizationLearnerId,
    hasParticipated: false,
  };
  const campaignParticipant = new CampaignParticipant({
    campaignToStartParticipation,
    organizationLearner,
    userIdentity,
    previousCampaignParticipationForUser: null,
  });

  campaignParticipant.start({ participantExternalId });
  return campaignParticipant;
}
