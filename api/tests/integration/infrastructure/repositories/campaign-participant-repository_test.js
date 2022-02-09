const { expect, databaseBuilder, mockLearningContent, catchErr } = require('../../../test-helper');
const { knex } = require('../../../../db/knex-database-connection');
const campaignParticipantRepository = require('../../../../lib/infrastructure/repositories/campaign-participant-repository');
const CampaignParticipant = require('../../../../lib/domain/models/CampaignParticipant');
const CampaignToStartParticipation = require('../../../../lib/domain/models/CampaignToStartParticipation');
const pick = require('lodash/pick');
const { AlreadyExistingCampaignParticipationError, NotFoundError } = require('../../../../lib/domain/errors');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');

const campaignParticipationAttributes = [
  'id',
  'campaignId',
  'userId',
  'status',
  'schoolingRegistrationId',
  'participantExternalId',
];
const assessmentAttributes = ['userId', 'method', 'state', 'type', 'courseId', 'isImproving'];

describe('Integration | Infrastructure | Repository | CampaignParticipant', function () {
  describe('save', function () {
    let userIdentity;

    beforeEach(async function () {
      const user = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();
      userIdentity = { id: user.id, firstName: user.firstName, lastName: user.lastName };
    });

    afterEach(async function () {
      await knex('assessments').delete();
      await knex('campaign-participations').delete();
    });

    it('returns campaign participation id', async function () {
      const campaignParticipant = await makeCampaignParticipant({
        campaignAttributes: { idPixLabel: null },
        userIdentity,
        participantExternalId: null,
      });

      const id = await DomainTransaction.execute(async (domainTransaction) => {
        return campaignParticipantRepository.save(campaignParticipant, domainTransaction);
      });

      const [campaignParticipationId] = await knex('campaign-participations').pluck('id');

      expect(id).to.equal(campaignParticipationId);
    });

    context('when the campaign is profile collection', function () {
      it('create a campaign participation', async function () {
        const campaignParticipant = await makeCampaignParticipant({
          campaignAttributes: { type: 'PROFILES_COLLECTION', idPixLabel: null },
          userIdentity,
          participantExternalId: null,
        });

        await DomainTransaction.execute(async (domainTransaction) => {
          await campaignParticipantRepository.save(campaignParticipant, domainTransaction);
        });

        const campaignParticipation = await knex('campaign-participations')
          .select(campaignParticipationAttributes)
          .first();

        expect(campaignParticipation).to.deep.equal(
          getExpectedCampaignParticipation(campaignParticipation.id, campaignParticipant)
        );
      });

      it('does not create an assessment', async function () {
        const campaignParticipant = await makeCampaignParticipant({
          campaignAttributes: { type: 'PROFILES_COLLECTION', idPixLabel: null },
          userIdentity,
          participantExternalId: null,
        });

        await DomainTransaction.execute(async (domainTransaction) => {
          await campaignParticipantRepository.save(campaignParticipant, domainTransaction);
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
        });

        //WHEN
        await DomainTransaction.execute(async (domainTransaction) => {
          await campaignParticipantRepository.save(campaignParticipant, domainTransaction);
        });

        //THEN
        const campaignParticipation = await knex('campaign-participations')
          .select(['id', ...campaignParticipationAttributes])
          .first();

        const assessment = await knex('assessments')
          .select(['campaignParticipationId', ...assessmentAttributes])
          .first();

        expect(campaignParticipation).to.deep.equal(
          getExpectedCampaignParticipation(campaignParticipation.id, campaignParticipant)
        );
        expect(assessment).to.deep.equal(getExpectedAssessment(campaignParticipation.id, campaignParticipant));
      });
    });

    context('when there is a previous participation', function () {
      it('update the previous participation', async function () {
        //GIVEN
        const campaign = databaseBuilder.factory.buildCampaign({
          multipleSendings: true,
        });
        const { id: previousCampaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
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
          previousCampaignParticipation: {
            id: previousCampaignParticipationId,
            status: 'SHARED',
            validatedSkillsCount: 0,
          },
        });

        campaignParticipant.start({ participantExternalId: null });

        //WHEN
        await DomainTransaction.execute(async (domainTransaction) => {
          await campaignParticipantRepository.save(campaignParticipant, domainTransaction);
        });

        //THEN
        const campaignParticipation = await knex('campaign-participations')
          .select('isImproved')
          .where({ id: previousCampaignParticipationId })
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
        const { id: previousCampaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
          userId: userIdentity.id,
          campaignId: campaign.id,
          isImproved: false,
        });

        await databaseBuilder.commit();

        const campaignToStartParticipation = new CampaignToStartParticipation(campaign);
        const campaignParticipant = new CampaignParticipant({
          campaignToStartParticipation,
          userIdentity,
          previousCampaignParticipation: {
            id: previousCampaignParticipationId,
            status: 'SHARED',
            validatedSkillsCount: 0,
          },
        });

        campaignParticipant.start({ participantExternalId: null });

        //WHEN
        await DomainTransaction.execute(async (domainTransaction) => {
          await campaignParticipantRepository.save(campaignParticipant, domainTransaction);
        });

        //THEN
        const campaignParticipations = await knex('campaign-participations').pluck('id').where({ isImproved: true });

        expect(campaignParticipations).to.deep.equal([previousCampaignParticipationId]);
      });
    });

    context('when external id is asked', function () {
      it('save participant external id', async function () {
        const campaignParticipant = await makeCampaignParticipant({
          campaignAttributes: { idPixLabel: 'some external id' },
          userIdentity,
          participantExternalId: 'some participant external id',
        });

        await DomainTransaction.execute(async (domainTransaction) => {
          await campaignParticipantRepository.save(campaignParticipant, domainTransaction);
        });

        const campaignParticipation = await knex('campaign-participations')
          .select(campaignParticipationAttributes)
          .first();

        expect(campaignParticipation).to.deep.equal(
          getExpectedCampaignParticipation(campaignParticipation.id, campaignParticipant)
        );
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
          });

          campaignParticipant.start({ participantExternalId: null });

          //WHEN
          const error = await catchErr(() => {
            return DomainTransaction.execute(async (domainTransaction) => {
              await campaignParticipantRepository.save(campaignParticipant, domainTransaction);
            });
          })();

          //THEN
          expect(error).to.be.an.instanceof(AlreadyExistingCampaignParticipationError);
          expect(error.message).to.equal(
            `User ${userIdentity.id} has already a campaign participation with campaign ${campaign.id}`
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
            userIdentity: { id: 12 },
          });

          campaignParticipant.start({ participantExternalId: null });

          //WHEN
          const error = await catchErr(() => {
            return DomainTransaction.execute(async (domainTransaction) => {
              await campaignParticipantRepository.save(campaignParticipant, domainTransaction);
            });
          })();

          //THEN
          expect(error.constraint).to.equal('campaign_participations_userid_foreign');
        });
      });

      it('does not update data', async function () {
        const campaign = databaseBuilder.factory.buildCampaign({
          multipleSendings: true,
          idPixLabel: null,
        });
        const { id: previousCampaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
          userId: userIdentity.id,
          campaignId: campaign.id,
          isImproved: false,
        });

        await databaseBuilder.commit();

        const campaignToStartParticipation = new CampaignToStartParticipation({ ...campaign, id: 13 });
        const campaignParticipant = new CampaignParticipant({
          campaignToStartParticipation,
          userIdentity,
          previousCampaignParticipation: {
            id: previousCampaignParticipationId,
            status: 'SHARED',
            validatedSkillsCount: 0,
          },
        });

        campaignParticipant.start({ participantExternalId: null });

        //WHEN
        await catchErr(() => {
          return DomainTransaction.execute(async (domainTransaction) => {
            await campaignParticipantRepository.save(campaignParticipant, domainTransaction);
          });
        })();

        //THEN
        const campaignParticipations = await knex('campaign-participations').select(['id', 'isImproved']);
        const assessments = await knex('assessments');

        expect(campaignParticipations).to.deep.equal([{ id: previousCampaignParticipationId, isImproved: false }]);
        expect(assessments).to.be.empty;
      });
    });
  });

  describe('get', function () {
    let organizationId;
    beforeEach(function () {
      organizationId = 12;
      const learningContent = { skills: [{ id: 'skill1', status: 'actif' }] };

      mockLearningContent(learningContent);
    });
    it('set the userId', async function () {
      const campaign = buildCampaignWithCompleteTargetProfile({});
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
        const campaignToStartParticipation = buildCampaignWithCompleteTargetProfile({
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
        const expectedAttributes = {
          id: 10,
          participantExternalId: 'something',
          validatedSkillsCount: 1,
          status: 'SHARED',
        };
        databaseBuilder.factory.buildCampaignParticipation({
          ...expectedAttributes,
          userId,
          campaignId: campaignToStartParticipation.id,
        });

        await databaseBuilder.commit();

        const campaignParticipant = await DomainTransaction.execute(async (domainTransaction) => {
          return campaignParticipantRepository.get({
            userId,
            campaignId: campaignToStartParticipation.id,
            domainTransaction,
          });
        });

        expect(campaignParticipant.previousCampaignParticipation).to.deep.equal(expectedAttributes);
      });
    });

    context('when there is one schooling registration', function () {
      it('find the schoolingRegistrationId', async function () {
        const campaignToStartParticipation = buildCampaignWithCompleteTargetProfile({ organizationId });
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: schoolingRegistrationId } = databaseBuilder.factory.buildSchoolingRegistration({
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

        expect(campaignParticipant.schoolingRegistrationId).to.equal(schoolingRegistrationId);
      });

      it('find only schoolingRegistration that are not disabled', async function () {
        const campaignToStartParticipation = buildCampaignWithCompleteTargetProfile({ organizationId });
        const { id: userId } = databaseBuilder.factory.buildUser();
        databaseBuilder.factory.buildSchoolingRegistration({
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

        expect(campaignParticipant.schoolingRegistrationId).to.equal(undefined);
      });
    });

    context('when there are several schooling registrations', function () {
      context('when there are several schooling registrations for the same user', function () {
        it('find the schoolingRegistrationId for the correct organization', async function () {
          const campaignToStartParticipation = buildCampaignWithCompleteTargetProfile({ organizationId });
          const { id: userId } = databaseBuilder.factory.buildUser();
          databaseBuilder.factory.buildSchoolingRegistration({
            userId,
          });
          const { id: schoolingRegistrationId } = databaseBuilder.factory.buildSchoolingRegistration({
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

          expect(campaignParticipant.schoolingRegistrationId).to.equal(schoolingRegistrationId);
        });
      });

      context('when there are several schooling registrations for the same organization', function () {
        it('find the schoolingRegistrationId for the correct user', async function () {
          const campaignToStartParticipation = buildCampaignWithCompleteTargetProfile({ organizationId });
          const { id: userId } = databaseBuilder.factory.buildUser();
          databaseBuilder.factory.buildSchoolingRegistration({
            organizationId,
          });
          const { id: schoolingRegistrationId } = databaseBuilder.factory.buildSchoolingRegistration({
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

          expect(campaignParticipant.schoolingRegistrationId).to.equal(schoolingRegistrationId);
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
        const campaignToStartParticipation = buildCampaignWithCompleteTargetProfile(
          {
            idPixLabel: 'email',
            type: 'ASSESSMENT',
            isRestricted: true,
            archivedAt: new Date('2022-01-01'),
            assessmentMethod: 'SMART_RANDOM',
            skillCount: 1,
          },
          ['skill1']
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

        const campaignToStartParticipation = buildCampaignWithCompleteTargetProfile(
          {
            idPixLabel: 'email',
            type: 'ASSESSMENT',
            isRestricted: true,
            archivedAt: new Date('2022-01-01'),
            assessmentMethod: 'SMART_RANDOM',
            skillCount: 1,
          },
          ['skill1']
        );
        buildCampaignWithCompleteTargetProfile(
          {
            idPixLabel: 'id',
            type: 'ASSESSMENT',
            isRestricted: false,
            archivedAt: new Date('2022-01-02'),
            assessmentMethod: 'SMART_RANDOM',
            skillCount: 1,
          },
          ['skill2']
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

function getExpectedCampaignParticipation(campaignParticipationId, campaignParticipant) {
  return {
    ...pick(campaignParticipant.campaignParticipation, campaignParticipationAttributes),
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
  schoolingRegistrationId,
  participantExternalId,
}) {
  const campaign = databaseBuilder.factory.buildCampaign(campaignAttributes);

  await databaseBuilder.commit();

  const campaignToStartParticipation = new CampaignToStartParticipation(campaign);
  const campaignParticipant = new CampaignParticipant({
    campaignToStartParticipation,
    schoolingRegistrationId,
    userIdentity,
    previousCampaignParticipation: null,
  });

  campaignParticipant.start({ participantExternalId });
  return campaignParticipant;
}

function buildCampaignWithCompleteTargetProfile(attributes, skills = ['skill1']) {
  const { id: organizationId } = databaseBuilder.factory.buildOrganization({
    isManagingStudents: attributes.isRestricted,
    id: attributes.organizationId,
  });
  const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile();
  skills.forEach((skillId) => {
    databaseBuilder.factory.buildTargetProfileSkill({ skillId, targetProfileId });
  });
  const campaign = databaseBuilder.factory.buildCampaign({
    ...attributes,
    organizationId,
    targetProfileId,
  });

  return new CampaignToStartParticipation({ ...campaign, ...attributes });
}
