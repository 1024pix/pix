import _ from 'lodash';
import { databaseBuilder, domainBuilder, expect, knex, sinon } from '../../../test-helper.js';
import { KnowledgeElement } from '../../../../lib/domain/models/KnowledgeElement.js';
import * as knowledgeElementRepository from '../../../../lib/infrastructure/repositories/knowledge-element-repository.js';
import { DomainTransaction } from '../../../../lib/infrastructure/DomainTransaction.js';

describe('Integration | Repository | knowledgeElementRepository', function () {
  describe('#save', function () {
    let knowledgeElementToSave;

    beforeEach(function () {
      // given
      const userId = databaseBuilder.factory.buildUser({}).id;
      const assessmentId = databaseBuilder.factory.buildAssessment({ userId }).id;
      const answerId = databaseBuilder.factory.buildAnswer({ assessmentId }).id;
      knowledgeElementToSave = domainBuilder.buildKnowledgeElement({
        userId,
        assessmentId,
        answerId,
        competenceId: 'recABC',
      });
      knowledgeElementToSave.id = undefined;

      return databaseBuilder.commit();
    });

    it('should save the knowledgeElement in db', async function () {
      // when
      await knowledgeElementRepository.save(knowledgeElementToSave);

      // then
      let actualKnowledgeElement = await knex.select('*').from('knowledge-elements').first();
      actualKnowledgeElement = _.omit(actualKnowledgeElement, ['id', 'intId', 'createdAt', 'updatedAt']);
      const expectedKnowledgeElement = _.omit(knowledgeElementToSave, ['id', 'createdAt', 'updatedAt']);
      expect(actualKnowledgeElement).to.deep.equal(expectedKnowledgeElement);
    });
  });

  describe('#batchSave', function () {
    let knowledgeElementsToSave;

    beforeEach(function () {
      // given
      knowledgeElementsToSave = [];
      const userId = databaseBuilder.factory.buildUser({}).id;
      const assessmentId = databaseBuilder.factory.buildAssessment({ userId }).id;
      const answerId1 = databaseBuilder.factory.buildAnswer({ assessmentId }).id;
      const answerId2 = databaseBuilder.factory.buildAnswer({ assessmentId }).id;
      knowledgeElementsToSave.push(
        domainBuilder.buildKnowledgeElement({
          userId,
          assessmentId,
          answerId: answerId1,
          competenceId: 'recABC',
        }),
      );
      knowledgeElementsToSave.push(
        domainBuilder.buildKnowledgeElement({
          userId,
          assessmentId,
          answerId: answerId2,
          competenceId: 'recABC',
        }),
      );

      return databaseBuilder.commit();
    });

    it('should save all the knowledgeElements in db', async function () {
      // when
      await knowledgeElementRepository.batchSave({ knowledgeElements: knowledgeElementsToSave });

      // then
      let actualKnowledgeElements = await knex.select('*').from('knowledge-elements');
      actualKnowledgeElements = actualKnowledgeElements.map((ke) => _.omit(ke, ['id', 'createdAt', 'updatedAt']));
      const expectedKnowledgeElements = knowledgeElementsToSave.map((ke) =>
        _.omit(ke, ['id', 'createdAt', 'updatedAt']),
      );
      expect(actualKnowledgeElements).to.deep.equal(expectedKnowledgeElements);
    });
  });

  describe('#findUniqByUserId', function () {
    const today = new Date('2018-08-03');
    let knowledgeElementsWanted, knowledgeElementsWantedWithLimitDate;
    let userId;

    beforeEach(async function () {
      // given
      const yesterday = new Date('2018-08-02');
      const tomorrow = new Date('2018-08-04');
      const dayBeforeYesterday = new Date('2018-08-01');

      userId = databaseBuilder.factory.buildUser().id;

      knowledgeElementsWantedWithLimitDate = _.map(
        [
          { id: 1, createdAt: yesterday, skillId: '1', userId },
          { id: 2, createdAt: yesterday, skillId: '3', userId, status: 'validated' },
        ],
        (ke) => databaseBuilder.factory.buildKnowledgeElement(ke),
      );

      knowledgeElementsWanted = [
        ...knowledgeElementsWantedWithLimitDate,
        databaseBuilder.factory.buildKnowledgeElement({ id: 3, createdAt: tomorrow, skillId: '2', userId }),
      ];

      _.each(
        [
          { id: 4, createdAt: dayBeforeYesterday, skillId: '3', userId, status: 'invalidated' },
          { id: 5, createdAt: yesterday },
          { id: 6, createdAt: yesterday },
          { id: 7, createdAt: yesterday },
        ],
        (ke) => databaseBuilder.factory.buildKnowledgeElement(ke),
      );

      await databaseBuilder.commit();
    });

    it('should be DomainTransaction compliant', async function () {
      // given
      const answerId = databaseBuilder.factory.buildAnswer().id;
      const assessmentId = databaseBuilder.factory.buildAssessment().id;
      await databaseBuilder.commit();
      const extraKnowledgeElement = domainBuilder.buildKnowledgeElement({
        id: 1000,
        skillId: '1000',
        userId,
        answerId,
        assessmentId,
        createdAt: new Date(),
      });
      const knowledgeElementsWantedTrx = [...knowledgeElementsWanted, extraKnowledgeElement];

      // when
      const knowledgeElementsFound = await DomainTransaction.execute(async (domainTransaction) => {
        await domainTransaction.knexTransaction('knowledge-elements').insert(extraKnowledgeElement);
        return knowledgeElementRepository.findUniqByUserId({ userId, domainTransaction });
      });

      // then
      expect(knowledgeElementsFound).have.lengthOf(4);
      expect(knowledgeElementsFound).to.have.deep.members(knowledgeElementsWantedTrx);
    });

    context('when there is no limit date', function () {
      it('should find the knowledge elements for campaign assessment associated with a user id', async function () {
        // when
        const knowledgeElementsFound = await knowledgeElementRepository.findUniqByUserId({ userId });

        // then
        expect(knowledgeElementsFound).have.lengthOf(3);
        expect(knowledgeElementsFound).to.have.deep.members(knowledgeElementsWanted);
      });
    });

    context('when there is a limit date', function () {
      it('should find the knowledge elements for campaign assessment associated with a user id created before limit date', async function () {
        // when
        const knowledgeElementsFound = await knowledgeElementRepository.findUniqByUserId({ userId, limitDate: today });

        // then
        expect(knowledgeElementsFound).to.have.deep.members(knowledgeElementsWantedWithLimitDate);
        expect(knowledgeElementsFound).have.lengthOf(2);
      });
    });
  });

  describe('#findUniqByUserIdAndAssessmentId', function () {
    let knowledgeElementsWanted;
    let userId, assessmentId;

    beforeEach(async function () {
      // given
      userId = databaseBuilder.factory.buildUser().id;
      assessmentId = databaseBuilder.factory.buildAssessment({ userId }).id;
      const otherAssessmentId = databaseBuilder.factory.buildAssessment({ userId }).id;

      knowledgeElementsWanted = _.map(
        [
          { id: 1, skillId: '1', userId, assessmentId },
          { id: 2, skillId: '3', createdAt: new Date('2020-02-01'), userId, assessmentId },
        ],
        (ke) => databaseBuilder.factory.buildKnowledgeElement(ke),
      );

      databaseBuilder.factory.buildKnowledgeElement({ id: 4, skillId: '5', userId, assessmentId: otherAssessmentId });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 3,
        skillId: '3',
        createdAt: new Date('2020-01-01'),
        userId,
        assessmentId,
      });

      await databaseBuilder.commit();
    });

    it('should find the knowledge elements for assessment associated with a user id', async function () {
      // when
      const knowledgeElementsFound = await knowledgeElementRepository.findUniqByUserIdAndAssessmentId({
        userId,
        assessmentId,
      });

      // then
      expect(knowledgeElementsFound).to.have.deep.members(knowledgeElementsWanted);
      expect(knowledgeElementsFound).have.lengthOf(2);
    });
  });

  describe('#findUniqByUserIdGroupedByCompetenceId', function () {
    let userId;

    beforeEach(async function () {
      // given
      userId = databaseBuilder.factory.buildUser().id;

      _.each(
        [
          { id: 1, competenceId: 1, userId, skillId: 'web1' },
          { id: 2, competenceId: 1, userId, skillId: 'web2' },
          { id: 3, competenceId: 2, userId, skillId: 'url1' },
        ],
        (ke) => databaseBuilder.factory.buildKnowledgeElement(ke),
      );

      await databaseBuilder.commit();
    });

    it('should find the knowledge elements grouped by competence id', async function () {
      // when
      const actualKnowledgeElementsGroupedByCompetenceId =
        await knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId({ userId });

      // then
      expect(actualKnowledgeElementsGroupedByCompetenceId[1]).to.have.length(2);
      expect(actualKnowledgeElementsGroupedByCompetenceId[2]).to.have.length(1);
      expect(actualKnowledgeElementsGroupedByCompetenceId[1][0]).to.be.instanceOf(KnowledgeElement);
    });
  });

  describe('findUniqByUserIdAndCompetenceId', function () {
    let wantedKnowledgeElements;
    let userId;
    let otherUserId;
    let competenceId;
    let otherCompetenceId;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      otherUserId = databaseBuilder.factory.buildUser().id;
      competenceId = '3';
      otherCompetenceId = '4';

      wantedKnowledgeElements = _.map(
        [
          { id: 1, status: 'validated', userId, competenceId, skillId: 'rec1' },
          { id: 2, status: 'invalidated', userId, competenceId, skillId: 'rec2' },
        ],
        (ke) => databaseBuilder.factory.buildKnowledgeElement(ke),
      );

      _.each(
        [
          { id: 3, status: 'invalidated', userId, competenceId: otherCompetenceId, skillId: 'rec3' },
          { id: 4, status: 'validated', userId: otherUserId, competenceId, skillId: 'rec4' },
          { id: 5, status: 'validated', userId: otherUserId, competenceId: otherCompetenceId, skillId: 'rec5' },
          { id: 6, status: 'validated', userId, competenceId: null, skillId: 'rec6' },
        ],
        (ke) => {
          databaseBuilder.factory.buildKnowledgeElement(ke);
        },
      );

      await databaseBuilder.commit();
    });

    it('should find only the knowledge elements matching both userId and competenceId', async function () {
      // when
      const actualKnowledgeElements = await knowledgeElementRepository.findUniqByUserIdAndCompetenceId({
        userId,
        competenceId,
      });

      // then
      expect(actualKnowledgeElements).to.have.deep.members(wantedKnowledgeElements);
    });

    context('when the user has two KE for the same skill but in two different competences', function () {
      it('should return the most recent KE independent of the competence', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildKnowledgeElement({
          userId,
          skillId: '@skill123',
          competenceId: '@comp1',
          createdAt: new Date('2022-10-02'),
        });
        databaseBuilder.factory.buildKnowledgeElement({
          userId,
          skillId: '@skill123',
          competenceId: '@comp256',
          createdAt: new Date('2022-10-01'),
        });
        await databaseBuilder.commit();

        // when
        const knowledgeElementFound = await knowledgeElementRepository.findUniqByUserIdAndCompetenceId({
          userId,
          competenceId: '@comp256',
        });

        // then
        expect(knowledgeElementFound).to.deep.equal([]);
      });
    });
  });

  describe('#findSnapshotGroupedByCompetencesForUsers', function () {
    let userId1, userId2, sandbox;

    beforeEach(function () {
      sandbox = sinon.createSandbox();
      userId1 = databaseBuilder.factory.buildUser().id;
      userId2 = databaseBuilder.factory.buildUser().id;
      return databaseBuilder.commit();
    });

    it('should return knowledge elements within respective dates grouped by userId the competenceId', async function () {
      // given
      const competence1 = 'competenceId1';
      const competence2 = 'competenceId2';
      const dateUserId1 = new Date('2020-01-03');
      const dateUserId2 = new Date('2019-01-03');
      const knowledgeElement1_1 = databaseBuilder.factory.buildKnowledgeElement({
        competenceId: competence1,
        userId: userId1,
        createdAt: new Date('2020-01-01'),
        skillId: 'rec1',
      });
      const knowledgeElement1_2 = databaseBuilder.factory.buildKnowledgeElement({
        competenceId: competence1,
        userId: userId1,
        createdAt: new Date('2020-01-02'),
        skillId: 'rec2',
      });
      databaseBuilder.factory.buildKnowledgeElement({
        competenceId: competence1,
        userId: userId1,
        createdAt: new Date('2021-01-02'),
        skillId: 'rec3',
      });
      const knowledgeElement2_1 = databaseBuilder.factory.buildKnowledgeElement({
        competenceId: competence1,
        userId: userId2,
        createdAt: new Date('2019-01-01'),
        skillId: 'rec4',
      });
      const knowledgeElement2_2 = databaseBuilder.factory.buildKnowledgeElement({
        competenceId: competence2,
        userId: userId2,
        createdAt: new Date('2019-01-02'),
        skillId: 'rec5',
      });
      databaseBuilder.factory.buildKnowledgeElement({
        competenceId: competence1,
        userId: userId2,
        createdAt: new Date('2020-01-02'),
        skillId: 'rec6',
      });
      await databaseBuilder.commit();

      // when
      const knowledgeElementsByUserIdAndCompetenceId =
        await knowledgeElementRepository.findSnapshotGroupedByCompetencesForUsers({
          [userId1]: dateUserId1,
          [userId2]: dateUserId2,
        });

      // then
      expect(knowledgeElementsByUserIdAndCompetenceId[userId1][competence1][0]).to.be.instanceOf(KnowledgeElement);
      expect(knowledgeElementsByUserIdAndCompetenceId[userId1][competence1].length).to.equal(2);
      expect(knowledgeElementsByUserIdAndCompetenceId[userId1][competence1]).to.deep.include.members([
        knowledgeElement1_1,
        knowledgeElement1_2,
      ]);
      expect(knowledgeElementsByUserIdAndCompetenceId[userId2]).to.deep.equal({
        [competence1]: [knowledgeElement2_1],
        [competence2]: [knowledgeElement2_2],
      });
    });

    context('when user has a snapshot for this date', function () {
      afterEach(function () {
        sandbox.restore();
      });

      it('should return the knowledge elements in the snapshot', async function () {
        // given
        const dateUserId1 = new Date('2020-01-03');
        const knowledgeElement = databaseBuilder.factory.buildKnowledgeElement({ userId: userId1 });
        databaseBuilder.factory.buildKnowledgeElementSnapshot({
          userId: userId1,
          snappedAt: dateUserId1,
          snapshot: JSON.stringify([knowledgeElement]),
        });
        await databaseBuilder.commit();

        // when
        const knowledgeElementsByUserIdAndCompetenceId =
          await knowledgeElementRepository.findSnapshotGroupedByCompetencesForUsers({ [userId1]: dateUserId1 });

        // then
        expect(knowledgeElementsByUserIdAndCompetenceId[userId1][knowledgeElement.competenceId][0]).to.deep.equal(
          knowledgeElement,
        );
      });
    });

    context('when user does not have a snapshot for this date', function () {
      context('when no date is provided along with the user', function () {
        let expectedKnowledgeElement;

        beforeEach(function () {
          expectedKnowledgeElement = databaseBuilder.factory.buildKnowledgeElement({
            userId: userId1,
            createdAt: new Date('2018-01-01'),
          });
          return databaseBuilder.commit();
        });

        it('should return the knowledge elements with limit date as now', async function () {
          // when
          const knowledgeElementsByUserIdAndCompetenceId =
            await knowledgeElementRepository.findSnapshotGroupedByCompetencesForUsers({ [userId1]: null });

          // then
          expect(knowledgeElementsByUserIdAndCompetenceId[userId1]).to.deep.equal({
            [expectedKnowledgeElement.competenceId]: [expectedKnowledgeElement],
          });
        });

        it('should not trigger snapshotting', async function () {
          // when
          await knowledgeElementRepository.findSnapshotGroupedByCompetencesForUsers({ [userId1]: null });

          // then
          const actualUserSnapshots = await knex
            .select('*')
            .from('knowledge-element-snapshots')
            .where({ userId: userId1 });
          expect(actualUserSnapshots.length).to.equal(0);
        });
      });

      context('when a date is provided along with the user', function () {
        let expectedKnowledgeElement;

        beforeEach(function () {
          expectedKnowledgeElement = databaseBuilder.factory.buildKnowledgeElement({
            userId: userId1,
            createdAt: new Date('2018-01-01'),
          });
          return databaseBuilder.commit();
        });

        it('should return the knowledge elements at date', async function () {
          // when
          const knowledgeElementsByUserIdAndCompetenceId =
            await knowledgeElementRepository.findSnapshotGroupedByCompetencesForUsers({
              [userId1]: new Date('2018-02-01'),
            });

          // then
          expect(knowledgeElementsByUserIdAndCompetenceId[userId1]).to.deep.equal({
            [expectedKnowledgeElement.competenceId]: [expectedKnowledgeElement],
          });
        });
      });
    });
  });

  describe('#countValidatedByCompetencesForOneUserWithinCampaign', function () {
    it('should return count of validated knowledge elements within limit date for the given user grouped by competences within target profile of campaign', async function () {
      // given
      const skill1 = domainBuilder.buildSkill({ id: 'skill1', tubeId: 'tube1' });
      const skill2 = domainBuilder.buildSkill({ id: 'skill2', tubeId: 'tube1' });
      const skill3 = domainBuilder.buildSkill({ id: 'skill3', tubeId: 'tube2' });
      const tube1 = domainBuilder.buildTube({
        id: 'tube1',
        skills: [skill1, skill2],
        competenceId: 'competence1',
      });
      const tube2 = domainBuilder.buildTube({ id: 'tube1', skills: [skill3], competenceId: 'competence2' });
      const competence1 = domainBuilder.buildCompetence({ id: 'competence1', tubes: [tube1] });
      const competence2 = domainBuilder.buildCompetence({ id: 'competence2', tubes: [tube2] });
      const area = domainBuilder.buildArea({ id: 'area1', competences: [competence1, competence2] });
      const framework = domainBuilder.buildFramework({ areas: [area] });
      const learningContent = domainBuilder.buildCampaignLearningContent.fromFrameworks([framework]);
      const userId = databaseBuilder.factory.buildUser().id;
      const limitDate = new Date('2020-01-03');
      // relevant kes
      databaseBuilder.factory.buildKnowledgeElement({
        competenceId: competence1.id,
        userId,
        createdAt: new Date('2020-01-02'),
        skillId: skill1.id,
      });
      databaseBuilder.factory.buildKnowledgeElement({
        competenceId: competence1.id,
        userId,
        createdAt: new Date('2020-01-02'),
        skillId: skill2.id,
      });
      // ignored kes
      databaseBuilder.factory.buildKnowledgeElement({
        competenceId: competence1.id,
        userId,
        createdAt: new Date('2021-01-02'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        competenceId: competence1.id,
        createdAt: new Date('2019-01-02'),
        skillId: skill1.id,
      });
      await databaseBuilder.commit();

      // when
      const knowledgeElementsCountByCompetenceId =
        await knowledgeElementRepository.countValidatedByCompetencesForOneUserWithinCampaign(
          userId,
          limitDate,
          learningContent,
        );

      // then
      expect(knowledgeElementsCountByCompetenceId[competence1.id]).to.equal(2);
    });

    context('when user does not have a snapshot for this date', function () {
      context('when no date is provided along with the user', function () {
        it('should take into account all the knowledge elements with a createdAt date prior to today', async function () {
          // given
          const learningContent = domainBuilder.buildCampaignLearningContent.withSimpleContent();
          const userId = databaseBuilder.factory.buildUser().id;
          databaseBuilder.factory.buildKnowledgeElement({
            userId,
            createdAt: new Date('2019-04-28'),
            competenceId: learningContent.competences[0].id,
            skillId: learningContent.skills[0].id,
          });
          await databaseBuilder.commit();

          // when
          const knowledgeElementsCountByCompetenceId =
            await knowledgeElementRepository.countValidatedByCompetencesForOneUserWithinCampaign(
              userId,
              null,
              learningContent,
            );

          // then
          const competenceId = learningContent.competences[0].id;
          expect(knowledgeElementsCountByCompetenceId[competenceId]).to.equal(1);
        });

        it('should not trigger snapshotting', async function () {
          // given
          const learningContent = domainBuilder.buildCampaignLearningContent.withSimpleContent();
          const userId = databaseBuilder.factory.buildUser().id;
          databaseBuilder.factory.buildKnowledgeElement({
            userId,
            createdAt: new Date('2018-01-01'),
            competenceId: learningContent.competences[0].id,
            skillId: learningContent.skills[0].id,
          });
          await databaseBuilder.commit();

          // when
          await knowledgeElementRepository.countValidatedByCompetencesForOneUserWithinCampaign(
            userId,
            null,
            learningContent,
          );

          // then
          const actualUserSnapshots = await knex.select('*').from('knowledge-element-snapshots').where({ userId });
          expect(actualUserSnapshots.length).to.equal(0);
        });
      });

      context('when a date is provided along with the user', function () {
        it('should return the knowledge elements at date', async function () {
          // given
          const learningContent = domainBuilder.buildCampaignLearningContent.withSimpleContent();
          const userId = databaseBuilder.factory.buildUser().id;
          databaseBuilder.factory.buildKnowledgeElement({
            userId,
            createdAt: new Date('2018-01-01'),
            competenceId: learningContent.competences[0].id,
            skillId: learningContent.skills[0].id,
          });
          await databaseBuilder.commit();

          // when
          const knowledgeElementsCountByCompetenceId =
            await knowledgeElementRepository.countValidatedByCompetencesForOneUserWithinCampaign(
              userId,
              new Date('2018-02-01'),
              learningContent,
            );

          // then
          expect(knowledgeElementsCountByCompetenceId).to.deep.equal({
            [learningContent.competences[0].id]: 1,
          });
        });
      });
    });

    it('should avoid counting non targeted knowledge elements when there are knowledge elements that are not in the target profile', async function () {
      // given
      const learningContent = domainBuilder.buildCampaignLearningContent.withSimpleContent();
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2018-01-01'),
        competenceId: learningContent.competences[0].id,
        skillId: 'id_de_skill_improbable_et_different_de_celui_du_builder',
      });
      await databaseBuilder.commit();

      // when
      const knowledgeElementsCountByCompetenceId =
        await knowledgeElementRepository.countValidatedByCompetencesForOneUserWithinCampaign(
          userId,
          null,
          learningContent,
        );

      // then
      expect(knowledgeElementsCountByCompetenceId).to.deep.equal({
        [learningContent.competences[0].id]: 0,
      });
    });

    it('should requalify knowledgeElement under actual targeted competence of skill disregarding indicated competenceId', async function () {
      // given
      const learningContent = domainBuilder.buildCampaignLearningContent.withSimpleContent();
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2018-01-01'),
        competenceId: 'competence_depuis_laquelle_lacquis_a_pu_etre_retire',
        skillId: learningContent.skills[0].id,
      });
      await databaseBuilder.commit();

      // when
      const knowledgeElementsCountByCompetenceId =
        await knowledgeElementRepository.countValidatedByCompetencesForOneUserWithinCampaign(
          userId,
          null,
          learningContent,
        );

      // then
      expect(knowledgeElementsCountByCompetenceId).to.deep.equal({
        [learningContent.competences[0].id]: 1,
      });
    });

    it('should only take into account validated knowledge elements', async function () {
      // given
      const learningContent = domainBuilder.buildCampaignLearningContent.withSimpleContent();
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2018-01-01'),
        competenceId: learningContent.competences[0].id,
        skillId: learningContent.skills[0].id,
        status: 'invalidated',
      });
      await databaseBuilder.commit();

      // when
      const knowledgeElementsCountByCompetenceId =
        await knowledgeElementRepository.countValidatedByCompetencesForOneUserWithinCampaign(
          userId,
          null,
          learningContent,
        );

      // then
      expect(knowledgeElementsCountByCompetenceId).to.deep.equal({
        [learningContent.competences[0].id]: 0,
      });
    });

    it('should count 0 on competence that does not have any targeted knowledge elements', async function () {
      // given
      const learningContent = domainBuilder.buildCampaignLearningContent.withSimpleContent();
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      // when
      const knowledgeElementsByUserIdAndCompetenceId =
        await knowledgeElementRepository.countValidatedByCompetencesForOneUserWithinCampaign(
          userId,
          null,
          learningContent,
        );

      // then
      expect(knowledgeElementsByUserIdAndCompetenceId).to.deep.equal({
        [learningContent.competences[0].id]: 0,
      });
    });
  });

  describe('#countValidatedByCompetencesForUsersWithinCampaign', function () {
    it('should return count of validated knowledge elements within limit date for the given users grouped by competences within target profile of campaign', async function () {
      // given
      const skill1 = domainBuilder.buildSkill({ id: 'skill1', tubeId: 'tube1' });
      const skill2 = domainBuilder.buildSkill({ id: 'skill2', tubeId: 'tube2' });
      const tube1 = domainBuilder.buildTube({ id: 'tube1', skills: [skill1], competenceId: 'competence1' });
      const tube2 = domainBuilder.buildTube({ id: 'tube2', skills: [skill2], competenceId: 'competence2' });
      const competence1 = domainBuilder.buildCompetence({ id: 'competence1', tubes: [tube1] });
      const competence2 = domainBuilder.buildCompetence({ id: 'competence2', tubes: [tube2] });
      const area = domainBuilder.buildArea({ id: 'area1', competences: [competence1, competence2] });
      const framework = domainBuilder.buildFramework({ areas: [area] });
      const learningContent = domainBuilder.buildCampaignLearningContent.fromFrameworks([framework]);
      const userId1 = databaseBuilder.factory.buildUser().id;
      const userId2 = databaseBuilder.factory.buildUser().id;
      const dateUserId1 = new Date('2020-01-03');
      const dateUserId2 = new Date('2019-01-03');
      databaseBuilder.factory.buildKnowledgeElement({
        competenceId: competence1.id,
        userId: userId1,
        createdAt: new Date('2020-01-02'),
        skillId: skill1.id,
      });
      databaseBuilder.factory.buildKnowledgeElement({
        competenceId: competence2.id,
        userId: userId2,
        createdAt: new Date('2019-01-02'),
        skillId: skill2.id,
      });
      await databaseBuilder.commit();

      // when
      const knowledgeElementsCountCompetenceId =
        await knowledgeElementRepository.countValidatedByCompetencesForUsersWithinCampaign(
          { [userId1]: dateUserId1, [userId2]: dateUserId2 },
          learningContent,
        );

      // then
      expect(knowledgeElementsCountCompetenceId).to.deep.equal({
        [competence1.id]: 1,
        [competence2.id]: 1,
      });
    });

    context('when user does not have a snapshot for this date', function () {
      context('when no date is provided along with the user', function () {
        it('should take into account the knowledge elements with limit date as now', async function () {
          // given
          const learningContent = domainBuilder.buildCampaignLearningContent.withSimpleContent();
          const userId = databaseBuilder.factory.buildUser().id;
          databaseBuilder.factory.buildKnowledgeElement({
            userId,
            createdAt: new Date('2018-01-01'),
            competenceId: learningContent.competences[0].id,
            skillId: learningContent.skills[0].id,
          });
          await databaseBuilder.commit();

          // when
          const knowledgeElementsCountByCompetenceId =
            await knowledgeElementRepository.countValidatedByCompetencesForUsersWithinCampaign(
              { [userId]: null },
              learningContent,
            );

          // then
          const competenceId = learningContent.competences[0].id;
          expect(knowledgeElementsCountByCompetenceId[competenceId]).to.equal(1);
        });

        it('should not trigger snapshotting', async function () {
          // given
          const learningContent = domainBuilder.buildCampaignLearningContent.withSimpleContent();
          const userId = databaseBuilder.factory.buildUser().id;
          databaseBuilder.factory.buildKnowledgeElement({
            userId,
            createdAt: new Date('2018-01-01'),
            competenceId: learningContent.competences[0].id,
            skillId: learningContent.skills[0].id,
          });
          await databaseBuilder.commit();

          // when
          await knowledgeElementRepository.countValidatedByCompetencesForUsersWithinCampaign(
            { [userId]: null },
            learningContent,
          );

          // then
          const actualUserSnapshots = await knex.select('*').from('knowledge-element-snapshots').where({ userId });
          expect(actualUserSnapshots.length).to.equal(0);
        });
      });

      context('when a date is provided along with the user', function () {
        it('should return the knowledge elements at date', async function () {
          // given
          const learningContent = domainBuilder.buildCampaignLearningContent.withSimpleContent();
          const userId = databaseBuilder.factory.buildUser().id;
          databaseBuilder.factory.buildKnowledgeElement({
            userId,
            createdAt: new Date('2018-01-01'),
            competenceId: learningContent.competences[0].id,
            skillId: learningContent.skills[0].id,
          });
          await databaseBuilder.commit();

          // when
          const knowledgeElementsCountByCompetenceId =
            await knowledgeElementRepository.countValidatedByCompetencesForUsersWithinCampaign(
              { [userId]: null },
              learningContent,
            );

          // then
          expect(knowledgeElementsCountByCompetenceId).to.deep.equal({
            [learningContent.competences[0].id]: 1,
          });
        });
      });
    });

    it('should avoid counting non targeted knowledge elements when there are knowledge elements that are not in the target profile', async function () {
      // given
      const learningContent = domainBuilder.buildCampaignLearningContent.withSimpleContent();
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2018-01-01'),
        competenceId: learningContent.competences[0].id,
        skillId: 'id_de_skill_improbable_et_different_de_celui_du_builder',
      });
      await databaseBuilder.commit();

      // when
      const knowledgeElementsCountByCompetenceId =
        await knowledgeElementRepository.countValidatedByCompetencesForUsersWithinCampaign(
          { [userId]: null },
          learningContent,
        );

      // then
      expect(knowledgeElementsCountByCompetenceId).to.deep.equal({
        [learningContent.competences[0].id]: 0,
      });
    });

    it('should requalify knowledgeElement under actual targeted competence of skill disregarding indicated competenceId', async function () {
      // given
      const learningContent = domainBuilder.buildCampaignLearningContent.withSimpleContent();
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2018-01-01'),
        competenceId: 'competence_depuis_laquelle_lacquis_a_pu_etre_retire',
        skillId: learningContent.skills[0].id,
      });
      await databaseBuilder.commit();

      // when
      const knowledgeElementsCountByCompetenceId =
        await knowledgeElementRepository.countValidatedByCompetencesForUsersWithinCampaign(
          { [userId]: null },
          learningContent,
        );

      // then
      expect(knowledgeElementsCountByCompetenceId).to.deep.equal({
        [learningContent.competences[0].id]: 1,
      });
    });

    it('should avoid counting non validated knowledge elements when there are knowledge elements that are not validated', async function () {
      // given
      const learningContent = domainBuilder.buildCampaignLearningContent.withSimpleContent();
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2018-01-01'),
        competenceId: learningContent.competences[0].id,
        skillId: learningContent.skills[0].id,
        status: 'invalidated',
      });
      await databaseBuilder.commit();

      // when
      const knowledgeElementsCountByCompetenceId =
        await knowledgeElementRepository.countValidatedByCompetencesForUsersWithinCampaign(
          { [userId]: null },
          learningContent,
        );

      // then
      expect(knowledgeElementsCountByCompetenceId).to.deep.equal({
        [learningContent.competences[0].id]: 0,
      });
    });

    it('should count 0 on competence that does not have any targeted knowledge elements', async function () {
      // given
      const learningContent = domainBuilder.buildCampaignLearningContent.withSimpleContent();
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      // when
      const knowledgeElementsByUserIdAndCompetenceId =
        await knowledgeElementRepository.countValidatedByCompetencesForUsersWithinCampaign(
          { [userId]: null },
          learningContent,
        );

      // then
      expect(knowledgeElementsByUserIdAndCompetenceId).to.deep.equal({
        [learningContent.competences[0].id]: 0,
      });
    });
  });

  describe('#findValidatedGroupedByTubesWithinCampaign', function () {
    it('should return knowledge elements within respective dates grouped by userId and tubeId within target profile of campaign', async function () {
      // given
      const skill1 = domainBuilder.buildSkill({ id: 'skill1', tubeId: 'tube1' });
      const skill2 = domainBuilder.buildSkill({ id: 'skill2', tubeId: 'tube1' });
      const skill3 = domainBuilder.buildSkill({ id: 'skill3', tubeId: 'tube2' });
      const tube1 = domainBuilder.buildTube({
        id: 'tube1',
        skills: [skill1, skill2],
        competenceId: 'competence',
      });
      const tube2 = domainBuilder.buildTube({ id: 'tube2', skills: [skill3], competenceId: 'competence' });
      const competence = domainBuilder.buildCompetence({
        id: 'competence',
        tubes: [tube1, tube2],
      });
      const area = domainBuilder.buildArea({ id: 'areaId', competences: [competence] });
      const framework = domainBuilder.buildFramework({ areas: [area] });
      const targetProfile = domainBuilder.buildCampaignLearningContent.fromFrameworks([framework]);
      const userId1 = databaseBuilder.factory.buildUser().id;
      const userId2 = databaseBuilder.factory.buildUser().id;
      const dateUserId1 = new Date('2020-01-03');
      const dateUserId2 = new Date('2019-01-03');
      const knowledgeElement1_1 = databaseBuilder.factory.buildKnowledgeElement({
        competenceId: competence.id,
        userId: userId1,
        createdAt: new Date('2020-01-02'),
        skillId: skill1.id,
      });
      const knowledgeElement1_2 = databaseBuilder.factory.buildKnowledgeElement({
        competenceId: competence.id,
        userId: userId1,
        createdAt: new Date('2020-01-02'),
        skillId: skill2.id,
      });
      databaseBuilder.factory.buildKnowledgeElement({
        competenceId: competence.id,
        userId: userId1,
        createdAt: new Date('2021-01-02'),
      });
      const knowledgeElement2_1 = databaseBuilder.factory.buildKnowledgeElement({
        competenceId: competence.id,
        userId: userId2,
        createdAt: new Date('2019-01-02'),
        skillId: skill1.id,
      });
      const knowledgeElement2_2 = databaseBuilder.factory.buildKnowledgeElement({
        competenceId: competence.id,
        userId: userId2,
        createdAt: new Date('2019-01-02'),
        skillId: skill3.id,
      });
      databaseBuilder.factory.buildKnowledgeElement({
        competenceId: competence.id,
        userId: userId2,
        createdAt: new Date('2020-01-02'),
      });
      await databaseBuilder.commit();

      // when
      const knowledgeElementsByTubeId = await knowledgeElementRepository.findValidatedGroupedByTubesWithinCampaign(
        { [userId1]: dateUserId1, [userId2]: dateUserId2 },
        targetProfile,
      );

      // then
      expect(knowledgeElementsByTubeId[tube1.id][0]).to.be.instanceOf(KnowledgeElement);
      expect(knowledgeElementsByTubeId[tube1.id]).to.deep.include.members([
        knowledgeElement1_1,
        knowledgeElement1_2,
        knowledgeElement2_1,
      ]);
      expect(knowledgeElementsByTubeId[tube2.id]).to.deep.include.members([knowledgeElement2_2]);
    });

    it('should return the knowledge elements in the snapshot when user has a snapshot for this date', async function () {
      // given
      const learningContent = domainBuilder.buildCampaignLearningContent.withSimpleContent();
      const userId = databaseBuilder.factory.buildUser().id;
      const dateUserId = new Date('2020-01-03');
      const knowledgeElement = databaseBuilder.factory.buildKnowledgeElement({
        userId,
        skillId: learningContent.skills[0].id,
      });
      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        userId,
        snappedAt: dateUserId,
        snapshot: JSON.stringify([knowledgeElement]),
      });
      await databaseBuilder.commit();

      // when
      const knowledgeElementsByTubeId = await knowledgeElementRepository.findValidatedGroupedByTubesWithinCampaign(
        { [userId]: dateUserId },
        learningContent,
      );

      // then
      expect(knowledgeElementsByTubeId[learningContent.tubes[0].id][0]).to.deep.equal(knowledgeElement);
    });

    context('when user does not have a snapshot for this date', function () {
      context('when no date is provided along with the user', function () {
        it('should return the knowledge elements with limit date as now', async function () {
          // given
          const learningContent = domainBuilder.buildCampaignLearningContent.withSimpleContent();
          const userId = databaseBuilder.factory.buildUser().id;
          const expectedKnowledgeElement = databaseBuilder.factory.buildKnowledgeElement({
            userId,
            createdAt: new Date('2018-01-01'),
            skillId: learningContent.skills[0].id,
          });
          await databaseBuilder.commit();

          // when
          const knowledgeElementsByTubeId = await knowledgeElementRepository.findValidatedGroupedByTubesWithinCampaign(
            { [userId]: null },
            learningContent,
          );

          // then
          expect(knowledgeElementsByTubeId).to.deep.equal({
            [learningContent.tubes[0].id]: [expectedKnowledgeElement],
          });
        });

        it('should not trigger snapshotting', async function () {
          // given
          const learningContent = domainBuilder.buildCampaignLearningContent.withSimpleContent();
          const userId = databaseBuilder.factory.buildUser().id;
          databaseBuilder.factory.buildKnowledgeElement({
            userId,
            createdAt: new Date('2018-01-01'),
            skillId: learningContent.skills[0].id,
          });
          await databaseBuilder.commit();

          // when
          await knowledgeElementRepository.findValidatedGroupedByTubesWithinCampaign(
            { [userId]: null },
            learningContent,
          );

          // then
          const actualUserSnapshots = await knex.select('*').from('knowledge-element-snapshots').where({ userId });
          expect(actualUserSnapshots.length).to.equal(0);
        });
      });

      context('when a date is provided along with the user', function () {
        it('should return the knowledge elements at date', async function () {
          // given
          const learningContent = domainBuilder.buildCampaignLearningContent.withSimpleContent();
          const userId = databaseBuilder.factory.buildUser().id;
          const expectedKnowledgeElement = databaseBuilder.factory.buildKnowledgeElement({
            userId,
            createdAt: new Date('2018-01-01'),
            skillId: learningContent.skills[0].id,
          });
          await databaseBuilder.commit();

          // when
          const knowledgeElementsByTubeId = await knowledgeElementRepository.findValidatedGroupedByTubesWithinCampaign(
            { [userId]: new Date('2018-02-01') },
            learningContent,
          );

          // then
          expect(knowledgeElementsByTubeId).to.deep.equal({
            [learningContent.tubes[0].id]: [expectedKnowledgeElement],
          });
        });
      });
    });

    it('should avoid returning non targeted knowledge elements when there are knowledge elements that are not in the target profile', async function () {
      // given
      const learningContent = domainBuilder.buildCampaignLearningContent.withSimpleContent();
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2018-01-01'),
        skillId: 'id_de_skill_improbable_et_different_de_celui_du_builder',
      });
      await databaseBuilder.commit();

      // when
      const knowledgeElementsByTubeId = await knowledgeElementRepository.findValidatedGroupedByTubesWithinCampaign(
        { [userId]: null },
        learningContent,
      );

      // then
      expect(knowledgeElementsByTubeId).to.deep.equal({
        [learningContent.tubes[0].id]: [],
      });
    });

    it('should exclusively return validated knowledge elements', async function () {
      // given
      const learningContent = domainBuilder.buildCampaignLearningContent.withSimpleContent();
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2018-01-01'),
        skillId: learningContent.skills[0].id,
        status: 'invalidated',
      });
      await databaseBuilder.commit();

      // when
      const knowledgeElementsByTubeId = await knowledgeElementRepository.findValidatedGroupedByTubesWithinCampaign(
        { [userId]: null },
        learningContent,
      );

      // then
      expect(knowledgeElementsByTubeId).to.deep.equal({
        [learningContent.tubes[0].id]: [],
      });
    });

    it('should return an empty array on tube that does not have any targeted knowledge elements', async function () {
      // given
      const learningContent = domainBuilder.buildCampaignLearningContent.withSimpleContent();
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      // when
      const knowledgeElementsByTubeId = await knowledgeElementRepository.findValidatedGroupedByTubesWithinCampaign(
        { [userId]: null },
        learningContent,
      );

      // then
      expect(knowledgeElementsByTubeId).to.deep.equal({
        [learningContent.tubes[0].id]: [],
      });
    });
  });

  describe('#findSnapshotForUsers', function () {
    let sandbox;
    let userId1;
    let userId2;

    beforeEach(function () {
      userId1 = databaseBuilder.factory.buildUser().id;
      userId2 = databaseBuilder.factory.buildUser().id;
      sandbox = sinon.createSandbox();
      return databaseBuilder.commit();
    });

    it('should return knowledge elements within respective dates and users', async function () {
      // given
      const dateUserId1 = new Date('2020-01-03');
      const dateUserId2 = new Date('2019-01-03');
      const user1knowledgeElement1 = databaseBuilder.factory.buildKnowledgeElement({
        userId: userId1,
        createdAt: new Date('2020-01-01'),
        skillId: 'rec1',
      });
      const user1knowledgeElement2 = databaseBuilder.factory.buildKnowledgeElement({
        userId: userId1,
        createdAt: new Date('2020-01-02'),
        skillId: 'rec2',
      });
      databaseBuilder.factory.buildKnowledgeElement({
        userId: userId1,
        createdAt: new Date('2021-01-02'),
        skillId: 'rec3',
      });
      const user2knowledgeElement1 = databaseBuilder.factory.buildKnowledgeElement({
        userId: userId2,
        createdAt: new Date('2019-01-01'),
        skillId: 'rec4',
      });
      const user2knowledgeElement2 = databaseBuilder.factory.buildKnowledgeElement({
        userId: userId2,
        createdAt: new Date('2019-01-02'),
        skillId: 'rec5',
      });
      databaseBuilder.factory.buildKnowledgeElement({
        userId: userId2,
        createdAt: new Date('2020-01-02'),
        skillId: 'rec6',
      });
      await databaseBuilder.commit();

      // when
      const knowledgeElementsByUserIdAndCompetenceId = await knowledgeElementRepository.findSnapshotForUsers({
        [userId1]: dateUserId1,
        [userId2]: dateUserId2,
      });

      // then
      expect(knowledgeElementsByUserIdAndCompetenceId[userId1][0]).to.be.instanceOf(KnowledgeElement);
      expect(knowledgeElementsByUserIdAndCompetenceId[userId1].length).to.equal(2);
      expect(knowledgeElementsByUserIdAndCompetenceId[userId2].length).to.equal(2);
      expect(knowledgeElementsByUserIdAndCompetenceId[userId1]).to.deep.include.members([
        user1knowledgeElement1,
        user1knowledgeElement2,
      ]);
      expect(knowledgeElementsByUserIdAndCompetenceId[userId2]).to.deep.include.members([
        user2knowledgeElement1,
        user2knowledgeElement2,
      ]);
    });

    context('when user has a snapshot for this date', function () {
      afterEach(function () {
        sandbox.restore();
      });

      it('should return the knowledge elements in the snapshot', async function () {
        // given
        const dateSharedAtUserId1 = new Date('2020-01-03');
        const knowledgeElement = databaseBuilder.factory.buildKnowledgeElement({ userId: userId1 });
        databaseBuilder.factory.buildKnowledgeElementSnapshot({
          userId: userId1,
          snappedAt: dateSharedAtUserId1,
          snapshot: JSON.stringify([knowledgeElement]),
        });
        await databaseBuilder.commit();

        // when
        const knowledgeElementsByUserIdAndCompetenceId = await knowledgeElementRepository.findSnapshotForUsers({
          [userId1]: dateSharedAtUserId1,
        });

        // then
        expect(knowledgeElementsByUserIdAndCompetenceId[userId1][0]).to.deep.equal(knowledgeElement);
      });
    });

    context('when user does not have a snapshot for this date', function () {
      context('when no date is provided along with the user', function () {
        let expectedKnowledgeElement;

        beforeEach(function () {
          expectedKnowledgeElement = databaseBuilder.factory.buildKnowledgeElement({
            userId: userId1,
            createdAt: new Date('2018-01-01'),
          });
          return databaseBuilder.commit();
        });

        it('should return all knowledge elements', async function () {
          // when
          const knowledgeElementsByUserIdAndCompetenceId = await knowledgeElementRepository.findSnapshotForUsers({
            [userId1]: null,
          });

          // then
          expect(knowledgeElementsByUserIdAndCompetenceId[userId1]).to.deep.include.members([expectedKnowledgeElement]);
        });

        it('should not trigger snapshotting', async function () {
          // when
          await knowledgeElementRepository.findSnapshotForUsers({ [userId1]: null });

          // then
          const actualUserSnapshots = await knex
            .select('*')
            .from('knowledge-element-snapshots')
            .where({ userId: userId1 });
          expect(actualUserSnapshots.length).to.equal(0);
        });
      });

      context('when a date is provided along with the user', function () {
        let expectedKnowledgeElement;

        beforeEach(function () {
          expectedKnowledgeElement = databaseBuilder.factory.buildKnowledgeElement({
            userId: userId1,
            createdAt: new Date('2018-01-01'),
          });
          return databaseBuilder.commit();
        });

        it('should return the knowledge elements at date', async function () {
          // when
          const knowledgeElementsByUserIdAndCompetenceId = await knowledgeElementRepository.findSnapshotForUsers({
            [userId1]: new Date('2018-02-01'),
          });

          // then
          expect(knowledgeElementsByUserIdAndCompetenceId[userId1]).to.deep.include.members([expectedKnowledgeElement]);
        });
      });
    });
  });

  describe('#findInvalidatedAndDirectByUserId', function () {
    it('should find invalidated & direct KE with given UserId', async function () {
      // Given
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildKnowledgeElement({
        id: 1,
        userId,
        status: KnowledgeElement.StatusType.INVALIDATED,
        source: KnowledgeElement.SourceType.DIRECT,
        createdAt: new Date('2022-01-03'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 2,
        userId,
        status: KnowledgeElement.StatusType.INVALIDATED,
        source: KnowledgeElement.SourceType.DIRECT,
        createdAt: new Date('2022-08-19'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        userId,
        status: KnowledgeElement.StatusType.VALIDATED,
        source: KnowledgeElement.SourceType.DIRECT,
      });
      databaseBuilder.factory.buildKnowledgeElement({
        userId,
        status: KnowledgeElement.StatusType.INVALIDATED,
        source: KnowledgeElement.SourceType.INFERRED,
      });

      await databaseBuilder.commit();

      // When
      const knowledgeElements = await knowledgeElementRepository.findInvalidatedAndDirectByUserId(userId);

      // Then
      expect(knowledgeElements).to.have.length(2);
      expect(knowledgeElements[0]).to.be.instanceOf(KnowledgeElement);
      expect(knowledgeElements[0].id).to.equal(2);
    });

    it('should return an empty list if there are no invalidated & direct KE', async function () {
      // Given
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      // When
      const knowledgeElements = await knowledgeElementRepository.findInvalidatedAndDirectByUserId(userId);

      // Then
      expect(knowledgeElements).to.have.length(0);
    });
  });
});
