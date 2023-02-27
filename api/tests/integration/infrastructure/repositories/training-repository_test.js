const { expect, databaseBuilder, domainBuilder, catchErr, knex, mockLearningContent } = require('../../../test-helper');
const trainingRepository = require('../../../../lib/infrastructure/repositories/training-repository');
const { NotFoundError } = require('../../../../lib/domain/errors');
const TrainingSummary = require('../../../../lib/domain/read-models/TrainingSummary');
const Training = require('../../../../lib/domain/models/Training');
const UserRecommendedTraining = require('../../../../lib/domain/read-models/UserRecommendedTraining');
const TrainingTrigger = require('../../../../lib/domain/models/TrainingTrigger');

describe('Integration | Repository | training-repository', function () {
  describe('#get', function () {
    context('when training exist', function () {
      it('should return training', async function () {
        // given
        const targetProfile1 = databaseBuilder.factory.buildTargetProfile();
        const targetProfile2 = databaseBuilder.factory.buildTargetProfile();
        const expectedTraining = domainBuilder.buildTraining({
          id: 1,
          title: 'training 1',
          targetProfileIds: [targetProfile1.id, targetProfile2.id],
          locale: 'fr-fr',
        });
        databaseBuilder.factory.buildTraining({ ...expectedTraining, duration: '5h' });
        databaseBuilder.factory.buildTargetProfileTraining({
          trainingId: expectedTraining.id,
          targetProfileId: expectedTraining.targetProfileIds[0],
        });
        databaseBuilder.factory.buildTargetProfileTraining({
          trainingId: expectedTraining.id,
          targetProfileId: expectedTraining.targetProfileIds[1],
        });
        await databaseBuilder.commit();

        // when
        const training = await trainingRepository.get({ trainingId: expectedTraining.id });

        // then
        expect(training).to.deep.equal(expectedTraining);
      });
    });

    context('when training does not exist', function () {
      it('should throw a NotFoundError', async function () {
        // when
        const error = await catchErr(trainingRepository.get)({ trainingId: 134 });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.be.equal('Not found training for ID 134');
      });
    });
  });

  describe('#getWithTriggers', function () {
    let tube;

    beforeEach(async function () {
      tube = domainBuilder.buildTube({
        id: 'recTube0',
        name: 'tubeName',
        title: 'tubeTitle',
        description: 'tubeDescription',
        practicalTitle: 'translatedPracticalTitle',
        practicalDescription: 'translatedPracticalDescription',
        isMobileCompliant: true,
        isTabletCompliant: true,
        competenceId: 'recCompetence0',
        thematicId: 'thematicCoucou',
        skillIds: ['skillSuper', 'skillGenial'],
        skills: [],
      });
      const learningContent = {
        tubes: [
          {
            id: 'recTube0',
            name: 'tubeName',
            title: 'tubeTitle',
            description: 'tubeDescription',
            practicalTitle_i18n: {
              fr: 'translatedPracticalTitle',
            },
            practicalDescription_i18n: {
              fr: 'translatedPracticalDescription',
            },
            isMobileCompliant: true,
            isTabletCompliant: true,
            competenceId: 'recCompetence0',
            thematicId: 'thematicCoucou',
            skillIds: ['skillSuper', 'skillGenial'],
          },
        ],
      };
      mockLearningContent(learningContent);
    });

    it('should throw an error when training does not exist', async function () {
      // when
      const error = await catchErr(trainingRepository.getWithTriggers)({ trainingId: 134 });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.be.equal('Not found training for ID 134');
    });

    it('should return training with triggers', async function () {
      // given
      const training = databaseBuilder.factory.buildTraining();
      const trainingTrigger = databaseBuilder.factory.buildTrainingTrigger({ trainingId: training.id });
      const trainingTriggerTube = databaseBuilder.factory.buildTrainingTriggerTube({
        trainingTriggerId: trainingTrigger.id,
        tubeId: tube.id,
      });
      await databaseBuilder.commit();

      // when
      const result = await trainingRepository.getWithTriggers({ trainingId: training.id });

      // then
      expect(result).to.be.instanceOf(Training);
      expect(result.triggers).to.have.lengthOf(1);
      expect(result.triggers[0]).to.be.instanceOf(TrainingTrigger);
      expect(result.triggers[0].id).to.deep.equal(trainingTrigger.id);
      expect(result.triggers[0].threshold).to.deep.equal(trainingTrigger.threshold);
      expect(result.triggers[0].type).to.deep.equal(trainingTrigger.type);
      expect(result.triggers[0].triggerTubes).to.have.lengthOf(1);
      expect(result.triggers[0].triggerTubes[0].id).to.deep.equal(trainingTriggerTube.id);
      expect(result.triggers[0].triggerTubes[0].tube.name).to.deep.equal(tube.name);
      expect(result.triggers[0].triggerTubes[0].level).to.deep.equal(trainingTriggerTube.level);
    });
  });

  describe('#findPaginatedSummaries', function () {
    context('when trainings exist', function () {
      it('should return paginated results', async function () {
        // given
        const trainingSummary1 = domainBuilder.buildTrainingSummary({ id: 1 });
        const trainingSummary2 = domainBuilder.buildTrainingSummary({ id: 2 });
        const trainingSummary3 = domainBuilder.buildTrainingSummary({ id: 3 });

        databaseBuilder.factory.buildTraining({ ...trainingSummary1 });
        databaseBuilder.factory.buildTraining({ ...trainingSummary2 });
        databaseBuilder.factory.buildTraining({ ...trainingSummary3 });

        await databaseBuilder.commit();
        const page = { size: 2, number: 2 };

        // when
        const { trainings, pagination } = await trainingRepository.findPaginatedSummaries({ page });

        // then
        expect(trainings).to.have.lengthOf(1);
        expect(trainings[0]).to.be.instanceOf(TrainingSummary);
        expect(trainings[0]).to.deep.equal(trainingSummary3);
        expect(pagination).to.deep.equal({ page: 2, pageSize: 2, rowCount: 3, pageCount: 2 });
      });
    });

    context("when trainings don't exist", function () {
      it('should return an empty array', async function () {
        // given
        const page = { size: 2, number: 1 };

        // when
        const { trainings, pagination } = await trainingRepository.findPaginatedSummaries({ page });

        // then
        expect(trainings).to.deep.equal([]);
        expect(pagination).to.deep.equal({ page: 1, pageSize: 2, rowCount: 0, pageCount: 0 });
      });
    });
  });

  describe('#findByCampaignParticipationIdAndLocale', function () {
    it('should find trainings by campaignParticipationId and locale', async function () {
      // given
      const targetProfile1 = databaseBuilder.factory.buildTargetProfile();
      const targetProfile2 = databaseBuilder.factory.buildTargetProfile();
      const campaign = databaseBuilder.factory.buildCampaign({
        targetProfileId: targetProfile1.id,
      });
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
      });
      const training1 = domainBuilder.buildTraining({
        id: 1,
        title: 'training 1',
        targetProfileIds: [targetProfile1.id],
        locale: 'fr-fr',
      });
      const training2 = domainBuilder.buildTraining({
        id: 2,
        title: 'training 2',
        targetProfileIds: [targetProfile1.id],
        locale: 'fr-fr',
      });
      const trainingWithDifferentLocale = domainBuilder.buildTraining({
        id: 3,
        title: 'training 3',
        targetProfileIds: [targetProfile1.id],
        locale: 'en-gb',
      });
      const trainingWithDifferentTargetProfile = domainBuilder.buildTraining({
        id: 4,
        title: 'training 4',
        targetProfileIds: [targetProfile2.id],
        locale: 'fr-fr',
      });

      databaseBuilder.factory.buildTraining({ ...training1, duration: '5h' });
      databaseBuilder.factory.buildTraining({ ...training2, duration: '5h' });
      databaseBuilder.factory.buildTraining({ ...trainingWithDifferentLocale, duration: '5h' });
      databaseBuilder.factory.buildTraining({ ...trainingWithDifferentTargetProfile, duration: '5h' });

      databaseBuilder.factory.buildTargetProfileTraining({
        trainingId: training1.id,
        targetProfileId: training1.targetProfileIds[0],
      });

      databaseBuilder.factory.buildTargetProfileTraining({
        trainingId: training2.id,
        targetProfileId: training2.targetProfileIds[0],
      });

      databaseBuilder.factory.buildTargetProfileTraining({
        trainingId: trainingWithDifferentLocale.id,
        targetProfileId: trainingWithDifferentLocale.targetProfileIds[0],
      });

      databaseBuilder.factory.buildTargetProfileTraining({
        trainingId: trainingWithDifferentTargetProfile.id,
        targetProfileId: trainingWithDifferentTargetProfile.targetProfileIds[0],
      });

      await databaseBuilder.commit();

      // when
      const trainings = await trainingRepository.findByCampaignParticipationIdAndLocale({
        campaignParticipationId: campaignParticipation.id,
        locale: 'fr-fr',
      });

      // then
      expect(trainings).to.have.lengthOf(2);
      expect(trainings[0]).to.be.instanceOf(Training);
      expect(trainings[0]).to.deep.equal(training1);
    });

    it('should return an empty array when campaign has target-profile not linked to training', async function () {
      // given
      const targetProfile1 = databaseBuilder.factory.buildTargetProfile();
      const targetProfile2 = databaseBuilder.factory.buildTargetProfile();
      const campaign = databaseBuilder.factory.buildCampaign({
        targetProfileId: targetProfile1.id,
      });
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
      });
      const training = domainBuilder.buildTraining({
        id: 1,
        title: 'training 1',
        targetProfileIds: [targetProfile2.id],
        locale: 'fr-fr',
      });

      databaseBuilder.factory.buildTraining({ ...training, duration: '5h' });

      databaseBuilder.factory.buildTargetProfileTraining({
        trainingId: training.id,
        targetProfileId: training.targetProfileIds[0],
      });

      await databaseBuilder.commit();

      // when
      const trainings = await trainingRepository.findByCampaignParticipationIdAndLocale({
        campaignParticipationId: campaignParticipation.id,
        locale: 'fr-fr',
      });

      // then
      expect(trainings).to.have.lengthOf(0);
    });
  });

  describe('#create', function () {
    afterEach(async function () {
      await databaseBuilder.knex('trainings').delete();
    });

    it('should create a training', async function () {
      // given
      const training = {
        title: 'Titre du training',
        link: 'https://training-link.org',
        type: 'webinaire',
        duration: '6h',
        locale: 'fr',
        editorName: 'Un ministère',
        editorLogoUrl: 'https://mon-logo.svg',
      };

      // when
      const createdTraining = await trainingRepository.create({ training });

      // then
      expect(createdTraining).to.be.instanceOf(Training);
      expect(createdTraining.id).to.exist;
      expect(createdTraining).to.deep.include({ ...training, duration: { hours: 6 } });
    });
  });

  describe('#update', function () {
    it('should update given attributes', async function () {
      // given
      const training = databaseBuilder.factory.buildTraining({ updatedAt: new Date('2022-01-14') });
      await databaseBuilder.commit();
      const currentTraining = await knex('trainings').where({ id: training.id }).first();

      const attributesToUpdate = {
        title: 'Mon nouveau titre',
        link: 'https://example.net/mon-nouveau-lien',
        editorName: 'Mon nouvel editeur',
        editorLogoUrl: 'https://images.pix.fr/contenu-formatif/editeur/nouveau-logo.svg',
        notExistingAttribute: 'notExistingValue',
      };

      // when
      await trainingRepository.update({ id: training.id, attributesToUpdate });

      // then
      const updatedTraining = await knex('trainings').where({ id: training.id }).first();
      expect(updatedTraining.title).to.equal(attributesToUpdate.title);
      expect(updatedTraining.link).to.equal(attributesToUpdate.link);
      expect(updatedTraining.locale).to.equal(training.locale);
      expect(updatedTraining.type).to.equal(training.type);
      expect(updatedTraining.editorName).to.be.equal(attributesToUpdate.editorName);
      expect(updatedTraining.editorLogoUrl).to.be.equal(attributesToUpdate.editorLogoUrl);
      expect(updatedTraining.updatedAt).to.be.above(currentTraining.updatedAt);
    });

    it('should return updated training', async function () {
      // given
      const training = databaseBuilder.factory.buildTraining();
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      databaseBuilder.factory.buildTargetProfileTraining({
        targetProfileId: targetProfile.id,
        trainingId: training.id,
      });
      await databaseBuilder.commit();

      const attributesToUpdate = {
        title: 'Mon nouveau titre',
        link: 'https://example.net/mon-nouveau-lien',
        editorName: 'Mon nouvel editeur',
        editorLogoUrl: 'https://images.pix.fr/contenu-formatif/editeur/nouveau-logo.svg',
      };

      // when
      const updatedTraining = await trainingRepository.update({ id: training.id, attributesToUpdate });

      // then
      expect(updatedTraining).to.be.instanceOf(Training);
      expect(updatedTraining.title).to.equal(attributesToUpdate.title);
      expect(updatedTraining.link).to.equal(attributesToUpdate.link);
      expect(updatedTraining.editorName).to.be.equal(attributesToUpdate.editorName);
      expect(updatedTraining.editorLogoUrl).to.be.equal(attributesToUpdate.editorLogoUrl);
      expect(updatedTraining.targetProfileIds).to.deep.equal([targetProfile.id]);
    });

    it('should not update other raws', async function () {
      // given
      const training = databaseBuilder.factory.buildTraining();
      const trainingNotToBeUpdated = databaseBuilder.factory.buildTraining();
      await databaseBuilder.commit();

      const attributesToUpdate = {
        title: 'Mon nouveau titre',
        link: 'https://example.net/mon-nouveau-lien',
        editorName: 'Mon nouvel editeur',
        editorLogoUrl: 'https://images.pix.fr/contenu-formatif/editeur/nouveau-logo.svg',
        prerequisiteThreshold: 10,
        goalThreshold: 20,
      };

      // when
      await trainingRepository.update({ id: training.id, attributesToUpdate });

      // then
      const trainingNotUpdated = await knex('trainings')
        .select('title', 'link', 'editorName', 'editorLogoUrl', 'prerequisiteThreshold', 'goalThreshold')
        .where({ id: trainingNotToBeUpdated.id })
        .first();
      expect(trainingNotUpdated.title).to.equal(trainingNotToBeUpdated.title);
      expect(trainingNotUpdated.link).to.equal(trainingNotToBeUpdated.link);
      expect(trainingNotUpdated.editorName).to.equal(trainingNotToBeUpdated.editorName);
      expect(trainingNotUpdated.editorLogoUrl).to.equal(trainingNotToBeUpdated.editorLogoUrl);
      expect(trainingNotUpdated.prerequisiteThreshold).to.equal(trainingNotToBeUpdated.prerequisiteThreshold);
      expect(trainingNotUpdated.goalThreshold).to.equal(trainingNotToBeUpdated.goalThreshold);
    });
  });

  describe('#findPaginatedByUserId', function () {
    it('should return paginated trainings related to given userId', async function () {
      // given
      const { userId, id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation();
      const { id: campaignParticipationId2 } = databaseBuilder.factory.buildCampaignParticipation({ userId });
      const { userId: anotherUserId, id: anotherCampaignParticipationId } =
        databaseBuilder.factory.buildCampaignParticipation();
      const training1 = databaseBuilder.factory.buildTraining();
      const training2 = databaseBuilder.factory.buildTraining();
      const training3 = databaseBuilder.factory.buildTraining();
      const training4 = databaseBuilder.factory.buildTraining();
      const trainingWithAnotherLocale = databaseBuilder.factory.buildTraining({ locale: 'en-gb' });
      databaseBuilder.factory.buildUserRecommendedTraining({
        userId,
        trainingId: training1.id,
        campaignParticipationId,
      });
      databaseBuilder.factory.buildUserRecommendedTraining({
        userId,
        trainingId: training1.id,
        campaignParticipationId: campaignParticipationId2,
      });
      databaseBuilder.factory.buildUserRecommendedTraining({
        userId,
        trainingId: training2.id,
        campaignParticipationId,
      });
      databaseBuilder.factory.buildUserRecommendedTraining({
        userId,
        trainingId: training3.id,
        campaignParticipationId,
      });
      databaseBuilder.factory.buildUserRecommendedTraining({
        userId,
        trainingId: training4.id,
        campaignParticipationId,
      });
      databaseBuilder.factory.buildUserRecommendedTraining({
        userId,
        trainingId: trainingWithAnotherLocale.id,
        campaignParticipationId,
      });
      databaseBuilder.factory.buildUserRecommendedTraining({
        userId: anotherUserId,
        trainingId: training2.id,
        campaignParticipationId: anotherCampaignParticipationId,
      });
      await databaseBuilder.commit();

      const page = { size: 2, number: 2 };

      // when
      const { userRecommendedTrainings, pagination } = await trainingRepository.findPaginatedByUserId({
        userId,
        locale: 'fr-fr',
        page,
      });

      // then
      expect(userRecommendedTrainings).to.be.lengthOf(2);
      expect(userRecommendedTrainings[0]).to.be.instanceOf(UserRecommendedTraining);
      expect(userRecommendedTrainings).to.deep.equal([
        new UserRecommendedTraining({ ...training3, duration: { hours: 6 } }),
        new UserRecommendedTraining({ ...training4, duration: { hours: 6 } }),
      ]);
      expect(pagination).to.equal(pagination);
    });

    it('should return an empty array when given user does not have recommended trainings', async function () {
      // given
      const { userId, id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation();
      const training1 = databaseBuilder.factory.buildTraining();
      databaseBuilder.factory.buildUserRecommendedTraining({
        userId,
        trainingId: training1.id,
        campaignParticipationId,
      });
      await databaseBuilder.commit();

      // when
      const { userRecommendedTrainings, pagination } = await trainingRepository.findPaginatedByUserId({
        userId: '0293',
        locale: 'fr-fr',
      });

      // then
      expect(userRecommendedTrainings).to.be.lengthOf(0);
      expect(pagination).to.deep.equal({ page: 1, pageSize: 10, rowCount: 0, pageCount: 0 });
    });
  });
});
