import { DomainTransaction } from '../../../../lib/infrastructure/DomainTransaction.js';
import * as campaignParticipantRepository from '../../../../lib/infrastructure/repositories/campaign-participant-repository.js';
import { CampaignToStartParticipation } from '../../../../src/prescription/campaign-participation/domain/models/CampaignToStartParticipation.js';
import { NotFoundError } from '../../../../src/shared/domain/errors.js';
import { catchErr, databaseBuilder, expect, mockLearningContent } from '../../../test-helper.js';

describe('Integration | Infrastructure | Repository | CampaignParticipant', function () {
  describe('get', function () {
    let organizationId;

    beforeEach(function () {
      organizationId = 12;
      const learningContent = { skills: [{ id: 'skill1', status: 'actif' }] };

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
            isRestricted: true,
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
            isRestricted: true,
            archivedAt: new Date('2022-01-01'),
            assessmentMethod: 'SMART_RANDOM',
            skillCount: 1,
          },
          ['skill1'],
        );
        buildCampaignWithSkills(
          {
            idPixLabel: 'id',
            type: 'ASSESSMENT',
            isRestricted: false,
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
          });
        });

        expect(campaignParticipant.campaignToStartParticipation).to.deep.equal(campaignToStartParticipation);
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
          });
        });
      })();

      expect(error).to.be.an.instanceof(NotFoundError);
      expect(error.message).to.equal("La campagne d'id 12 n'existe pas ou son accès est restreint");
    });
  });
});

function buildCampaignWithSkills(attributes, skills = ['skill1']) {
  const { id: organizationId } = databaseBuilder.factory.buildOrganization({
    isManagingStudents: attributes.isRestricted,
    id: attributes.organizationId,
  });
  const campaign = databaseBuilder.factory.buildCampaign({
    ...attributes,
    organizationId,
  });
  skills.forEach((skillId) => {
    databaseBuilder.factory.buildCampaignSkill({ skillId, campaignId: campaign.id });
  });

  return new CampaignToStartParticipation({ ...campaign, ...attributes });
}
