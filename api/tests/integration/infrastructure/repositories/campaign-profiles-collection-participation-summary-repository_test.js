import { expect, databaseBuilder, mockLearningContent } from '../../../test-helper.js';
import { CampaignProfilesCollectionParticipationSummary } from '../../../../lib/domain/read-models/CampaignProfilesCollectionParticipationSummary.js';
import * as campaignProfilesCollectionParticipationSummaryRepository from '../../../../lib/infrastructure/repositories/campaign-profiles-collection-participation-summary-repository.js';
import { CampaignParticipationStatuses } from '../../../../lib/domain/models/CampaignParticipationStatuses.js';

const { STARTED } = CampaignParticipationStatuses;

describe('Integration | Repository | Campaign Profiles Collection Participation Summary repository', function () {
  describe('#findPaginatedByCampaignId', function () {
    let campaignId, organizationId;
    let competences;
    let skills;
    const sharedAt = new Date('2018-05-06');

    beforeEach(async function () {
      const learningContentData = buildLearningContentData();
      competences = learningContentData.competences;
      skills = learningContentData.skills;

      organizationId = databaseBuilder.factory.buildOrganization().id;
      campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
      await databaseBuilder.commit();
    });

    it('should return empty array if no participant', async function () {
      // when
      const results =
        await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(campaignId);

      // then
      expect(results.data.length).to.equal(0);
    });

    it('should not return participant data summary for a not shared campaign participation', async function () {
      // given
      const campaignParticipation = { campaignId, status: STARTED, sharedAt: null };
      databaseBuilder.factory.buildCampaignParticipationWithUser({}, campaignParticipation, false);
      await databaseBuilder.commit();

      // when
      const results =
        await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(campaignId);

      // then
      expect(results.data).to.deep.equal([]);
    });

    it('should return participants data summary only for the given campaign id', async function () {
      // given
      const campaignParticipation1 = { campaignId };
      databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
        { firstName: 'Lise', lastName: 'Quesnel' },
        campaignParticipation1,
        false,
      );
      const campaignId2 = databaseBuilder.factory.buildCampaign().id;
      const campaignParticipation2 = { campaignId: campaignId2 };
      databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
        { firstName: 'Benjamin', lastName: 'Petetot' },
        campaignParticipation2,
        false,
      );
      await databaseBuilder.commit();

      // when
      const results =
        await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(campaignId);
      const names = results.data.map((result) => result.firstName);

      // then
      expect(names).exactlyContainInOrder(['Lise']);
    });

    it('should return participants data summary ordered by last name then first name asc from organization-learner', async function () {
      // given
      const campaignParticipation = { campaignId };
      databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
        { firstName: 'Jaja', lastName: 'Le raplapla', organizationId },
        campaignParticipation,
        false,
      );
      databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
        { firstName: 'Jiji', lastName: 'Le riquiqui', organizationId },
        campaignParticipation,
        false,
      );
      databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
        { firstName: 'Jojo', lastName: 'Le rococo', organizationId },
        campaignParticipation,
        false,
      );
      databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
        { firstName: 'Juju', lastName: 'Le riquiqui', organizationId },
        campaignParticipation,
        false,
      );
      await databaseBuilder.commit();

      // when
      const results =
        await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(campaignId);
      const names = results.data.map((result) => result.firstName);

      // then
      expect(names).exactlyContainInOrder(['Jaja', 'Jiji', 'Juju', 'Jojo']);
    });

    describe('when there is a participation deleted', function () {
      it('does not return deleted participation', async function () {
        const { id: userId } = databaseBuilder.factory.buildUser();
        const participationData = {
          campaignId,
          isShared: true,
          sharedAt,
          participantExternalId: 'JeBu',
          pixScore: 46,
          deletedAt: new Date('2020-03-30'),
          deletedBy: userId,
        };
        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner({}, participationData, false);

        await databaseBuilder.commit();

        const results =
          await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(campaignId);

        expect(results.data).to.be.empty;
      });
    });

    describe('when a participant has shared the participation to the campaign', function () {
      let campaignParticipation;

      beforeEach(async function () {
        const createdAt = new Date('2018-04-06T10:00:00Z');
        const participationData = { campaignId, isShared: true, sharedAt, participantExternalId: 'JeBu', pixScore: 46 };
        campaignParticipation = databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { firstName: 'Jérémy', lastName: 'bugietta', organizationId },
          participationData,
          false,
        );

        databaseBuilder.factory.buildKnowledgeElement({
          status: 'validated',
          competenceId: competences[0].id,
          skillId: skills[0].id,
          earnedPix: 40,
          userId: campaignParticipation.userId,
          createdAt,
        });

        databaseBuilder.factory.buildKnowledgeElement({
          status: 'validated',
          competenceId: competences[1].id,
          skillId: skills[2].id,
          earnedPix: 6,
          userId: campaignParticipation.userId,
          createdAt,
        });

        await databaseBuilder.commit();
      });

      it('should return the certification profile info and pix score', async function () {
        // when
        const results =
          await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(campaignId);

        // then
        expect(results.data).to.deep.equal([
          new CampaignProfilesCollectionParticipationSummary({
            campaignParticipationId: campaignParticipation.id,
            firstName: 'Jérémy',
            lastName: 'bugietta',
            participantExternalId: 'JeBu',
            sharedAt,
            pixScore: 46,
            certifiable: false,
            certifiableCompetencesCount: 1,
          }),
        ]);
      });
    });

    describe('when a participant has participated twice', function () {
      let recentCampaignParticipation;

      beforeEach(async function () {
        const userId = 999;
        const oldCampaignParticipation = { userId, campaignId, sharedAt, isImproved: true };
        databaseBuilder.factory.buildCampaignParticipationWithUser({ id: userId }, oldCampaignParticipation, false);

        recentCampaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          isImproved: false,
          sharedAt,
          campaignId,
        });

        await databaseBuilder.commit();
      });

      it('should return only the participationCampaign which is not improved', async function () {
        // when
        const results =
          await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(campaignId);

        // then
        expect(results.data).to.have.lengthOf(1);
        expect(results.data[0].id).to.equal(recentCampaignParticipation.id);
      });
    });

    describe('when there is a filter on division', function () {
      beforeEach(async function () {
        const { id: organizationLearnerId1 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          division: 'Barry',
        });
        const participation1 = {
          participantExternalId: "Can't get Enough Of Your Love, Baby",
          campaignId,
          organizationLearnerId: organizationLearnerId1,
        };
        databaseBuilder.factory.buildCampaignParticipation(participation1);

        const { id: organizationLearnerId2 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          division: 'White',
        });
        const participation2 = {
          participantExternalId: "You're The First, The last, My Everything",
          campaignId,
          organizationLearnerId: organizationLearnerId2,
        };
        databaseBuilder.factory.buildCampaignParticipation(participation2);

        const { id: organizationLearnerId3 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          division: 'Marvin Gaye',
        });
        const participation3 = {
          participantExternalId: "Ain't No Mountain High Enough",
          campaignId,
          organizationLearnerId: organizationLearnerId3,
        };
        databaseBuilder.factory.buildCampaignParticipation(participation3);

        await databaseBuilder.commit();
      });

      it('returns participations which have the correct division', async function () {
        // when
        const divisions = ['Barry', 'White'];
        const results = await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(
          campaignId,
          undefined,
          { divisions },
        );
        const participantExternalIds = results.data.map((result) => result.participantExternalId);

        // then
        expect(participantExternalIds).to.exactlyContain([
          "Can't get Enough Of Your Love, Baby",
          "You're The First, The last, My Everything",
        ]);
      });
    });

    describe('when there is a filter on group', function () {
      beforeEach(async function () {
        const { id: organizationLearnerId1 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          group: 'Barry',
        });
        const participation1 = {
          participantExternalId: "Can't get Enough Of Your Love, Baby",
          campaignId,
          organizationLearnerId: organizationLearnerId1,
        };
        databaseBuilder.factory.buildCampaignParticipation(participation1);

        const { id: organizationLearnerId2 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          group: 'White',
        });
        const participation2 = {
          participantExternalId: "You're The First, The last, My Everything",
          campaignId,
          organizationLearnerId: organizationLearnerId2,
        };
        databaseBuilder.factory.buildCampaignParticipation(participation2);

        const { id: organizationLearnerId3 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          group: 'Marvin Gaye',
        });
        const participation3 = {
          participantExternalId: "Ain't No Mountain High Enough",
          campaignId,
          organizationLearnerId: organizationLearnerId3,
        };
        databaseBuilder.factory.buildCampaignParticipation(participation3);

        await databaseBuilder.commit();
      });

      it('returns participations which have the correct group', async function () {
        // when
        const groups = ['Barry', 'White'];
        const results = await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(
          campaignId,
          undefined,
          { groups },
        );
        const participantExternalIds = results.data.map((result) => result.participantExternalId);

        // then
        expect(participantExternalIds).to.exactlyContain([
          "Can't get Enough Of Your Love, Baby",
          "You're The First, The last, My Everything",
        ]);
      });
    });

    describe('when there is a filter on the firstname and lastname', function () {
      it('returns all participants if the filter is empty', async function () {
        // given
        const { id: organizationLearnerId1 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          group: 'Barry',
          firstName: 'Laa-Laa',
          lastName: 'Teletubbies',
        });

        const participation1 = {
          participantExternalId: "Can't get Enough Of Your Love, Baby",
          campaignId,
          organizationLearnerId: organizationLearnerId1,
        };
        databaseBuilder.factory.buildCampaignParticipation(participation1);

        const { id: organizationLearnerId2 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          group: 'White',
          firstName: 'Dipsy',
          lastName: 'Teletubbies',
        });

        const participation2 = {
          participantExternalId: "You're The First, The last, My Everything",
          campaignId,
          organizationLearnerId: organizationLearnerId2,
        };
        databaseBuilder.factory.buildCampaignParticipation(participation2);

        await databaseBuilder.commit();

        // when
        const results = await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(
          campaignId,
          undefined,
          { search: '' },
        );

        // then
        expect(results.data.length).to.equal(2);
      });

      it('returns Laa-Laa when we search part of its firstname', async function () {
        // given
        const { id: organizationLearnerId1 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          group: 'Barry',
          firstName: 'Laa-Laa',
          lastName: 'Teletubbies',
        });

        const participation1 = {
          participantExternalId: "Can't get Enough Of Your Love, Baby",
          campaignId,
          organizationLearnerId: organizationLearnerId1,
        };
        databaseBuilder.factory.buildCampaignParticipation(participation1);

        const { id: organizationLearnerId2 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          group: 'White',
          firstName: 'Dipsy',
          lastName: 'Teletubbies',
        });

        const participation2 = {
          participantExternalId: "You're The First, The last, My Everything",
          campaignId,
          organizationLearnerId: organizationLearnerId2,
        };
        databaseBuilder.factory.buildCampaignParticipation(participation2);

        await databaseBuilder.commit();

        // when
        const results = await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(
          campaignId,
          undefined,
          { search: 'La' },
        );

        // then
        expect(results.data.length).to.equal(1);
        expect(results.data[0].firstName).to.equal('Laa-Laa');
      });

      it('returns Laa-Laa when we search part of its firstname with a space before', async function () {
        // given
        const { id: organizationLearnerId1 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          group: 'Barry',
          firstName: 'Laa-Laa',
          lastName: 'Teletubbies',
        });

        const participation1 = {
          participantExternalId: "Can't get Enough Of Your Love, Baby",
          campaignId,
          organizationLearnerId: organizationLearnerId1,
        };
        databaseBuilder.factory.buildCampaignParticipation(participation1);

        const { id: organizationLearnerId2 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          group: 'White',
          firstName: 'Dipsy',
          lastName: 'Teletubbies',
        });

        const participation2 = {
          participantExternalId: "You're The First, The last, My Everything",
          campaignId,
          organizationLearnerId: organizationLearnerId2,
        };
        databaseBuilder.factory.buildCampaignParticipation(participation2);

        await databaseBuilder.commit();

        // when
        const results = await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(
          campaignId,
          undefined,
          { search: ' La' },
        );

        // then
        expect(results.data.length).to.equal(1);
        expect(results.data[0].firstName).to.equal('Laa-Laa');
      });

      it('returns Laa-Laa when we search part of its firstname with a space after', async function () {
        // given
        const { id: organizationLearnerId1 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          group: 'Barry',
          firstName: 'Laa-Laa',
          lastName: 'Teletubbies',
        });

        const participation1 = {
          participantExternalId: "Can't get Enough Of Your Love, Baby",
          campaignId,
          organizationLearnerId: organizationLearnerId1,
        };
        databaseBuilder.factory.buildCampaignParticipation(participation1);

        const { id: organizationLearnerId2 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          group: 'White',
          firstName: 'Dipsy',
          lastName: 'Teletubbies',
        });

        const participation2 = {
          participantExternalId: "You're The First, The last, My Everything",
          campaignId,
          organizationLearnerId: organizationLearnerId2,
        };
        databaseBuilder.factory.buildCampaignParticipation(participation2);

        await databaseBuilder.commit();

        // when
        const results = await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(
          campaignId,
          undefined,
          { search: 'La ' },
        );

        // then
        expect(results.data.length).to.equal(1);
        expect(results.data[0].firstName).to.equal('Laa-Laa');
      });

      it('returns Laa-Laa when we search part of its fullname', async function () {
        // given
        const { id: organizationLearnerId1 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          group: 'Barry',
          firstName: 'Laa-Laa',
          lastName: 'Teletubbies',
        });

        const participation1 = {
          participantExternalId: "Can't get Enough Of Your Love, Baby",
          campaignId,
          organizationLearnerId: organizationLearnerId1,
        };
        databaseBuilder.factory.buildCampaignParticipation(participation1);

        const { id: organizationLearnerId2 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          group: 'White',
          firstName: 'Dipsy',
          lastName: 'Teletubbies',
        });

        const participation2 = {
          participantExternalId: "You're The First, The last, My Everything",
          campaignId,
          organizationLearnerId: organizationLearnerId2,
        };
        databaseBuilder.factory.buildCampaignParticipation(participation2);

        await databaseBuilder.commit();

        // when
        const results = await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(
          campaignId,
          undefined,
          { search: 'Laa-Laa Tel' },
        );

        // then
        expect(results.data.length).to.equal(1);
        expect(results.data[0].firstName).to.equal('Laa-Laa');
      });

      it('returns Laa-Laa when we search similar part of lastname', async function () {
        // given
        const { id: organizationLearnerId1 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          group: 'Barry',
          firstName: 'Laa-Laa',
          lastName: 'Teletubbies',
        });
        const participation1 = {
          participantExternalId: "Can't get Enough Of Your Love, Baby",
          campaignId,
          organizationLearnerId: organizationLearnerId1,
        };
        databaseBuilder.factory.buildCampaignParticipation(participation1);
        const { id: organizationLearnerId2 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          group: 'White',
          firstName: 'Dipsy',
          lastName: 'Teletubbies',
        });
        const participation2 = {
          participantExternalId: "You're The First, The last, My Everything",
          campaignId,
          organizationLearnerId: organizationLearnerId2,
        };
        databaseBuilder.factory.buildCampaignParticipation(participation2);
        const { id: organizationLearnerId3 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          group: 'Barry',
          firstName: 'Maya',
          lastName: 'L abeille',
        });
        const participation3 = {
          participantExternalId: "Ain't No Mountain High Enough",
          campaignId,
          organizationLearnerId: organizationLearnerId3,
        };
        databaseBuilder.factory.buildCampaignParticipation(participation3);
        await databaseBuilder.commit();

        // when
        const results = await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(
          campaignId,
          undefined,
          { search: 'Teletub' },
        );

        // then
        expect(results.data.length).to.equal(2);
        expect(results.data[0].firstName).to.equal('Dipsy');
        expect(results.data[1].firstName).to.equal('Laa-Laa');
      });
    });

    describe('when there is a filter on certificability', function () {
      it('returns certifiable participants', async function () {
        // given
        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId },
          { participantExternalId: 'Certifiable', campaignId, isCertifiable: true },
        );

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId },
          { participantExternalId: 'Not certifiable', campaignId, isCertifiable: false },
        );

        await databaseBuilder.commit();

        // when
        const results = await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(
          campaignId,
          undefined,
          { certificability: true },
        );

        const participantExternalIds = results.data.map((result) => result.participantExternalId);

        // then
        expect(participantExternalIds).to.deep.equal(['Certifiable']);
      });

      it('returns not certifiable participants', async function () {
        // given
        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId },
          { participantExternalId: 'Certifiable', campaignId, isCertifiable: true },
        );

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId },
          { participantExternalId: 'Not certifiable', campaignId, isCertifiable: false },
        );

        await databaseBuilder.commit();

        // when
        const results = await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(
          campaignId,
          undefined,
          { certificability: false },
        );

        const participantExternalIds = results.data.map((result) => result.participantExternalId);

        // then
        expect(participantExternalIds).to.deep.equal(['Not certifiable']);
      });
    });
  });
});

const buildLearningContentData = () => {
  const skillWeb1 = { id: 'recSkillWeb1', name: '@web1', competenceId: 'recCompetence1', status: 'actif' };
  const skillWeb2 = { id: 'recSkillWeb2', name: '@web2', competenceId: 'recCompetence1', status: 'actif' };
  const skillUrl1 = { id: 'recSkillUrl1', name: '@url1', competenceId: 'recCompetence2', status: 'actif' };
  const skillUrl8 = { id: 'recSkillUrl8', name: '@url8', competenceId: 'recCompetence2', status: 'actif' };
  const skills = [skillWeb1, skillWeb2, skillUrl1, skillUrl8];

  const competence1 = {
    id: 'recCompetence1',
    name_i18n: {
      fr: 'Competence1',
    },
    index: '1.1',
    areaId: 'recArea1',
    skillIds: [skillWeb1.id, skillWeb2.id],
    origin: 'Pix',
  };

  const competence2 = {
    id: 'recCompetence2',
    name_i18n: {
      fr: 'Competence2',
    },
    index: '3.2',
    areaId: 'recArea3',
    skillIds: [skillUrl1.id, skillUrl8.id],
    origin: 'Pix',
  };

  const competences = [competence1, competence2];

  const area1 = { id: 'recArea1', code: '1', title_i18n: { fr: 'Domain 1' }, competenceIds: ['recCompetence1'] };
  const area3 = { id: 'recArea3', code: '3', title_i18n: { fr: 'Domain 3' }, competenceIds: ['recCompetence2'] };

  const learningContent = {
    areas: [area1, area3],
    competences,
    skills,
  };

  mockLearningContent(learningContent);

  return { competences, skills };
};
