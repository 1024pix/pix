const { expect, databaseBuilder, mockLearningContent, catchErr } = require('../../../test-helper');
const CampaignProfileRepository = require('../../../../lib/infrastructure/repositories/campaign-profile-repository');
const { PIX_COUNT_BY_LEVEL } = require('../../../../lib/domain/constants');
const { NotFoundError } = require('../../../../lib/domain/errors');
const { ENGLISH_SPOKEN, FRENCH_SPOKEN } = require('../../../../lib/domain/constants').LOCALE;

describe('Integration | Repository | CampaignProfileRepository', function() {
  const locale = FRENCH_SPOKEN;

  describe('#findProfile', function() {
    context('campaign participation infos', function() {
      beforeEach(function() {
        mockLearningContent({ areas: [], competences: [], skills: [] });
      });

      it('return the creation date, the sharing date and the participantExternalId', async function() {
        const campaignId = databaseBuilder.factory.buildCampaign().id;

        databaseBuilder.factory.buildCampaignParticipationWithUser({ firstName: 'Freddy', lastName: 'Krugger' }, { campaignId }, false);
        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipationWithUser(
          { firstName: 'Jason', lastName: 'Voorhees' },
          { campaignId, createdAt: new Date('2020-01-01'), sharedAt: new Date('2020-01-02'), participantExternalId: 'Friday the 13th' },
          false);

        await databaseBuilder.commit();

        const campaignProfile = await CampaignProfileRepository.findProfile({ campaignId, campaignParticipationId: campaignParticipation.id, locale });

        expect(campaignProfile.externalId).to.equal('Friday the 13th');
        expect(campaignProfile.createdAt).to.deep.equal(new Date('2020-01-01'));
        expect(campaignProfile.sharedAt).to.deep.equal(new Date('2020-01-02'));
      });

      it('return the campaignParticipationId and campaignId', async function() {
        const campaignId = databaseBuilder.factory.buildCampaign().id;

        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipationWithUser(
          { firstName: 'Jason', lastName: 'Voorhees' },
          { campaignId },
          false);

        await databaseBuilder.commit();

        const campaignProfile = await CampaignProfileRepository.findProfile({ campaignId, campaignParticipationId: campaignParticipation.id, locale });

        expect(campaignProfile.campaignParticipationId).to.equal(campaignParticipation.id);
        expect(campaignProfile.campaignId).to.equal(campaignId);
      });

      it('return the campaignParticipationId sharing status', async function() {
        const campaignId = databaseBuilder.factory.buildCampaign().id;

        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipationWithUser(
          { firstName: 'Jason', lastName: 'Voorhees' },
          { campaignId, createdAt: new Date('2020-01-01'), sharedAt: new Date('2020-01-02'), isShared: true, participantExternalId: 'Friday the 13th' },
          false);

        await databaseBuilder.commit();

        const campaignProfile = await CampaignProfileRepository.findProfile({ campaignId, campaignParticipationId: campaignParticipation.id, locale });

        expect(campaignProfile.isShared).to.equal(true);
      });

    });

    context('user infos', function() {
      beforeEach(function() {
        mockLearningContent({ areas: [], competences: [], skills: [] });
      });

      it('return the first name and last name of the participant', async function() {
        const campaignId = databaseBuilder.factory.buildCampaign().id;

        databaseBuilder.factory.buildCampaignParticipationWithUser({ firstName: 'Viggo', lastName: 'Tarasov' }, { campaignId }, false);
        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipationWithUser({ firstName: 'John', lastName: 'Shaft' }, { campaignId }, false);

        await databaseBuilder.commit();

        const campaignProfile = await CampaignProfileRepository.findProfile({ campaignId, campaignParticipationId: campaignParticipation.id, locale });

        expect(campaignProfile.firstName).to.equal('John');
        expect(campaignProfile.lastName).to.equal('Shaft');
      });
    });

    context('schooling registration infos', function() {
      beforeEach(function() {
        mockLearningContent({ areas: [], competences: [], skills: [] });
      });

      it('return the first name and last name of the schooling registration', async function() {
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
        const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipationWithSchoolingRegistration({ firstName: 'Greg', lastName: 'Duboire', organizationId }, { campaignId }).id;
        await databaseBuilder.commit();

        const campaignProfile = await CampaignProfileRepository.findProfile({ campaignId, campaignParticipationId, locale });

        expect(campaignProfile.firstName).to.equal('Greg');
        expect(campaignProfile.lastName).to.equal('Duboire');
      });

      it('return the first name and last name of the current schooling registration', async function() {
        const oldOrganizationId = databaseBuilder.factory.buildOrganization().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
        const campaignParticipationCreated = databaseBuilder.factory.buildCampaignParticipationWithSchoolingRegistration({ firstName: 'Greg', lastName: 'Duboire', organizationId }, { campaignId });
        databaseBuilder.factory.buildSchoolingRegistration({ firstName: 'Gregoire', lastName: 'Dub', organizationId: oldOrganizationId, userId: campaignParticipationCreated.userId });
        await databaseBuilder.commit();

        const campaignProfile = await CampaignProfileRepository.findProfile({ campaignId, campaignParticipationId: campaignParticipationCreated.id, locale });

        expect(campaignProfile.firstName).to.equal('Greg');
        expect(campaignProfile.lastName).to.equal('Duboire');
      });
    });

    context('certification infos', function() {
      beforeEach(function() {
        const learningContent = {
          areas: [{ id: 'recArea1', competenceIds: ['recArea1_Competence1'] }],
          competences: [
            { id: 'rec1', origin: 'Pix', areaId: 'recArea1', nameFrFr: 'French1', nameEnUs: 'English1' },
            { id: 'rec2', origin: 'Pix', areaId: 'recArea1', nameFrFr: 'French2', nameEnUs: 'English2' },
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

      it('return the number of competences', async function() {
        const campaignId = databaseBuilder.factory.buildCampaign().id;

        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipationWithUser({ firstName: 'John', lastName: 'Shaft' }, { campaignId, isShared: true }, false);

        await databaseBuilder.commit();

        const campaignProfile = await CampaignProfileRepository.findProfile({ campaignId, campaignParticipationId: campaignParticipation.id, locale });

        expect(campaignProfile.competencesCount).to.equal(2);
      });

      it('return the competences data according to given locale', async function() {
        const campaignId = databaseBuilder.factory.buildCampaign().id;

        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipationWithUser({ firstName: 'John', lastName: 'Shaft' }, { campaignId, isShared: true }, false);

        await databaseBuilder.commit();

        const campaignProfile = await CampaignProfileRepository.findProfile({ campaignId, campaignParticipationId: campaignParticipation.id, locale: ENGLISH_SPOKEN });

        const competenceNames = campaignProfile.competences.map((competence) => competence.name);
        expect(competenceNames).to.have.members(['English1', 'English2']);
      });

      it('return the number of competences certifiable', async function() {
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

        const campaignProfile = await CampaignProfileRepository.findProfile({ campaignId, campaignParticipationId: campaignParticipation.id, locale });

        expect(campaignProfile.certifiableCompetencesCount).to.equal(1);
      });

      it('return the total pix score', async function() {
        databaseBuilder.factory.buildCampaign().id;
        const campaignId = databaseBuilder.factory.buildCampaign().id;

        const user = databaseBuilder.factory.buildUser({ firstName: 'John', lastName: 'Shaft' });
        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({ campaignId,
          userId: user.id,
          sharedAt: new Date('2020-01-02'),
          isShared: true,
          pixScore: 80,
        });
        databaseBuilder.factory.buildKnowledgeElement({ userId: user.id,
          earnedPix: 1024,
          skillId: 'rec12',
          competenceId: 'rec1',
          createdAt: new Date('2020-01-01'),
        });
        databaseBuilder.factory.buildKnowledgeElement({ userId: user.id,
          earnedPix: 1024,
          skillId: 'rec22',
          competenceId: 'rec2',
          createdAt: new Date('2020-01-01'),
        });

        await databaseBuilder.commit();

        const campaignProfile = await CampaignProfileRepository.findProfile({ campaignId, campaignParticipationId: campaignParticipation.id, locale });

        expect(campaignProfile.pixScore).to.equal(80);
      });

      it('computes certifiable competences acquired before the sharing date of the campaign participation', async function() {
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

        const campaignProfile = await CampaignProfileRepository.findProfile({ campaignId, campaignParticipationId: campaignParticipation.id, locale });

        expect(campaignProfile.certifiableCompetencesCount).to.equal(1);
      });
    });

    context('when there is no campaign-participation with the given id', function() {
      beforeEach(function() {
        mockLearningContent({ areas: [], competences: [], skills: [] });
      });

      it('throws an NotFoundError error', async function() {
        const error = await catchErr(CampaignProfileRepository.findProfile)({ campaignId: 1, campaignParticipationId: 2, locale });

        expect(error).to.be.an.instanceof(NotFoundError);
        expect(error.message).to.equal('There is no campaign participation with the id "2"');
      });
    });

    context('when there is no campaign-participation with the given id for the given campaign', function() {
      beforeEach(function() {
        mockLearningContent({ areas: [], competences: [], skills: [] });
      });

      it('throws an NotFoundError error', async function() {
        const campaignId = databaseBuilder.factory.buildCampaign({ id: 1 }).id;

        const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipationWithUser({ firstName: 'John', lastName: 'Shaft' }, { id: 3, campaignId }, false).id;

        await databaseBuilder.commit();
        const error = await catchErr(CampaignProfileRepository.findProfile)({ campaignId: 2, campaignParticipationId, locale });

        expect(error).to.be.an.instanceof(NotFoundError);
        expect(error.message).to.equal(`There is no campaign participation with the id "${campaignParticipationId}"`);
      });
    });
  });
});

