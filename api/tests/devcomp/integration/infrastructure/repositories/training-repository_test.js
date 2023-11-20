import {
  catchErr,
  databaseBuilder,
  domainBuilder,
  expect,
  knex,
  mockLearningContent,
} from '../../../../test-helper.js';

import * as trainingRepository from '../../../../../src/devcomp/infrastructure/repositories/training-repository.js';
import { NotFoundError } from '../../../../../lib/domain/errors.js';
import { TrainingSummary } from '../../../../../src/devcomp/domain/read-models/TrainingSummary.js';
import { Training } from '../../../../../lib/domain/models/Training.js';
import { UserRecommendedTraining } from '../../../../../lib/domain/read-models/UserRecommendedTraining.js';
import { TrainingTriggerForAdmin } from '../../../../../src/devcomp/domain/read-models/TrainingTriggerForAdmin.js';
import { TrainingForAdmin } from '../../../../../src/devcomp/domain/read-models/TrainingForAdmin.js';
import { TrainingTrigger } from '../../../../../src/devcomp/domain/models/TrainingTrigger.js';
import { TrainingTriggerTube } from '../../../../../src/devcomp/domain/models/TrainingTriggerTube.js';
import _ from 'lodash';

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

  describe('#getWithTriggersForAdmin', function () {
    let area1;
    let competence1;
    let thematic1;
    let tube;

    beforeEach(async function () {
      area1 = domainBuilder.buildArea({ id: 'recAreaA' });
      competence1 = domainBuilder.buildCompetence({ id: 'recCompA', areaId: 'recAreaA' });
      const competenceInAnotherArea = domainBuilder.buildCompetence({ id: 'recCompB', areaId: 'recAreaB' });
      thematic1 = domainBuilder.buildThematic({
        id: 'recThemA',
        name: 'thematic1_name',
        competenceId: 'recCompA',
      });
      const thematicInAnotherCompetence = domainBuilder.buildThematic({
        id: 'recThemB',
        name: 'thematic2_name',
        competenceId: 'anotherCompetence',
      });
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
        thematicId: 'recThemA',
        skillIds: ['skillSuper', 'skillGenial'],
        skills: [],
      });
      const learningContent = {
        areas: [area1],
        competences: [competence1, competenceInAnotherArea],
        thematics: [
          { id: thematic1.id, name_i18n: { fr: thematic1.name }, competenceId: thematic1.competenceId },
          {
            id: thematicInAnotherCompetence.id,
            name_i18n: { fr: thematicInAnotherCompetence.name },
            competenceId: thematicInAnotherCompetence.competenceId,
          },
        ],
        tubes: [
          {
            id: tube.id,
            name: tube.name,
            thematicId: 'recThemA',
            skillIds: ['skillSuper', 'skillGenial'],
          },
        ],
      };
      mockLearningContent(learningContent);
    });

    it('should throw an error when training does not exist', async function () {
      // when
      const error = await catchErr(trainingRepository.getWithTriggersForAdmin)({ trainingId: 134 });

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
      const result = await trainingRepository.getWithTriggersForAdmin({ trainingId: training.id });

      // then
      expect(result).to.be.instanceOf(TrainingForAdmin);
      expect(result.trainingTriggers).to.have.lengthOf(1);
      expect(result.trainingTriggers[0]).to.be.instanceOf(TrainingTriggerForAdmin);
      expect(result.trainingTriggers[0].id).to.deep.equal(trainingTrigger.id);
      expect(result.trainingTriggers[0].threshold).to.deep.equal(trainingTrigger.threshold);
      expect(result.trainingTriggers[0].type).to.deep.equal(trainingTrigger.type);
      expect(result.trainingTriggers[0].areas).to.have.lengthOf(1);
      expect(result.trainingTriggers[0].areas[0].id).to.equal(`${area1.id}_${trainingTrigger.id}`);
      expect(result.trainingTriggers[0].areas[0].competences).to.have.lengthOf(1);
      expect(result.trainingTriggers[0].areas[0].competences[0].id).to.equal(`${competence1.id}_${trainingTrigger.id}`);
      expect(result.trainingTriggers[0].areas[0].competences[0].thematics).to.have.lengthOf(1);
      expect(result.trainingTriggers[0].areas[0].competences[0].thematics[0].id).to.equal(
        `${thematic1.id}_${trainingTrigger.id}`,
      );
      expect(result.trainingTriggers[0].areas[0].competences[0].thematics[0].triggerTubes).to.have.lengthOf(1);
      expect(result.trainingTriggers[0].areas[0].competences[0].thematics[0].triggerTubes[0].id).to.deep.equal(
        trainingTriggerTube.id,
      );
      expect(result.trainingTriggers[0].areas[0].competences[0].thematics[0].triggerTubes[0].tube.name).to.deep.equal(
        tube.name,
      );
      expect(result.trainingTriggers[0].areas[0].competences[0].thematics[0].triggerTubes[0].level).to.deep.equal(
        trainingTriggerTube.level,
      );
    });
  });

  describe('#findPaginatedSummaries', function () {
    context('when trainings exist', function () {
      it('should return paginated results', async function () {
        // given
        const trainingSummary1 = domainBuilder.buildTrainingSummary({
          id: 1,
          prerequisiteThreshold: 0,
          goalThreshold: 100,
          targetProfilesCount: 2,
        });
        const trainingSummary2 = domainBuilder.buildTrainingSummary({
          id: 2,
          prerequisiteThreshold: 10,
          goalThreshold: 90,
        });
        const trainingSummary3 = domainBuilder.buildTrainingSummary({
          id: 3,
          prerequisiteThreshold: undefined,
          goalThreshold: undefined,
        });

        createDatabaseRepresentationForTrainingSummary({ trainingSummary: trainingSummary1, databaseBuilder });
        createDatabaseRepresentationForTrainingSummary({ trainingSummary: trainingSummary2, databaseBuilder });
        createDatabaseRepresentationForTrainingSummary({ trainingSummary: trainingSummary3, databaseBuilder });

        await databaseBuilder.commit();
        const filter = {};
        const page = { size: 2, number: 1 };

        // when
        const { trainings, pagination } = await trainingRepository.findPaginatedSummaries({ filter, page });

        // then
        expect(trainings).to.have.lengthOf(2);
        expect(trainings[0]).to.be.instanceOf(TrainingSummary);
        expect(trainings[0]).to.deep.equal(trainingSummary1);
        expect(trainings[1]).to.deep.equal(trainingSummary2);
        expect(pagination).to.deep.equal({ page: 1, pageSize: 2, rowCount: 3, pageCount: 2 });
      });

      it('should return filtered by id result', async function () {
        // given
        const trainingSummary1 = domainBuilder.buildTrainingSummary({ id: 1 });
        const trainingSummary2 = domainBuilder.buildTrainingSummary({ id: 2 });
        const trainingSummary3 = domainBuilder.buildTrainingSummary({ id: 3 });

        databaseBuilder.factory.buildTraining({ ...trainingSummary1 });
        databaseBuilder.factory.buildTraining({ ...trainingSummary2 });
        databaseBuilder.factory.buildTraining({ ...trainingSummary3 });

        await databaseBuilder.commit();
        const filter = { id: 2 };
        const page = {};

        // when
        const { trainings } = await trainingRepository.findPaginatedSummaries({ filter, page });

        // then
        expect(trainings).to.have.lengthOf(1);
        expect(trainings[0]).to.be.instanceOf(TrainingSummary);
        expect(trainings[0]).to.deep.equal(trainingSummary2);
      });

      it('should return filtered by title results', async function () {
        // given
        const trainingSummary1 = domainBuilder.buildTrainingSummary({ id: 1, title: 'test' });
        const trainingSummary2 = domainBuilder.buildTrainingSummary({ id: 2, title: 'test 2' });
        const trainingSummary3 = domainBuilder.buildTrainingSummary({ id: 3, title: 'dummy' });

        databaseBuilder.factory.buildTraining({ ...trainingSummary1 });
        databaseBuilder.factory.buildTraining({ ...trainingSummary2 });
        databaseBuilder.factory.buildTraining({ ...trainingSummary3 });

        await databaseBuilder.commit();
        const filter = { title: 'test' };
        const page = {};

        // when
        const { trainings } = await trainingRepository.findPaginatedSummaries({ filter, page });

        // then
        expect(trainings).to.have.lengthOf(2);
        expect(trainings[0]).to.be.instanceOf(TrainingSummary);
        expect(trainings[0]).to.deep.equal(trainingSummary1);
        expect(trainings[1]).to.deep.equal(trainingSummary2);
      });
    });

    context("when trainings don't exist", function () {
      it('should return an empty array', async function () {
        // given
        const filter = {};
        const page = { size: 2, number: 1 };

        // when
        const { trainings, pagination } = await trainingRepository.findPaginatedSummaries({ filter, page });

        // then
        expect(trainings).to.deep.equal([]);
        expect(pagination).to.deep.equal({ page: 1, pageSize: 2, rowCount: 0, pageCount: 0 });
      });
    });
  });

  describe('#findPaginatedSummariesByTargetProfileId', function () {
    context('when trainings exist', function () {
      it('should return paginated results', async function () {
        // given
        const trainingSummary1 = domainBuilder.buildTrainingSummary({
          id: 1,
          goalThreshold: 10,
          prerequisiteThreshold: 20,
        });
        const trainingSummary2 = domainBuilder.buildTrainingSummary({ id: 2, goalThreshold: 30 });
        const trainingSummaryLinkToAnotherTargetProfile = domainBuilder.buildTrainingSummary({ id: 3 });

        createDatabaseRepresentationForTrainingSummary({ trainingSummary: trainingSummary1, databaseBuilder });
        createDatabaseRepresentationForTrainingSummary({ trainingSummary: trainingSummary2, databaseBuilder });
        createDatabaseRepresentationForTrainingSummary({
          trainingSummary: trainingSummaryLinkToAnotherTargetProfile,
          databaseBuilder,
        });

        const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        const anotherTargetProfileId = databaseBuilder.factory.buildTargetProfile().id;

        databaseBuilder.factory.buildTargetProfileTraining({ targetProfileId, trainingId: trainingSummary1.id });
        trainingSummary1.targetProfilesCount = 1;
        databaseBuilder.factory.buildTargetProfileTraining({ targetProfileId, trainingId: trainingSummary2.id });
        trainingSummary2.targetProfilesCount = 1;
        databaseBuilder.factory.buildTargetProfileTraining({
          targetProfileId: anotherTargetProfileId,
          trainingId: trainingSummaryLinkToAnotherTargetProfile.id,
        });

        await databaseBuilder.commit();
        const page = { size: 2, number: 1 };

        // when
        const { trainings, pagination } = await trainingRepository.findPaginatedSummariesByTargetProfileId({
          targetProfileId,
          page,
        });

        // then
        expect(trainings).to.have.lengthOf(2);
        expect(trainings[0]).to.be.instanceOf(TrainingSummary);
        expect(trainings[0]).to.deep.equal(trainingSummary1);
        expect(trainings[1]).to.be.instanceOf(TrainingSummary);
        expect(trainings[1]).to.deep.equal(trainingSummary2);
        expect(pagination).to.deep.equal({ page: 1, pageSize: 2, rowCount: 2, pageCount: 1 });
      });
    });

    context('when training does not exist', function () {
      it('should return an empty array', async function () {
        // given
        const page = { size: 2, number: 1 };
        const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;

        // when
        const { trainings, pagination } = await trainingRepository.findPaginatedSummariesByTargetProfileId({
          targetProfileId,
          page,
        });

        // then
        expect(trainings).to.deep.equal([]);
        expect(pagination).to.deep.equal({ page: 1, pageSize: 2, rowCount: 0, pageCount: 0 });
      });
    });
  });

  describe('#findWithTriggersByCampaignParticipationIdAndLocale', function () {
    let area1;
    let competence1;
    let thematic1;
    let tube;

    beforeEach(async function () {
      area1 = domainBuilder.buildArea({ id: 'recAreaA' });
      competence1 = domainBuilder.buildCompetence({ id: 'recCompA', areaId: 'recAreaA' });
      const competenceInAnotherArea = domainBuilder.buildCompetence({ id: 'recCompB', areaId: 'recAreaB' });
      thematic1 = domainBuilder.buildThematic({
        id: 'recThemA',
        name: 'thematic1_name',
        competenceId: 'recCompA',
      });
      const thematicInAnotherCompetence = domainBuilder.buildThematic({
        id: 'recThemB',
        name: 'thematic2_name',
        competenceId: 'anotherCompetence',
      });
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
        thematicId: 'recThemA',
        skillIds: ['skillSuper', 'skillGenial'],
        skills: [],
      });
      const learningContent = {
        areas: [area1],
        competences: [competence1, competenceInAnotherArea],
        thematics: [
          { id: thematic1.id, name_i18n: { fr: thematic1.name }, competenceId: thematic1.competenceId },
          {
            id: thematicInAnotherCompetence.id,
            name_i18n: { fr: thematicInAnotherCompetence.name },
            competenceId: thematicInAnotherCompetence.competenceId,
          },
        ],
        tubes: [
          {
            id: tube.id,
            name: tube.name,
            thematicId: 'recThemA',
            skillIds: ['skillSuper', 'skillGenial'],
          },
        ],
      };
      mockLearningContent(learningContent);
    });

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
        trainingTriggers: [],
      });
      const training2 = domainBuilder.buildTraining({
        id: 2,
        title: 'training 2',
        targetProfileIds: [targetProfile1.id],
        locale: 'fr-fr',
        trainingTriggers: [],
      });
      const trainingWithDifferentLocale = domainBuilder.buildTraining({
        id: 3,
        title: 'training 3',
        targetProfileIds: [targetProfile1.id],
        locale: 'en-gb',
        trainingTriggers: [],
      });
      const trainingWithDifferentTargetProfile = domainBuilder.buildTraining({
        id: 4,
        title: 'training 4',
        targetProfileIds: [targetProfile2.id],
        locale: 'fr-fr',
        trainingTriggers: [],
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
      const trainings = await trainingRepository.findWithTriggersByCampaignParticipationIdAndLocale({
        campaignParticipationId: campaignParticipation.id,
        locale: 'fr-fr',
      });

      // then
      expect(trainings).to.have.lengthOf(2);
      expect(trainings[0]).to.be.instanceOf(Training);
      expect(trainings[0]).to.deep.equal(training1);
    });

    it('should return trainings with trainingTriggers', async function () {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      const campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaign.id });
      const training = domainBuilder.buildTraining({
        id: 1,
        title: 'training 1',
        targetProfileIds: [targetProfile.id],
        locale: 'fr-fr',
      });

      const goalTrainingTrigger = {
        trainingId: training.id,
        type: TrainingTrigger.types.GOAL,
        threshold: 80,
      };

      databaseBuilder.factory.buildTraining({ ...training, duration: '5h' });
      databaseBuilder.factory.buildTargetProfileTraining({
        trainingId: training.id,
        targetProfileId: training.targetProfileIds[0],
      });

      const expectedGoalTrainingTrigger = databaseBuilder.factory.buildTrainingTrigger(goalTrainingTrigger);
      const expectedGoalTube = databaseBuilder.factory.buildTrainingTriggerTube({
        trainingTriggerId: expectedGoalTrainingTrigger.id,
        tubeId: tube.id,
      });

      await databaseBuilder.commit();

      // when
      const trainings = await trainingRepository.findWithTriggersByCampaignParticipationIdAndLocale({
        campaignParticipationId: campaignParticipation.id,
        locale: 'fr-fr',
      });

      // then
      expect(trainings).to.have.lengthOf(1);
      expect(trainings[0]).to.be.instanceOf(Training);
      expect(_.omit(trainings[0], 'trainingTriggers')).to.deep.equal(_.omit(training, 'trainingTriggers'));

      expect(trainings[0].trainingTriggers).to.have.lengthOf(1);

      const trainingTrigger0 = trainings[0].trainingTriggers[0];
      expect(trainingTrigger0).to.be.instanceOf(TrainingTrigger);
      expect(_.omit(trainingTrigger0, 'triggerTubes')).to.deep.equal(
        _.omit(
          new TrainingTrigger({
            ...expectedGoalTrainingTrigger,
          }),
          'triggerTubes',
        ),
      );
      expect(trainingTrigger0.triggerTubes).to.have.lengthOf(1);
      expect(trainingTrigger0.triggerTubes[0]).to.be.instanceOf(TrainingTriggerTube);
      expect(trainingTrigger0.triggerTubes[0].id).to.equal(expectedGoalTube.id);
      expect(trainingTrigger0.triggerTubes[0].tube.id).to.equal(expectedGoalTube.tubeId);
      expect(trainingTrigger0.triggerTubes[0].level).to.equal(expectedGoalTube.level);
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
      const trainings = await trainingRepository.findWithTriggersByCampaignParticipationIdAndLocale({
        campaignParticipationId: campaignParticipation.id,
        locale: 'fr-fr',
      });

      // then
      expect(trainings).to.have.lengthOf(0);
    });
  });

  describe('#create', function () {
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
      const createdTraining = await trainingRepository.create({
        training: {
          ...training,
          anotherAttribute: 'anotherAttribute',
        },
      });

      // then
      expect(createdTraining).to.be.instanceOf(TrainingForAdmin);
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
      expect(updatedTraining).to.be.instanceOf(TrainingForAdmin);
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
      };

      // when
      await trainingRepository.update({ id: training.id, attributesToUpdate });

      // then
      const trainingNotUpdated = await knex('trainings')
        .select('title', 'link', 'editorName', 'editorLogoUrl')
        .where({ id: trainingNotToBeUpdated.id })
        .first();
      expect(trainingNotUpdated.title).to.equal(trainingNotToBeUpdated.title);
      expect(trainingNotUpdated.link).to.equal(trainingNotToBeUpdated.link);
      expect(trainingNotUpdated.editorName).to.equal(trainingNotToBeUpdated.editorName);
      expect(trainingNotUpdated.editorLogoUrl).to.equal(trainingNotToBeUpdated.editorLogoUrl);
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

function createDatabaseRepresentationForTrainingSummary({ trainingSummary, databaseBuilder }) {
  const training = databaseBuilder.factory.buildTraining({ ...trainingSummary });
  if (trainingSummary.prerequisiteThreshold !== undefined) {
    databaseBuilder.factory.buildTrainingTrigger({
      trainingId: training.id,
      type: TrainingTrigger.types.PREREQUISITE,
      threshold: trainingSummary.prerequisiteThreshold,
    });
  }
  if (trainingSummary.goalThreshold !== undefined) {
    databaseBuilder.factory.buildTrainingTrigger({
      trainingId: training.id,
      type: TrainingTrigger.types.GOAL,
      threshold: trainingSummary.goalThreshold,
    });
  }
  if (trainingSummary.targetProfilesCount) {
    _.times(trainingSummary.targetProfilesCount, () => {
      databaseBuilder.factory.buildTargetProfileTraining({
        trainingId: training.id,
        targetProfileId: databaseBuilder.factory.buildTargetProfile().id,
      });
    });
  }
}
