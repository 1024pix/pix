const { expect, databaseBuilder, mockLearningContent, catchErr } = require('../../../test-helper');
const CampaignProfileRepository = require('../../../../lib/infrastructure/repositories/campaign-profile-repository');
const { PIX_COUNT_BY_LEVEL } = require('../../../../lib/domain/constants');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | CampaignProfileRepository', function() {
  describe('#findProfile', () => {
    context('campaign participation infos', () => {
      beforeEach(() => {
        mockLearningContent({ areas: [], competences: [], skills: [] });
      });

      it('return the creation date, the sharing date and the participantExternalId', async () => {
        const campaignId = databaseBuilder.factory.buildCampaign().id;

        databaseBuilder.factory.buildCampaignParticipationWithUser({ firstName: 'Freddy', lastName: 'Krugger' }, { campaignId }, false);
        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipationWithUser(
          { firstName: 'Jason', lastName: 'Voorhees' },
          { campaignId, createdAt: new Date('2020-01-01'), sharedAt: new Date('2020-01-02'), participantExternalId: 'Friday the 13th' },
          false);

        await databaseBuilder.commit();

        const campaignProfile = await CampaignProfileRepository.findProfile(campaignId, campaignParticipation.id);

        expect(campaignProfile.externalId).to.equal('Friday the 13th');
        expect(campaignProfile.createdAt).to.deep.equal(new Date('2020-01-01'));
        expect(campaignProfile.sharedAt).to.deep.equal(new Date('2020-01-02'));
      });

      it('return the campaignParticipationId and campaignId', async () => {
        const campaignId = databaseBuilder.factory.buildCampaign().id;

        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipationWithUser(
          { firstName: 'Jason', lastName: 'Voorhees' },
          { campaignId },
          false);

        await databaseBuilder.commit();

        const campaignProfile = await CampaignProfileRepository.findProfile(campaignId, campaignParticipation.id);

        expect(campaignProfile.campaignParticipationId).to.equal(campaignParticipation.id);
        expect(campaignProfile.campaignId).to.equal(campaignId);
      });

      it('return the campaignParticipationId sharing status', async () => {
        const campaignId = databaseBuilder.factory.buildCampaign().id;

        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipationWithUser(
          { firstName: 'Jason', lastName: 'Voorhees' },
          { campaignId, createdAt: new Date('2020-01-01'), sharedAt: new Date('2020-01-02'), isShared: true, participantExternalId: 'Friday the 13th' },
          false);

        await databaseBuilder.commit();

        const campaignProfile = await CampaignProfileRepository.findProfile(campaignId, campaignParticipation.id);

        expect(campaignProfile.isShared).to.equal(true);
      });

    });

    context('user infos', () => {
      beforeEach(() => {
        mockLearningContent({ areas: [], competences: [], skills: [] });
      });

      it('return the first name and last name of the participant', async () => {
        const campaignId = databaseBuilder.factory.buildCampaign().id;

        databaseBuilder.factory.buildCampaignParticipationWithUser({ firstName: 'Viggo', lastName: 'Tarasov' }, { campaignId }, false);
        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipationWithUser({ firstName: 'John', lastName: 'Shaft' }, { campaignId }, false);

        await databaseBuilder.commit();

        const campaignProfile = await CampaignProfileRepository.findProfile(campaignId, campaignParticipation.id);

        expect(campaignProfile.firstName).to.equal('John');
        expect(campaignProfile.lastName).to.equal('Shaft');
      });
    });

    context('schooling registration infos', () => {
      beforeEach(() => {
        mockLearningContent({ areas: [], competences: [], skills: [] });
      });

      it('return the first name and last name of the schooling registration', async () => {
        const campaignId = databaseBuilder.factory.buildCampaign().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipationWithSchoolingRegistration({ firstName: 'Greg', lastName: 'Duboire', organizationId }, { campaignId }).id;
        await databaseBuilder.commit();

        const campaignProfile = await CampaignProfileRepository.findProfile(campaignId, campaignParticipationId);

        expect(campaignProfile.firstName).to.equal('Greg');
        expect(campaignProfile.lastName).to.equal('Duboire');
      });
    });

    context('certification infos', () => {
      beforeEach(() => {
        const learningContent = {
          areas: [{ id: 'recArea1', competenceIds: ['recArea1_Competence1'] }],
          competences: [
            { id: 'rec1', origin: 'Pix', areaId: 'recArea1' },
            { id: 'rec2', origin: 'Pix', areaId: 'recArea1' },
            { id: 'rec3', origin: 'Other', areaId: 'recArea1' },
          ],
          skills: [{
            id: 'recSkill1',
            status: 'actif',
            competenceId: 'rec1',
          }, {
            id: 'recSkill2',
            status: 'actif',
            competenceId: 'rec2',
          }, {
            id: 'recSkill3',
            status: 'actif',
            competenceId: 'rec3',
          }],
        };

        mockLearningContent(learningContent);
      });

      it('return the number of competences', async () => {
        const campaignId = databaseBuilder.factory.buildCampaign().id;

        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipationWithUser({ firstName: 'John', lastName: 'Shaft' }, { campaignId, isShared: true }, false);

        await databaseBuilder.commit();

        const campaignProfile = await CampaignProfileRepository.findProfile(campaignId, campaignParticipation.id);

        expect(campaignProfile.competencesCount).to.equal(2);
      });

      it('return the number of competences certifiable', async () => {
        databaseBuilder.factory.buildCampaign().id;
        const campaignId = databaseBuilder.factory.buildCampaign().id;

        const user = databaseBuilder.factory.buildUser({ firstName: 'John', lastName: 'Shaft' });
        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({ campaignId,
          userId: user.id,
          sharedAt: new Date('2020-01-02'),
          isShared: true });
        databaseBuilder.factory.buildKnowledgeElement({ userId: user.id,
          earnedPix: PIX_COUNT_BY_LEVEL,
          competenceId: 'rec1',
          createdAt: new Date('2020-01-01'),
        });

        await databaseBuilder.commit();

        const campaignProfile = await CampaignProfileRepository.findProfile(campaignId, campaignParticipation.id);

        expect(campaignProfile.certifiableCompetencesCount).to.equal(1);
      });

      it('return the total pix score limited to MAX_REACHABLE_PIX_BY_COMPETENCE', async () => {
        databaseBuilder.factory.buildCampaign().id;
        const campaignId = databaseBuilder.factory.buildCampaign().id;

        const user = databaseBuilder.factory.buildUser({ firstName: 'John', lastName: 'Shaft' });
        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({ campaignId,
          userId: user.id,
          sharedAt: new Date('2020-01-02'),
          isShared: true,
        });
        databaseBuilder.factory.buildKnowledgeElement({ userId: user.id,
          earnedPix: 1024,
          competenceId: 'rec1',
          createdAt: new Date('2020-01-01'),
        });
        databaseBuilder.factory.buildKnowledgeElement({ userId: user.id,
          earnedPix: 1024,
          competenceId: 'rec2',
          createdAt: new Date('2020-01-01'),
        });

        await databaseBuilder.commit();

        const campaignProfile = await CampaignProfileRepository.findProfile(campaignId, campaignParticipation.id);

        expect(campaignProfile.pixScore).to.equal(80);
      });

      it('computes certification informations with knowledge elements acquired before the sharing date of the campaign participation', async () => {
        databaseBuilder.factory.buildCampaign().id;
        const campaignId = databaseBuilder.factory.buildCampaign().id;

        const user = databaseBuilder.factory.buildUser({ firstName: 'John', lastName: 'Shaft' });
        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({ campaignId,
          userId: user.id,
          sharedAt: new Date('2020-01-02'),
          isShared: true,
        });
        databaseBuilder.factory.buildKnowledgeElement({ userId: user.id,
          earnedPix: PIX_COUNT_BY_LEVEL,
          competenceId: 'rec1',
          createdAt: new Date('2020-01-01'),
        });
        databaseBuilder.factory.buildKnowledgeElement({ userId: user.id,
          earnedPix: PIX_COUNT_BY_LEVEL * 2,
          competenceId: 'rec2',
          createdAt: new Date('2020-01-03'),
        });

        await databaseBuilder.commit();

        const campaignProfile = await CampaignProfileRepository.findProfile(campaignId, campaignParticipation.id);

        expect(campaignProfile.pixScore).to.equal(PIX_COUNT_BY_LEVEL);
        expect(campaignProfile.certifiableCompetencesCount).to.equal(1);
      });
    });

    context('when there is no campaign-participation with the given id', () => {
      beforeEach(() => {
        mockLearningContent({ areas: [], competences: [], skills: [] });
      });

      it('throws an NotFoundError error', async () => {
        const error = await catchErr(CampaignProfileRepository.findProfile)(1, 2);

        expect(error).to.be.an.instanceof(NotFoundError);
        expect(error.message).to.equal('There is no campaign participation with the id "2"');
      });
    });

    context('when there is no campaign-participation with the given id for the given campaign', () => {
      beforeEach(() => {
        mockLearningContent({ areas: [], competences: [], skills: [] });
      });

      it('throws an NotFoundError error', async () => {
        const campaignId = databaseBuilder.factory.buildCampaign({ id: 1 }).id;

        const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipationWithUser({ firstName: 'John', lastName: 'Shaft' }, { id: 3, campaignId }, false).id;

        await databaseBuilder.commit();
        const error = await catchErr(CampaignProfileRepository.findProfile)(2, campaignParticipationId);

        expect(error).to.be.an.instanceof(NotFoundError);
        expect(error.message).to.equal(`There is no campaign participation with the id "${campaignParticipationId}"`);
      });
    });
  });
});

