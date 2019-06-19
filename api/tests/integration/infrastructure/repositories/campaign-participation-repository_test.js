const _ = require('lodash');
const { sinon, expect, knex, databaseBuilder } = require('../../../test-helper');
const CampaignParticipation = require('../../../../lib/domain/models/CampaignParticipation');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const Assessment = require('../../../../lib/domain/models/Assessment');
const campaignParticipationRepository = require('../../../../lib/infrastructure/repositories/campaign-participation-repository');

describe('Integration | Repository | Campaign Participation', () => {

  describe('#get', () => {

    let campaign;
    let campaignParticipation, campaignParticipationNotShared;

    beforeEach(() => {
      campaign = databaseBuilder.factory.buildCampaign({});

      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id
      });
      campaignParticipationNotShared = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        isShared: false,
        sharedAt: null
      });

      return databaseBuilder.commit();
    });

    afterEach(() => {
      return databaseBuilder.clean();
    });

    it('should return a campaign participation object', () => {
      // when
      const promise = campaignParticipationRepository.get(campaignParticipation.id);

      // then
      return promise.then((foundCampaignParticipation) => {
        expect(foundCampaignParticipation.id).to.equal(campaignParticipation.id);
      });
    });

    it('should return a null object for sharedAt when the campaign-participation is not shared', () => {
      // when
      const promise = campaignParticipationRepository.get(campaignParticipationNotShared.id);

      // then
      return promise.then((foundCampaignParticipation) => {
        expect(foundCampaignParticipation.sharedAt).to.be.null;
      });
    });

  });

  describe('#save', () => {

    afterEach(() => {
      return knex('campaign-participations').delete();
    });

    it('should return the given campaign participation', () => {
      // given
      const campaignId = 23;
      const campaignParticipationToSave = new CampaignParticipation({
        assessmentId: 12,
        campaignId,
        userId: 1,
      });

      // when
      const promise = campaignParticipationRepository.save(campaignParticipationToSave);

      // then
      return promise.then((savedCampaignParticipations) => {
        expect(savedCampaignParticipations).to.be.instanceof(CampaignParticipation);
        expect(savedCampaignParticipations.id).to.exist;
        expect(savedCampaignParticipations.assessmentId).to.equal(campaignParticipationToSave.assessmentId);
        expect(savedCampaignParticipations.campaignId).to.equal(campaignId);
        expect(savedCampaignParticipations.userId).to.equal(campaignParticipationToSave.userId);
      });
    });

    it('should save the given campaign participation', () => {
      // given
      const campaignId = 23;
      const campaignParticipationToSave = new CampaignParticipation({
        assessmentId: 12,
        campaignId,
        participantExternalId: '034516273645RET'
      });

      // when
      const promise = campaignParticipationRepository.save(campaignParticipationToSave);

      // then
      return promise.then((campaignParticipationSaved) => {
        return knex.select('id', 'assessmentId', 'campaignId', 'participantExternalId')
          .from('campaign-participations')
          .where({ id: campaignParticipationSaved.id })
          .then(([campaignParticipationInDb]) => {
            expect(campaignParticipationInDb.id).to.equal(campaignParticipationSaved.id);
            expect(campaignParticipationInDb.assessmentId).to.equal(campaignParticipationToSave.assessmentId);
            expect(campaignParticipationInDb.campaignId).to.equal(campaignParticipationToSave.campaignId);
            expect(campaignParticipationInDb.participantExternalId).to.equal(campaignParticipationToSave.participantExternalId);
            expect(campaignParticipationInDb.userId).to.equal(campaignParticipationToSave.userId);
          });
      });
    });

  });

  describe('#count', () => {

    let campaign;

    beforeEach(() => {
      campaign = databaseBuilder.factory.buildCampaign({});

      _.times(2, () => {
        return databaseBuilder.factory.buildCampaignParticipation({ campaignId: 'otherCampaignId' });
      });
      _.times(5, () => {
        return databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          isShared: true,
        });
      });
      _.times(3, () => {
        return databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          isShared: false,
        });
      });

      return databaseBuilder.commit();
    });

    afterEach(() => {
      return databaseBuilder.clean();
    });

    it('should count all campaignParticipations', async () => {
      // when
      const count = await campaignParticipationRepository.count();

      // then
      expect(count).to.equal(10);
    });

    it('should count all campaignParticipations by campaign', async () => {
      // when
      const count = await campaignParticipationRepository.count({ campaignId: campaign.id });

      // then
      expect(count).to.equal(8);
    });

    it('should count all shared campaignParticipations by campaign', async () => {
      // when
      const count = await campaignParticipationRepository.count({
        campaignId: campaign.id,
        isShared: true,
      });

      // then
      expect(count).to.equal(5);
    });
  });

  describe('#findByCampaignId', () => {

    let campaign1;
    let campaign2;
    let campaignParticipation1;
    let campaignParticipation2;

    beforeEach(async () => {
      campaign1 = databaseBuilder.factory.buildCampaign({});
      campaign2 = databaseBuilder.factory.buildCampaign({});

      campaignParticipation1 = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign1.id,
        isShared: true
      });
      campaignParticipation2 = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign1.id,
        isShared: true
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign2.id,
        isShared: true
      });
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return all the campaign-participation links to the given campaign', () => {
      // given
      const campaignId = campaign1.id;

      // when
      const promise = campaignParticipationRepository.findByCampaignId(campaignId);

      // then
      return promise.then((campaignParticipationsFind) => {
        expect(campaignParticipationsFind.length).to.equal(2);
        expect(campaignParticipationsFind[0].campaign.id).to.equal(campaignParticipation1.campaignId);
        expect(campaignParticipationsFind[1].campaign.id).to.equal(campaignParticipation2.campaignId);
      });
    });
  });

  describe('#findByUserId', () => {

    let user1;
    let user2;
    let campaignParticipation1;
    let campaignParticipation2;

    beforeEach(async () => {
      user1 = databaseBuilder.factory.buildCampaign({});
      user2 = databaseBuilder.factory.buildCampaign({});

      campaignParticipation1 = databaseBuilder.factory.buildCampaignParticipation({ userId: user1.id });
      campaignParticipation2 = databaseBuilder.factory.buildCampaignParticipation({ userId: user1.id });
      databaseBuilder.factory.buildCampaignParticipation({ userId: user2.id });
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return all the campaign-participation links to the given user', () => {
      // given
      const userId = user1.id;

      // when
      const promise = campaignParticipationRepository.findByUserId(userId);

      // then
      return promise.then((campaignParticipationsFind) => {
        expect(campaignParticipationsFind).to.have.a.lengthOf(2);
        expect(campaignParticipationsFind[0].userId).to.equal(campaignParticipation1.userId);
        expect(campaignParticipationsFind[1].userId).to.equal(campaignParticipation2.userId);
      });
    });
  });

  describe('#find', () => {

    const campaignId = 'my campaign id';
    const assessmentId = 'my assessment id';

    beforeEach(async () => {
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, assessmentId });
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, assessmentId });
      databaseBuilder.factory.buildCampaignParticipation({ campaignId });
      databaseBuilder.factory.buildCampaignParticipation({ assessmentId });
      databaseBuilder.factory.buildCampaignParticipation({ assessmentId });
      databaseBuilder.factory.buildCampaignParticipation();

      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return campaign participations that match given assessmentId', async function() {
      // given
      const options = { filter: { assessmentId }, sort: [] };
      // when
      const foundCampaignParticipation = await campaignParticipationRepository.find(options);
      // then
      expect(foundCampaignParticipation.models).to.have.length(4);
    });

    it('should return campaign participations that match given campaignId', async function() {
      // given
      const options = { filter: { campaignId }, sort: [] };
      // when
      const foundCampaignParticipation = await campaignParticipationRepository.find(options);
      // then
      expect(foundCampaignParticipation.models).to.have.length(3);
    });

  });

  describe('#findWithUsersPaginated', () => {

    const campaignId = 'my campaign id';
    const assessmentId = 'my assessment id';

    beforeEach(async () => {

      const pixMembers = [
        { firstName: 'Mélanie', lastName: 'Darboo' },
        { firstName: 'Matteo', lastName: 'Lorenzio' },
        { firstName: 'Jérémy', lastName: 'Bugietta' },
        { firstName: 'Léo', lastName: 'Subzéro' },
        { firstName: 'Forster', lastName: 'Gillet-Jaune' },
        { firstName: 'Thierry', lastName: 'Donckele' },
        { firstName: 'Jaune', lastName: 'Attend' },
      ];

      const insertPixMember = (member) => {
        const { id } = databaseBuilder.factory.buildUser(member);
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, assessmentId, userId: id });
      };

      pixMembers.forEach(insertPixMember);

      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return paginated campaign participations including users sorted by name, lastname', async () => {
      // given
      const options = { filter: { campaignId }, sort: [], include: ['user'], page: { number: 1, size: 4 } };
      // when
      const foundCampaignParticipation = await campaignParticipationRepository.findWithUsersPaginated(options);
      const foundUsers = _.map(foundCampaignParticipation.models, 'user');
      const foundUserLastNames = _.map(foundUsers, 'lastName');
      // then
      expect(foundUserLastNames).to.deep.equal(['Attend', 'Bugietta', 'Darboo', 'Donckele']);});
  });

  describe('#findWithCampaignParticipationResultsData', () => {

    const assessmentId1 = 1;
    const assessmentId2 = 2;
    const campaignId = 'my campaign id';

    const oldDate = new Date('2018-02-03');
    const recentDate = new Date('2018-05-06');
    const futurDate = new Date('2018-07-10');

    beforeEach(async () => {

      const pixMembers = [
        {
          firstName: 'Mélanie',
          lastName: 'Darboo',
          assessmentId: assessmentId2,
          knowledgeElements: [
            { skillId: '@web3', createdAt: oldDate },
            { skillId: '@web3', createdAt: oldDate },
            { skillId: '@web4', createdAt: oldDate },
            { skillId: '@web5', createdAt: futurDate },
          ]
        },
        { firstName: 'Matteo', lastName: 'Lorenzio', knowledgeElements: [] },
        {
          firstName: 'Jérémy',
          lastName: 'Bugietta',
          assessmentId: assessmentId1,
          knowledgeElements: [
            { skillId: '@web2', createdAt: oldDate },
            { skillId: '@web1', createdAt: oldDate },
          ]
        },
        { firstName: 'Léo', lastName: 'Subzéro', knowledgeElements: [] },
      ];

      const insertPixMember = (member) => {
        const { id: userId } = databaseBuilder.factory.buildUser(member);
        const { id: assessmentId } = databaseBuilder.factory.buildAssessment({ userId, id: member.assessmentId });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, assessmentId, userId, sharedAt: recentDate });
        for (const ke of member.knowledgeElements) {
          databaseBuilder.factory.buildKnowledgeElement({ ...ke, userId, });
        }
      };

      pixMembers.forEach(insertPixMember);

      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return paginated campaign participations including users sorted by name, lastname, their assessment and uniq knowledge elements', async () => {
      // given
      const options = { filter: { campaignId }, sort: [], include: ['user'], page: { number: 1, size: 2 } };
      // when
      const foundCampaignParticipation = await campaignParticipationRepository.findWithCampaignParticipationResultsData(options);
      const foundUserLastNames = _(foundCampaignParticipation.models).map('user').map('lastName').value();
      const foundAssessmentIds = _(foundCampaignParticipation.models).map('assessment').map('id').value();
      const foundKnowledgeElementsSkillsIds = _(foundCampaignParticipation.models).map('user').map('knowledgeElements').flatten().map('skillId').value();
      // then
      expect(foundUserLastNames).to.deep.equal(['Bugietta', 'Darboo']);
      expect(foundAssessmentIds).to.deep.equal([assessmentId1, assessmentId2]);
      expect(foundKnowledgeElementsSkillsIds).to.have.members(['@web1', '@web2', '@web3', '@web4']);
      expect(foundCampaignParticipation.models[0].assessment).to.be.instanceOf(Assessment);
      expect(foundCampaignParticipation.models[0].user.knowledgeElements[0]).to.be.instanceOf(KnowledgeElement);
    });
  });

  describe('#share', () => {

    let campaignParticipation;
    const frozenTime = new Date('1987-09-01T00:00:00Z');

    beforeEach(async () => {
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        isShared: false,
        sharedAt: null,
      });

      sinon.useFakeTimers(frozenTime);

      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return the shared campaign-participation', () => {
      // when
      const promise = campaignParticipationRepository.share(campaignParticipation);

      // then
      return promise.then((updatedCampaignParticipation) => {
        expect(updatedCampaignParticipation.isShared).to.be.true;
        expect(updatedCampaignParticipation.assessmentId).to.equal(campaignParticipation.assessmentId);
        expect(updatedCampaignParticipation.sharedAt).to.deep.equal(frozenTime);
      });
    });
  });
});
