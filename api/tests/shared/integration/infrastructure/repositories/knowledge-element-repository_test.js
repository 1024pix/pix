import _ from 'lodash';

import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';
import { KnowledgeElement } from '../../../../../src/shared/domain/models/KnowledgeElement.js';
import * as knowledgeElementRepository from '../../../../../src/shared/infrastructure/repositories/knowledge-element-repository.js';
import { databaseBuilder, domainBuilder, expect } from '../../../../test-helper.js';

describe('Integration | Repository | knowledgeElementRepository', function () {
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
      const savedKnowledgeElements = await knowledgeElementRepository.batchSave({
        knowledgeElements: knowledgeElementsToSave,
      });

      // then
      expect(savedKnowledgeElements).to.have.lengthOf(2);
      expect(savedKnowledgeElements[0]).to.deepEqualInstanceOmitting(knowledgeElementsToSave[0], ['createdAt', 'id']);
      expect(savedKnowledgeElements[1]).to.deepEqualInstanceOmitting(knowledgeElementsToSave[1], ['createdAt', 'id']);
      expect(savedKnowledgeElements[0].createdAt).to.deep.equal(savedKnowledgeElements[1].createdAt);
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
        return knowledgeElementRepository.findUniqByUserId({ userId });
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

    context('when there are skill IDs', function () {
      it('should find the knowledge elements associated with a user id filtered by skill IDs', async function () {
        // when
        const skillIds = ['1', '3'];
        const knowledgeElementsFound = await knowledgeElementRepository.findUniqByUserId({ userId, skillIds });

        // then
        expect(knowledgeElementsFound).to.have.deep.members(knowledgeElementsWantedWithLimitDate);
        expect(knowledgeElementsFound).have.lengthOf(2);
      });
    });

    context('when there are no skill IDs', function () {
      it('should find the knowledge elements associated with a user id', async function () {
        // when
        const knowledgeElementsFound = await knowledgeElementRepository.findUniqByUserId({ userId });

        // then
        expect(knowledgeElementsFound).to.have.deep.members(knowledgeElementsWanted);
        expect(knowledgeElementsFound).have.lengthOf(3);
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
      expect(actualKnowledgeElementsGroupedByCompetenceId[1]).to.have.lengthOf(2);
      expect(actualKnowledgeElementsGroupedByCompetenceId[2]).to.have.lengthOf(1);
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
      expect(knowledgeElements).to.have.lengthOf(2);
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
      expect(knowledgeElements).to.have.lengthOf(0);
    });
  });

  describe('#findKeForUsers', function () {
    let userId1;
    let userId2;

    beforeEach(function () {
      userId1 = databaseBuilder.factory.buildUser().id;
      userId2 = databaseBuilder.factory.buildUser().id;
      return databaseBuilder.commit();
    });

    it('should return knowledge elements for given users', async function () {
      // given

      const user1knowledgeElement1 = databaseBuilder.factory.buildKnowledgeElement({
        userId: userId1,
        createdAt: new Date('2020-01-01'),
        skillId: 'rec1',
      });
      const user2knowledgeElement1 = databaseBuilder.factory.buildKnowledgeElement({
        userId: userId2,
        createdAt: new Date('2019-01-01'),
        skillId: 'rec2',
      });
      const user2knowledgeElement2 = databaseBuilder.factory.buildKnowledgeElement({
        userId: userId2,
        createdAt: new Date('2019-01-02'),
        skillId: 'rec3',
      });
      await databaseBuilder.commit();

      // when
      const knowledgeElementsByUserIdAndCompetenceId = await knowledgeElementRepository.findUniqByUserIds([
        userId1,
        userId2,
      ]);

      // then
      expect(knowledgeElementsByUserIdAndCompetenceId[0].knowledgeElements).to.have.deep.members([
        user1knowledgeElement1,
      ]);
      expect(knowledgeElementsByUserIdAndCompetenceId[1].knowledgeElements).to.have.deep.members([
        user2knowledgeElement1,
        user2knowledgeElement2,
      ]);
    });
  });
});
