const { expect, databaseBuilder } = require('../../../test-helper');
const Campaign = require('../../../../lib/domain/models/Campaign');
const campaignParticipationInfoRepository = require('../../../../lib/infrastructure/repositories/campaign-participation-info-repository');

describe('Integration | Repository | Campaign Participation Info', () => {

  describe('#findByCampaignId', () => {

    context('when there are several campaign', () => {
      let campaignParticipation1;
      let campaign1;
      beforeEach(async () => {
        const userId = databaseBuilder.factory.buildUser({
          firstName: 'First',
          lastName: 'Last',
        }).id;

        campaign1 = databaseBuilder.factory.buildCampaign({ type: Campaign.types.ASSESSMENT });

        campaignParticipation1 = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign1.id,
          userId,
          isShared: true,
        });

        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: campaignParticipation1.id,
          userId, state: 'started',
          createdAt: new Date('2020-01-01'),
        });

        const campaign2 = databaseBuilder.factory.buildCampaign({ type: Campaign.types.ASSESSMENT });

        const campaignParticipation2 = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign2.id,
          userId,
          isShared: true,
        });

        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: campaignParticipation2.id,
          userId, state: 'completed',
          createdAt: new Date('2020-01-01'),
        });

        await databaseBuilder.commit();
      });

      it('should return the campaign-participation for the given campaign', async () => {
        // when
        const campaignParticipationInfos = await campaignParticipationInfoRepository.findByCampaignId(campaign1.id);

        // then
        expect(campaignParticipationInfos).to.deep.equal([
          {
            sharedAt: campaignParticipation1.sharedAt,
            createdAt: campaignParticipation1.createdAt,
            participantExternalId: campaignParticipation1.participantExternalId,
            userId: campaignParticipation1.userId,
            isCompleted: false,
            participantFirstName: 'First',
            participantLastName: 'Last',
            studentNumber: null,
            division: null,
          },
        ]);
        expect(campaignParticipationInfos[0].isShared).to.be.true;
      });
    });

    context('when there are several participant', () => {
      let campaign;
      let campaignParticipation1;
      let campaignParticipation2;

      beforeEach(async () => {
        campaign = databaseBuilder.factory.buildCampaign({ type: Campaign.types.ASSESSMENT });

        const user1Id = databaseBuilder.factory.buildUser({ firstName: 'The', lastName: 'Narrator' }).id;
        const user2Id = databaseBuilder.factory.buildUser({ firstName: 'Tyler', lastName: 'Durden' }).id;

        campaignParticipation1 = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          userId: user1Id,
          isShared: true,
          sharedAt: new Date(),
        });

        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: campaignParticipation1.id,
          userId: user1Id,
          state: 'started',
        });

        campaignParticipation2 = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          userId: user2Id,
          isShared: false,
          sharedAt: null,
        });

        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: campaignParticipation2.id,
          userId: user2Id,
          state: 'completed',
        });

        await databaseBuilder.commit();
      });

      it('should return all the campaign-participation', async () => {
        // when
        const campaignParticipationInfos = await campaignParticipationInfoRepository.findByCampaignId(campaign.id);
        const campaignParticipationInfosOrdered = campaignParticipationInfos.sort((a, b) => a.lastName < b.lastName);
        // then
        expect(campaignParticipationInfosOrdered.length).to.equal(2);
        expect(campaignParticipationInfosOrdered[0]).to.deep.equal({
          sharedAt: campaignParticipation1.sharedAt,
          createdAt: campaignParticipation1.createdAt,
          participantExternalId: campaignParticipation1.participantExternalId,
          userId: campaignParticipation1.userId,
          isCompleted: false,
          participantFirstName: 'The',
          participantLastName: 'Narrator',
          studentNumber: null,
          division: null,
        });
        expect(campaignParticipationInfosOrdered[0].isShared).to.equal(true);

        expect(campaignParticipationInfosOrdered[1]).to.deep.equal({
          sharedAt: campaignParticipation2.sharedAt,
          createdAt: campaignParticipation2.createdAt,
          participantExternalId: campaignParticipation2.participantExternalId,
          userId: campaignParticipation2.userId,
          isCompleted: true,
          participantFirstName: 'Tyler',
          participantLastName: 'Durden',
          studentNumber: null,
          division: null,
        });
        expect(campaignParticipationInfosOrdered[1].isShared).to.equal(false);
      });
    });

    context('when a participant has several assessment', () => {
      let campaign;
      let campaignParticipation;

      beforeEach(async () => {
        campaign = databaseBuilder.factory.buildCampaign({ type: Campaign.types.ASSESSMENT });

        const userId = databaseBuilder.factory.buildUser({ firstName: 'The', lastName: 'Narrator' }).id;

        campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          userId,
          isShared: true,
          sharedAt: new Date(),
        });

        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: campaignParticipation.id,
          userId,
          state: 'completed',
          createdAt: '2020-01-02',
        });

        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: campaignParticipation.id,
          userId,
          state: 'started',
          createdAt: '2020-01-01',
        });

        await databaseBuilder.commit();
      });

      it('should information about the newest assessment', async () => {
        // when
        const campaignParticipationInfos = await campaignParticipationInfoRepository.findByCampaignId(campaign.id);
        // then
        expect(campaignParticipationInfos).to.deep.equal([{
          sharedAt: campaignParticipation.sharedAt,
          createdAt: campaignParticipation.createdAt,
          participantExternalId: campaignParticipation.participantExternalId,
          userId: campaignParticipation.userId,
          isCompleted: true,
          participantFirstName: 'The',
          participantLastName: 'Narrator',
          studentNumber: null,
          division: null,
        }]);
      });
    });

    context('when a participant has several schooling-registrations', () => {
      let campaign;
      beforeEach(async () => {
        const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const userId = databaseBuilder.factory.buildUser().id;
        campaign = databaseBuilder.factory.buildCampaign({ organizationId });
        const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          userId,
        }).id;
        databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId });
        databaseBuilder.factory.buildSchoolingRegistration({ organizationId, userId, firstName: 'John', lastName: 'Doe' });
        databaseBuilder.factory.buildSchoolingRegistration({ organizationId: otherOrganizationId, userId, firstName: 'Jane', lastName: 'Doe' });

        await databaseBuilder.commit();
      });

      it('return the first name and the last name of the correct schooling-registration', async () => {
        const campaignParticipationInfos = await campaignParticipationInfoRepository.findByCampaignId(campaign.id);

        expect(campaignParticipationInfos.length).to.equal(1);
        expect(campaignParticipationInfos[0].participantFirstName).to.equal('John');
        expect(campaignParticipationInfos[0].participantLastName).to.equal('Doe');
      });
    });

    context('when the participant has a schooling registration for the campaign\'s organization', () => {
      let schoolingRegistration;
      let campaign;
      beforeEach(async () => {
        const userId = databaseBuilder.factory.buildUser().id;
        campaign = databaseBuilder.factory.buildCampaign();
        const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          userId,
        }).id;
        databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId, state: 'started' });
        schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({
          organizationId: campaign.organizationId,
          userId,
          studentNumber: 'Pipon et Jambon',
          division: '6eme',
        });
        databaseBuilder.factory.buildSchoolingRegistration({
          userId,
          studentNumber: 'Yippee Ki Yay',
        });

        await databaseBuilder.commit();
      });

      it('should return the student number of the schooling registration associated to the given organization', async () => {

        // when
        const campaignParticipationInfos = await campaignParticipationInfoRepository.findByCampaignId(campaign.id);

        // then
        expect(campaignParticipationInfos[0].studentNumber).to.equal(schoolingRegistration.studentNumber);
      });

      it('should return the first name and last of the schooling registration associated to the given organization', async () => {

        // when
        const campaignParticipationInfos = await campaignParticipationInfoRepository.findByCampaignId(campaign.id);

        // then
        expect(campaignParticipationInfos[0].participantFirstName).to.equal(schoolingRegistration.firstName);
        expect(campaignParticipationInfos[0].participantLastName).to.equal(schoolingRegistration.lastName);
      });

      it('should return the division', async () => {

        // when
        const campaignParticipationInfos = await campaignParticipationInfoRepository.findByCampaignId(campaign.id);

        // then
        expect(campaignParticipationInfos[0].division).to.equal(schoolingRegistration.division);
      });
    });
  });

});
