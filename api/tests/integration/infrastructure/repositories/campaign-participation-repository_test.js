const _ = require('lodash');
const { sinon, expect, knex, databaseBuilder } = require('../../../test-helper');
const CampaignParticipation = require('../../../../lib/domain/models/CampaignParticipation');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const Assessment = require('../../../../lib/domain/models/Assessment');
const Skill = require('../../../../lib/domain/models/Skill');
const campaignParticipationRepository = require('../../../../lib/infrastructure/repositories/campaign-participation-repository');

describe('Integration | Repository | Campaign Participation', () => {

  describe('#get', () => {

    let campaignId;
    let campaignParticipationId, campaignParticipationNotSharedId;

    beforeEach(async () => {
      campaignId = databaseBuilder.factory.buildCampaign({}).id;
      campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;
      campaignParticipationNotSharedId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        isShared: false,
        sharedAt: null
      }).id;

      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return a campaign participation object', async () => {
      // when
      const foundCampaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);

      // then
      expect(foundCampaignParticipation.id).to.equal(campaignParticipationId);
    });

    it('should return a null object for sharedAt when the campaign-participation is not shared', async () => {
      // when
      const foundCampaignParticipation = await campaignParticipationRepository.get(campaignParticipationNotSharedId);

      // then
      expect(foundCampaignParticipation.sharedAt).to.be.null;
    });

  });

  describe('#save', () => {

    let campaignId, assessmentId, userId;
    beforeEach(async () => {
      campaignId = databaseBuilder.factory.buildCampaign({}).id;
      const assessment = databaseBuilder.factory.buildAssessment({});
      assessmentId = assessment.id;
      userId = assessment.userId;

      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await knex('campaign-participations').delete();
      await databaseBuilder.clean();
    });

    it('should return the given campaign participation', async () => {
      // given
      const campaignParticipationToSave = new CampaignParticipation({
        assessmentId,
        campaignId,
        userId,
      });

      // when
      const savedCampaignParticipation = await campaignParticipationRepository.save(campaignParticipationToSave);

      // then
      expect(savedCampaignParticipation).to.be.instanceof(CampaignParticipation);
      expect(savedCampaignParticipation.id).to.exist;
      expect(savedCampaignParticipation.assessmentId).to.equal(campaignParticipationToSave.assessmentId);
      expect(savedCampaignParticipation.campaignId).to.equal(campaignParticipationToSave.campaignId);
      expect(savedCampaignParticipation.userId).to.equal(campaignParticipationToSave.userId);
    });

    it('should save the given campaign participation', async () => {
      // given
      const campaignParticipationToSave = new CampaignParticipation({
        assessmentId,
        campaignId,
        userId,
        participantExternalId: '034516273645RET'
      });

      // when
      const savedCampaignParticipation = await campaignParticipationRepository.save(campaignParticipationToSave);

      // then
      const campaignParticipationInDB = await knex.select('id', 'assessmentId', 'campaignId', 'participantExternalId', 'userId')
        .from('campaign-participations')
        .where({ id: savedCampaignParticipation.id });
      expect(campaignParticipationInDB).to.have.length(1);
      expect(campaignParticipationInDB[0].id).to.equal(savedCampaignParticipation.id);
      expect(campaignParticipationInDB[0].assessmentId).to.equal(savedCampaignParticipation.assessmentId);
      expect(campaignParticipationInDB[0].campaignId).to.equal(campaignParticipationToSave.campaignId);
      expect(campaignParticipationInDB[0].participantExternalId).to.equal(savedCampaignParticipation.participantExternalId);
      expect(campaignParticipationInDB[0].userId).to.equal(savedCampaignParticipation.userId);
    });

  });

  describe('#count', () => {

    let campaignId;

    beforeEach(async () => {
      campaignId = databaseBuilder.factory.buildCampaign({}).id;

      _.times(2, () => {
        databaseBuilder.factory.buildCampaignParticipation({});
      });
      _.times(5, () => {
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          isShared: true,
        });
      });
      _.times(3, () => {
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          isShared: false,
        });
      });

      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should count all campaignParticipations', async () => {
      // when
      const count = await campaignParticipationRepository.count();

      // then
      expect(count).to.equal(10);
    });

    it('should count all campaignParticipations by campaign', async () => {
      // when
      const count = await campaignParticipationRepository.count({ campaignId });

      // then
      expect(count).to.equal(8);
    });

    it('should count all shared campaignParticipations by campaign', async () => {
      // when
      const count = await campaignParticipationRepository.count({
        campaignId,
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

    let userId;

    beforeEach(async () => {
      // given
      userId = databaseBuilder.factory.buildUser({}).id;
      _.times(2, () => {
        databaseBuilder.factory.buildCampaignParticipation({ userId });
      });
      _.times(3, () => {
        databaseBuilder.factory.buildCampaignParticipation({});
      });
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return all the campaign-participation links to the given user', async () => {
      // when
      const foundCampaignParticipations = await campaignParticipationRepository.findByUserId(userId);

      // then
      expect(foundCampaignParticipations).to.have.a.lengthOf(2);
    });
  });

  describe('#findOneByAssessmentIdWithSkillIds', () => {

    const assessmentId = 12345;
    const campaignId = 123;
    const targetProfileId = 456;
    const skillId1 = 'rec1';
    const skillId2 = 'rec2';

    context('when assessment is linked', () => {

      beforeEach(async () => {
        databaseBuilder.factory.buildAssessment({ id: assessmentId });
        databaseBuilder.factory.buildAssessment({ id: 67890 });
        databaseBuilder.factory.buildTargetProfile({ id: targetProfileId });
        databaseBuilder.factory.buildTargetProfileSkill({ skillId: skillId1, targetProfileId });
        databaseBuilder.factory.buildTargetProfileSkill({ skillId: skillId2, targetProfileId });
        databaseBuilder.factory.buildCampaign({ id: campaignId, targetProfileId });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, assessmentId });
        databaseBuilder.factory.buildCampaignParticipation({ assessmentId: 67890 });

        await databaseBuilder.commit();
      });

      afterEach(async () => {
        await databaseBuilder.clean();
      });

      it('should return the campaign-participation linked to the given assessment with skills', async () => {
        // when
        const campaignParticipationFound = await campaignParticipationRepository.findOneByAssessmentIdWithSkillIds(assessmentId);

        // then
        expect(campaignParticipationFound.assessmentId).to.deep.equal(assessmentId);
        expect(campaignParticipationFound.campaign.targetProfile.skills).to.have.lengthOf(2);
        expect(campaignParticipationFound.campaign.targetProfile.skills[0]).to.be.instanceOf(Skill);
        expect(campaignParticipationFound.campaign.targetProfile.skills[0].id).to.equal(skillId1);
        expect(campaignParticipationFound.campaign.targetProfile.skills[1]).to.be.instanceOf(Skill);
        expect(campaignParticipationFound.campaign.targetProfile.skills[1].id).to.equal(skillId2);
      });
    });

    context('when assessment is not linked', () => {

      beforeEach(async () => {
        databaseBuilder.factory.buildAssessment({ id: 67890 });
        databaseBuilder.factory.buildCampaignParticipation({ assessmentId: 67890 });

        await databaseBuilder.commit();
      });

      afterEach(async () => {
        await databaseBuilder.clean();
      });

      it('should return null', async () => {
        // when
        const campaignParticipationFound = await campaignParticipationRepository.findOneByAssessmentIdWithSkillIds(assessmentId);

        // then
        expect(campaignParticipationFound).to.equal(null);
      });
    });
  });

  describe('#findByAssessmentId', () => {

    let assessmentId;

    beforeEach(async () => {
      assessmentId = databaseBuilder.factory.buildAssessment().id;
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
      const foundCampaignParticipation = await campaignParticipationRepository.findByAssessmentId(options.filter.assessmentId);
      // then
      expect(foundCampaignParticipation).to.have.length(2);
    });

  });

  describe('#findPaginatedCampaignParticipations', () => {

    const assessmentId1 = 1;
    const assessmentId2 = 2;
    let campaignId;

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

      campaignId = databaseBuilder.factory.buildCampaign().id;
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
      const foundCampaignParticipation = await campaignParticipationRepository.findPaginatedCampaignParticipations(options);
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

    it('should return paginated campaign participations sorted by lastname and firstname', async () => {
      // given
      const options = { filter: { campaignId }, sort: [], include: ['user'], page: {} };
      const { id: userId } = databaseBuilder.factory.buildUser({ lastName: 'Bugietta', firstName: 'Anna' });
      const { id: assessmentId } = databaseBuilder.factory.buildAssessment({ userId });
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, assessmentId, userId, sharedAt: recentDate, createdAt: recentDate });
      await databaseBuilder.commit();

      // when
      const foundCampaignParticipation = await campaignParticipationRepository.findPaginatedCampaignParticipations(options);
      const foundUserLastNames = _(foundCampaignParticipation.models).map('user').map('lastName').value();
      const foundUserFirstNames = _(foundCampaignParticipation.models).map('user').map('firstName').value();

      // then
      expect(foundUserLastNames).to.deep.equal(['Bugietta', 'Bugietta', 'Darboo', 'Lorenzio', 'Subzéro']);
      expect(foundUserFirstNames).to.deep.equal(['Anna', 'Jérémy', 'Mélanie', 'Matteo', 'Léo']);
    });

    it('should return paginated campaign participations sorted with no case sensitive', async () => {
      // given
      const options = { filter: { campaignId }, sort: [], include: ['user'], page: {} };
      const { id: userId } = databaseBuilder.factory.buildUser({ lastName: 'BUGIETTA', firstName: 'Anna' });
      const { id: assessmentId } = databaseBuilder.factory.buildAssessment({ userId });
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, assessmentId, userId, sharedAt: recentDate, createdAt: recentDate });
      await databaseBuilder.commit();

      // when
      const foundCampaignParticipation = await campaignParticipationRepository.findPaginatedCampaignParticipations(options);
      const foundUserLastNames = _(foundCampaignParticipation.models).map('user').map('lastName').value();

      // then
      expect(foundUserLastNames).to.deep.equal(['BUGIETTA', 'Bugietta', 'Darboo', 'Lorenzio', 'Subzéro']);
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

  describe('#updateAssessmentIdByOldAssessmentId', () => {

    let campaignParticipation;
    let assessment;

    beforeEach(async () => {
      assessment = databaseBuilder.factory.buildAssessment();
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation();

      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return the updated campaign-participation of the given assessmentId', async () => {
      // when
      const updatedCampaignParticipation = await campaignParticipationRepository.updateAssessmentIdByOldAssessmentId({ oldAssessmentId: campaignParticipation.assessmentId, newAssessmentId: assessment.id });

      // then
      expect(updatedCampaignParticipation.assessmentId).to.equal(assessment.id);
    });
  });
});
