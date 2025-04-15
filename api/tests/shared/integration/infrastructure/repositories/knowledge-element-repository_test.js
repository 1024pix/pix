import _ from 'lodash';

import * as knowledgeElementSnapshotAPI from '../../../../../src/prescription/campaign/application/api/knowledge-element-snapshots-api.js';
import { KnowledgeElementSnapshot } from '../../../../../src/prescription/campaign/application/api/models/KnowledgeElementSnapshot.js';
import { CampaignTypes } from '../../../../../src/prescription/shared/domain/constants.js';
import { KnowledgeElementCollection } from '../../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';
import { Assessment, KnowledgeElement } from '../../../../../src/shared/domain/models/index.js';
import { repositories } from '../../../../../src/shared/infrastructure/repositories/index.js';
import { catchErr, databaseBuilder, domainBuilder, expect, knex, sinon } from '../../../../test-helper.js';

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
      const savedKnowledgeElements = await repositories.knowledgeElementRepository.batchSave({
        knowledgeElements: knowledgeElementsToSave,
      });

      // then
      expect(savedKnowledgeElements).to.have.lengthOf(2);
      expect(savedKnowledgeElements[0]).to.deepEqualInstanceOmitting(knowledgeElementsToSave[0], ['createdAt', 'id']);
      expect(savedKnowledgeElements[1]).to.deepEqualInstanceOmitting(knowledgeElementsToSave[1], ['createdAt', 'id']);
      expect(savedKnowledgeElements[0].createdAt).to.deep.equal(savedKnowledgeElements[1].createdAt);
    });
  });

  describe('#saveForCampaignParticipation', function () {
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
          skillId: 'nouvelAcquis1',
        }),
      );
      knowledgeElementsToSave.push(
        domainBuilder.buildKnowledgeElement({
          userId,
          assessmentId,
          answerId: answerId2,
          competenceId: 'recABC',
          skillId: 'nouvelAcquis2',
        }),
      );

      return databaseBuilder.commit();
    });

    context('when campaign participation is invalid', function () {
      it('should throw an Error without saving anything when campaign participation does not refer to existing entities', async function () {
        // when
        const err = await catchErr(repositories.knowledgeElementRepository.saveForCampaignParticipation)({
          knowledgeElements: knowledgeElementsToSave,
          campaignParticipationId: 456,
        });

        // then
        const [{ count }] = await knex('knowledge-elements').count();
        expect(count).to.equal(0);
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.equal('Invalid campaign participation 456');
      });

      it('should throw an Error without saving anything when campaign participation is not defined', async function () {
        // when
        const err = await catchErr(repositories.knowledgeElementRepository.saveForCampaignParticipation)({
          knowledgeElements: knowledgeElementsToSave,
          campaignParticipationId: null,
        });

        // then
        const [{ count }] = await knex('knowledge-elements').count();
        expect(count).to.equal(0);
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.equal('Invalid campaign participation null');
      });
    });

    context('when campaign participation is valid', function () {
      context('when campaign is of type PROFILES_COLLECTION', function () {
        it('should not save anything in DB and throw an error', async function () {
          // given
          const campaignId = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.PROFILES_COLLECTION }).id;
          const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
          }).id;
          await databaseBuilder.commit();

          // when
          const err = await catchErr(repositories.knowledgeElementRepository.saveForCampaignParticipation)({
            knowledgeElements: knowledgeElementsToSave,
            campaignParticipationId,
          });

          // then
          const [{ count }] = await knex('knowledge-elements').count();
          expect(count).to.equal(0);
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal('Saving knowledge-elements for campaign of type undefined not implemented');
        });
      });
      context('when campaign is of type ASSESSMENT', function () {
        it('should save all the knowledgeElements in table "knowledge-elements"', async function () {
          // given
          const campaignId = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.ASSESSMENT }).id;
          const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
          }).id;
          await databaseBuilder.commit();

          // when
          await repositories.knowledgeElementRepository.saveForCampaignParticipation({
            knowledgeElements: knowledgeElementsToSave,
            campaignParticipationId,
          });

          // then
          const keFromDB = await knex('knowledge-elements').orderBy('skillId');
          expect(keFromDB.length).to.equal(2);
          expect(_.omit(keFromDB[0], ['createdAt', 'id'])).to.deep.equal(
            _.omit(knowledgeElementsToSave[0], ['createdAt', 'id']),
          );
          expect(_.omit(keFromDB[1], ['createdAt', 'id'])).to.deep.equal(
            _.omit(knowledgeElementsToSave[1], ['createdAt', 'id']),
          );
        });
      });
      context('when campaign is of type EXAM', function () {
        let clock;

        beforeEach(function () {
          clock = sinon.useFakeTimers(new Date('2021-10-29'));
        });

        afterEach(function () {
          clock.restore();
        });
        context('when a snapshot for this participation already exists', function () {
          it('should save the knowledge elements through an updated snapshot', async function () {
            // given
            const userId = databaseBuilder.factory.buildUser().id;
            const campaignId = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.EXAM }).id;
            const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
              campaignId,
              userId,
            }).id;
            const knowledgeElement1 = domainBuilder.buildKnowledgeElement({
              userId,
              createdAt: new Date('2019-03-01'),
              skillId: 'acquis1',
            });
            const knowledgeElement2 = domainBuilder.buildKnowledgeElement({
              userId,
              createdAt: new Date('2019-03-01'),
              skillId: 'acquis2',
            });
            const knowledgeElementsBefore = new KnowledgeElementCollection([knowledgeElement1, knowledgeElement2]);
            databaseBuilder.factory.buildKnowledgeElementSnapshot({
              campaignParticipationId,
              snapshot: knowledgeElementsBefore.toSnapshot(),
            });
            await databaseBuilder.commit();

            // when
            await repositories.knowledgeElementRepository.saveForCampaignParticipation({
              knowledgeElements: knowledgeElementsToSave,
              campaignParticipationId,
            });

            // then
            const [{ count }] = await knex('knowledge-elements').count();
            expect(count).to.equal(0);
            const snapshotForParticipation =
              await knowledgeElementSnapshotAPI.getByParticipation(campaignParticipationId);
            expect(snapshotForParticipation).to.deepEqualInstance(
              new KnowledgeElementSnapshot({
                campaignParticipationId,
                knowledgeElements: [
                  new KnowledgeElement({
                    ...knowledgeElementsToSave[0],
                    assessmentId: undefined,
                    answerId: undefined,
                    userId: undefined,
                    id: undefined,
                    createdAt: new Date(),
                  }),
                  new KnowledgeElement({
                    ...knowledgeElementsToSave[1],
                    assessmentId: undefined,
                    answerId: undefined,
                    userId: undefined,
                    id: undefined,
                    createdAt: new Date(),
                  }),
                  new KnowledgeElement({
                    ...knowledgeElement1,
                    assessmentId: undefined,
                    answerId: undefined,
                    userId: undefined,
                    id: undefined,
                  }),
                  new KnowledgeElement({
                    ...knowledgeElement2,
                    assessmentId: undefined,
                    answerId: undefined,
                    userId: undefined,
                    id: undefined,
                  }),
                ],
              }),
            );
          });
        });
        context('when there is no snapshot for this participation', function () {
          it('should save the knowledge elements through a new snapshot', async function () {
            // given
            const userId = databaseBuilder.factory.buildUser().id;
            const campaignId = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.EXAM }).id;
            const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
              campaignId,
              userId,
            }).id;
            await databaseBuilder.commit();

            // when
            await repositories.knowledgeElementRepository.saveForCampaignParticipation({
              knowledgeElements: knowledgeElementsToSave,
              campaignParticipationId,
            });

            // then
            const [{ count }] = await knex('knowledge-elements').count();
            expect(count).to.equal(0);
            const snapshotForParticipation =
              await knowledgeElementSnapshotAPI.getByParticipation(campaignParticipationId);
            expect(snapshotForParticipation).to.deepEqualInstance(
              new KnowledgeElementSnapshot({
                campaignParticipationId,
                knowledgeElements: [
                  new KnowledgeElement({
                    ...knowledgeElementsToSave[0],
                    assessmentId: undefined,
                    answerId: undefined,
                    userId: undefined,
                    id: undefined,
                    createdAt: new Date(),
                  }),
                  new KnowledgeElement({
                    ...knowledgeElementsToSave[1],
                    assessmentId: undefined,
                    answerId: undefined,
                    userId: undefined,
                    id: undefined,
                    createdAt: new Date(),
                  }),
                ],
              }),
            );
          });
        });
      });
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
        return repositories.knowledgeElementRepository.findUniqByUserId({ userId });
      });

      // then
      expect(knowledgeElementsFound).have.lengthOf(4);
      expect(knowledgeElementsFound).to.have.deep.members(knowledgeElementsWantedTrx);
    });

    context('when there is no limit date', function () {
      it('should find the knowledge elements for campaign assessment associated with a user id', async function () {
        // when
        const knowledgeElementsFound = await repositories.knowledgeElementRepository.findUniqByUserId({ userId });

        // then
        expect(knowledgeElementsFound).have.lengthOf(3);
        expect(knowledgeElementsFound).to.have.deep.members(knowledgeElementsWanted);
      });
    });

    context('when there is a limit date', function () {
      it('should find the knowledge elements for campaign assessment associated with a user id created before limit date', async function () {
        // when
        const knowledgeElementsFound = await repositories.knowledgeElementRepository.findUniqByUserId({
          userId,
          limitDate: today,
        });

        // then
        expect(knowledgeElementsFound).to.have.deep.members(knowledgeElementsWantedWithLimitDate);
        expect(knowledgeElementsFound).have.lengthOf(2);
      });
    });

    context('when there are skill IDs', function () {
      it('should find the knowledge elements associated with a user id filtered by skill IDs', async function () {
        // when
        const skillIds = ['1', '3'];
        const knowledgeElementsFound = await repositories.knowledgeElementRepository.findUniqByUserId({
          userId,
          skillIds,
        });

        // then
        expect(knowledgeElementsFound).to.have.deep.members(knowledgeElementsWantedWithLimitDate);
        expect(knowledgeElementsFound).have.lengthOf(2);
      });
    });

    context('when there are no skill IDs', function () {
      it('should find the knowledge elements associated with a user id', async function () {
        // when
        const knowledgeElementsFound = await repositories.knowledgeElementRepository.findUniqByUserId({ userId });

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
      const knowledgeElementsFound = await repositories.knowledgeElementRepository.findUniqByUserIdAndAssessmentId({
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
        await repositories.knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId({ userId });

      // then
      expect(actualKnowledgeElementsGroupedByCompetenceId[1]).to.have.lengthOf(2);
      expect(actualKnowledgeElementsGroupedByCompetenceId[2]).to.have.lengthOf(1);
      expect(actualKnowledgeElementsGroupedByCompetenceId[1][0]).to.be.instanceOf(KnowledgeElement);
    });
  });

  describe('#findUniqByUserIdAndCompetenceId', function () {
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
      const actualKnowledgeElements = await repositories.knowledgeElementRepository.findUniqByUserIdAndCompetenceId({
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
        const knowledgeElementFound = await repositories.knowledgeElementRepository.findUniqByUserIdAndCompetenceId({
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
      const knowledgeElements = await repositories.knowledgeElementRepository.findInvalidatedAndDirectByUserId({
        userId,
      });

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
      const knowledgeElements = await repositories.knowledgeElementRepository.findInvalidatedAndDirectByUserId({
        userId,
      });

      // Then
      expect(knowledgeElements).to.have.lengthOf(0);
    });
  });

  describe('#findUniqByUserIds', function () {
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
      const knowledgeElementsByUserIdAndCompetenceId = await repositories.knowledgeElementRepository.findUniqByUserIds({
        userIds: [userId1, userId2],
      });

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

  describe('#findUniqByUserIdForCampaignParticipation', function () {
    context('when participation ID does not refer to an existing participation', function () {
      it('should return null', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const assessmentId = databaseBuilder.factory.buildAssessment().id;
        const answerId = databaseBuilder.factory.buildAnswer({ assessmentId }).id;
        const domainKE = domainBuilder.buildKnowledgeElement({
          userId,
          skillId: 'acquisABC123',
          answerId,
          assessmentId,
        });
        databaseBuilder.factory.buildKnowledgeElementSnapshot({
          userId: userId,
          snapshot: new KnowledgeElementCollection([domainKE]).toSnapshot(),
        });
        databaseBuilder.factory.buildKnowledgeElement(domainKE);
        await databaseBuilder.commit();

        // when
        const res = await repositories.knowledgeElementRepository.findUniqByUserIdForCampaignParticipation({
          userId,
          campaignParticipationId: 777,
        });

        // then
        expect(res).to.be.null;
      });
    });

    context('when campaign is of an unknown type', function () {
      it('should return null', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const campaignId = databaseBuilder.factory.buildCampaign({ type: 'Bouloulou' }).id;
        const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
        }).id;
        const assessmentId = databaseBuilder.factory.buildAssessment({ campaignParticipationId }).id;
        const answerId = databaseBuilder.factory.buildAnswer({ assessmentId }).id;
        const domainKEInSnapshot = domainBuilder.buildKnowledgeElement({
          id: 1,
          userId,
          skillId: 'acquisABC123',
          answerId,
          assessmentId,
          createdAt: new Date('2021-01-01'),
        });
        const domainKENotInSnapshot = domainBuilder.buildKnowledgeElement({
          id: 2,
          userId,
          skillId: 'acquisDEF456',
          answerId,
          assessmentId,
          createdAt: new Date('2022-01-01'),
        });
        databaseBuilder.factory.buildKnowledgeElementSnapshot({
          userId: userId,
          campaignParticipationId,
          snapshot: new KnowledgeElementCollection([domainKEInSnapshot]).toSnapshot(),
        });
        databaseBuilder.factory.buildKnowledgeElement(domainKEInSnapshot);
        databaseBuilder.factory.buildKnowledgeElement(domainKENotInSnapshot);
        await databaseBuilder.commit();

        // when
        const res = await repositories.knowledgeElementRepository.findUniqByUserIdForCampaignParticipation({
          userId,
          campaignParticipationId,
        });

        // then
        expect(res).to.be.null;
      });
    });

    context('when campaign is of type PROFILES_COLLECTION', function () {
      context('when a limit date is provided', function () {
        it('should return the Knowledge Elements of the user before limitdate', async function () {
          // given
          const limitDate = new Date('2025-01-01');
          const userId = databaseBuilder.factory.buildUser().id;
          const campaignId = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.PROFILES_COLLECTION }).id;
          const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
          }).id;
          const assessmentId = databaseBuilder.factory.buildAssessment({ campaignParticipationId }).id;
          const answerId = databaseBuilder.factory.buildAnswer({ assessmentId }).id;
          const domainKE1 = domainBuilder.buildKnowledgeElement({
            id: 1,
            userId,
            skillId: 'acquisABC123',
            answerId,
            assessmentId,
            createdAt: new Date('2021-01-01'),
          });
          const domainKE2 = domainBuilder.buildKnowledgeElement({
            id: 2,
            userId,
            skillId: 'acquisDEF456',
            answerId,
            assessmentId,
            createdAt: new Date('2022-01-01'),
          });
          const afterDateKE3 = domainBuilder.buildKnowledgeElement({
            id: 3,
            userId,
            skillId: 'acquisJHI789',
            answerId,
            assessmentId,
            createdAt: new Date('2026-01-01'),
          });
          databaseBuilder.factory.buildKnowledgeElement(domainKE1);
          databaseBuilder.factory.buildKnowledgeElement(domainKE2);
          databaseBuilder.factory.buildKnowledgeElement(afterDateKE3);
          await databaseBuilder.commit();

          // when
          const res = await repositories.knowledgeElementRepository.findUniqByUserIdForCampaignParticipation({
            userId,
            campaignParticipationId,
            limitDate,
          });

          // then
          expect(res).to.deep.equal([domainKE2, domainKE1]);
        });
      });
      context('when no limit date is provided', function () {
        it('should return the Knowledge Elements of the user regardless of date', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser().id;
          const campaignId = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.PROFILES_COLLECTION }).id;
          const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
          }).id;
          const assessmentId = databaseBuilder.factory.buildAssessment({ campaignParticipationId }).id;
          const answerId = databaseBuilder.factory.buildAnswer({ assessmentId }).id;
          const domainKE1 = domainBuilder.buildKnowledgeElement({
            id: 1,
            userId,
            skillId: 'acquisABC123',
            answerId,
            assessmentId,
            createdAt: new Date('2021-01-01'),
          });
          const domainKE2 = domainBuilder.buildKnowledgeElement({
            id: 2,
            userId,
            skillId: 'acquisDEF456',
            answerId,
            assessmentId,
            createdAt: new Date('2022-01-01'),
          });
          databaseBuilder.factory.buildKnowledgeElement(domainKE1);
          databaseBuilder.factory.buildKnowledgeElement(domainKE2);
          await databaseBuilder.commit();

          // when
          const res = await repositories.knowledgeElementRepository.findUniqByUserIdForCampaignParticipation({
            userId,
            campaignParticipationId,
          });

          // then
          expect(res).to.deep.equal([domainKE2, domainKE1]);
        });
      });
    });

    context('when campaign is of type ASSESSMENT', function () {
      context('when a limit date is provided', function () {
        it('should return the Knowledge Elements of the user before limitdate', async function () {
          // given
          const limitDate = new Date('2025-01-01');
          const userId = databaseBuilder.factory.buildUser().id;
          const campaignId = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.ASSESSMENT }).id;
          const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
          }).id;
          const assessmentId = databaseBuilder.factory.buildAssessment({ campaignParticipationId }).id;
          const answerId = databaseBuilder.factory.buildAnswer({ assessmentId }).id;
          const domainKE1 = domainBuilder.buildKnowledgeElement({
            id: 1,
            userId,
            skillId: 'acquisABC123',
            answerId,
            assessmentId,
            createdAt: new Date('2021-01-01'),
          });
          const domainKE2 = domainBuilder.buildKnowledgeElement({
            id: 2,
            userId,
            skillId: 'acquisDEF456',
            answerId,
            assessmentId,
            createdAt: new Date('2022-01-01'),
          });
          const afterDateKE3 = domainBuilder.buildKnowledgeElement({
            id: 3,
            userId,
            skillId: 'acquisJHI789',
            answerId,
            assessmentId,
            createdAt: new Date('2026-01-01'),
          });
          databaseBuilder.factory.buildKnowledgeElement(domainKE1);
          databaseBuilder.factory.buildKnowledgeElement(domainKE2);
          databaseBuilder.factory.buildKnowledgeElement(afterDateKE3);
          await databaseBuilder.commit();

          // when
          const res = await repositories.knowledgeElementRepository.findUniqByUserIdForCampaignParticipation({
            userId,
            campaignParticipationId,
            limitDate,
          });

          // then
          expect(res).to.deep.equal([domainKE2, domainKE1]);
        });
      });
      context('when no limit date is provided', function () {
        it('should return the Knowledge Elements of the user regardless of date', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser().id;
          const campaignId = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.ASSESSMENT }).id;
          const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
          }).id;
          const assessmentId = databaseBuilder.factory.buildAssessment({ campaignParticipationId }).id;
          const answerId = databaseBuilder.factory.buildAnswer({ assessmentId }).id;
          const domainKE1 = domainBuilder.buildKnowledgeElement({
            id: 1,
            userId,
            skillId: 'acquisABC123',
            answerId,
            assessmentId,
            createdAt: new Date('2021-01-01'),
          });
          const domainKE2 = domainBuilder.buildKnowledgeElement({
            id: 2,
            userId,
            skillId: 'acquisDEF456',
            answerId,
            assessmentId,
            createdAt: new Date('2022-01-01'),
          });
          databaseBuilder.factory.buildKnowledgeElement(domainKE1);
          databaseBuilder.factory.buildKnowledgeElement(domainKE2);
          await databaseBuilder.commit();

          // when
          const res = await repositories.knowledgeElementRepository.findUniqByUserIdForCampaignParticipation({
            userId,
            campaignParticipationId,
          });

          // then
          expect(res).to.deep.equal([domainKE2, domainKE1]);
        });
      });
    });

    context('when campaign is of type EXAM', function () {
      context('when there is no snapshot for participation', function () {
        it('should return an empty array', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser().id;
          const campaignId = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.EXAM }).id;
          const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
          }).id;
          const assessmentId = databaseBuilder.factory.buildAssessment({ campaignParticipationId }).id;
          const competenceEvaluationAssessmentId = databaseBuilder.factory.buildAssessment({
            type: Assessment.types.COMPETENCE_EVALUATION,
          }).id;
          const otherAnswerId = databaseBuilder.factory.buildAnswer({ assessmentId }).id;
          const domainKEOutsideOfParticipation = domainBuilder.buildKnowledgeElement({
            id: 1,
            userId,
            skillId: 'acquisABC123',
            answerId: otherAnswerId,
            assessmentId: competenceEvaluationAssessmentId,
            createdAt: new Date('2021-01-01'),
          });
          databaseBuilder.factory.buildKnowledgeElement(domainKEOutsideOfParticipation);
          await databaseBuilder.commit();

          // when
          const res = await repositories.knowledgeElementRepository.findUniqByUserIdForCampaignParticipation({
            userId,
            campaignParticipationId,
          });

          // then
          expect(res).to.deep.equal([]);
        });
      });

      context('when there is a snapshot for participation', function () {
        it('should return the Knowledge Elements in the snapshot', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser().id;
          const campaignId = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.EXAM }).id;
          const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
          }).id;
          const assessmentId = databaseBuilder.factory.buildAssessment({ campaignParticipationId }).id;
          const competenceEvaluationAssessmentId = databaseBuilder.factory.buildAssessment({
            type: Assessment.types.COMPETENCE_EVALUATION,
          }).id;
          const answerId = databaseBuilder.factory.buildAnswer({ assessmentId }).id;
          const otherAnswerId = databaseBuilder.factory.buildAnswer({ assessmentId }).id;
          const domainKEOutsideOfParticipation = domainBuilder.buildKnowledgeElement({
            id: 1,
            userId,
            skillId: 'acquisABC123',
            answerId: otherAnswerId,
            assessmentId: competenceEvaluationAssessmentId,
            createdAt: new Date('2021-01-01'),
          });
          const domainKEInParticipation = domainBuilder.buildKnowledgeElement({
            id: 'not_a_real_ke',
            userId,
            skillId: 'acquisDEF456',
            answerId,
            assessmentId,
            createdAt: new Date('2022-01-01'),
          });
          databaseBuilder.factory.buildKnowledgeElementSnapshot({
            userId: userId,
            campaignParticipationId,
            snapshot: new KnowledgeElementCollection([domainKEInParticipation]).toSnapshot(),
          });
          databaseBuilder.factory.buildKnowledgeElement(domainKEOutsideOfParticipation);
          await databaseBuilder.commit();

          // when
          const res = await repositories.knowledgeElementRepository.findUniqByUserIdForCampaignParticipation({
            userId,
            campaignParticipationId,
          });

          // then
          expect(res).to.deep.equal([
            new KnowledgeElement({
              ...domainKEInParticipation,
              assessmentId: undefined,
              answerId: undefined,
              id: undefined,
              userId: undefined,
            }),
          ]);
        });
      });
    });

    it('should be DomainTransaction compliant', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignId = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.ASSESSMENT }).id;
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        sharedAt: null,
      }).id;
      const assessmentId = databaseBuilder.factory.buildAssessment({ campaignParticipationId }).id;
      const answerId = databaseBuilder.factory.buildAnswer({ assessmentId }).id;
      const domainKEInSnapshot = domainBuilder.buildKnowledgeElement({
        id: 1,
        userId,
        skillId: 'acquisABC123',
        answerId,
        assessmentId,
        createdAt: new Date('2021-01-01'),
      });
      const domainKENotInSnapshot = domainBuilder.buildKnowledgeElement({
        id: 2,
        userId,
        skillId: 'acquisDEF456',
        answerId,
        assessmentId,
        createdAt: new Date('2022-01-01'),
      });
      const extraDomainKE = domainBuilder.buildKnowledgeElement({
        id: 3,
        userId,
        skillId: 'acquisJHI789',
        answerId,
        assessmentId,
        createdAt: new Date('2023-01-01'),
      });
      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        userId: userId,
        campaignParticipationId,
        snapshot: new KnowledgeElementCollection([domainKEInSnapshot]).toSnapshot(),
      });
      databaseBuilder.factory.buildKnowledgeElement(domainKEInSnapshot);
      databaseBuilder.factory.buildKnowledgeElement(domainKENotInSnapshot);
      await databaseBuilder.commit();
      const knowledgeElementsWantedTrx = [extraDomainKE, domainKENotInSnapshot, domainKEInSnapshot];

      // when
      const knowledgeElementsFound = await DomainTransaction.execute(async (domainTransaction) => {
        await domainTransaction.knexTransaction('knowledge-elements').insert(extraDomainKE);
        return repositories.knowledgeElementRepository.findUniqByUserIdForCampaignParticipation({
          userId,
          campaignParticipationId,
        });
      });

      // then
      expect(knowledgeElementsFound).to.deep.equal(knowledgeElementsWantedTrx);
    });

    context('KE selection', function () {
      let assessmentId, campaignParticipationId, answerId, userId;
      beforeEach(async function () {
        userId = databaseBuilder.factory.buildUser().id;
        const campaignId = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.ASSESSMENT }).id;
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          sharedAt: null,
        }).id;
        assessmentId = databaseBuilder.factory.buildAssessment({ campaignParticipationId }).id;
        answerId = databaseBuilder.factory.buildAnswer({ assessmentId }).id;
      });

      it('should chose most recent KE when many KEs exist for a given skill', async function () {
        // given
        const keA_old = domainBuilder.buildKnowledgeElement({
          id: 1,
          userId,
          skillId: 'acquisA',
          answerId,
          assessmentId,
          createdAt: new Date('2021-01-01'),
          status: KnowledgeElement.StatusType.VALIDATED,
        });
        const keA_new = domainBuilder.buildKnowledgeElement({
          id: 2,
          userId,
          skillId: 'acquisA',
          answerId,
          assessmentId,
          createdAt: new Date('2022-01-01'),
          status: KnowledgeElement.StatusType.INVALIDATED,
        });
        databaseBuilder.factory.buildKnowledgeElement(keA_old);
        databaseBuilder.factory.buildKnowledgeElement(keA_new);
        await databaseBuilder.commit();

        // when
        const res = await repositories.knowledgeElementRepository.findUniqByUserIdForCampaignParticipation({
          userId,
          campaignParticipationId,
        });

        // then
        expect(res).to.deep.equal([keA_new]);
      });

      it('should ignore all KE of a given skill when most recent one is a RESET', async function () {
        // given
        const keA_old = domainBuilder.buildKnowledgeElement({
          id: 1,
          userId,
          skillId: 'acquisA',
          answerId,
          assessmentId,
          createdAt: new Date('2021-01-01'),
          status: KnowledgeElement.StatusType.VALIDATED,
        });
        const keA_new = domainBuilder.buildKnowledgeElement({
          id: 2,
          userId,
          skillId: 'acquisA',
          answerId,
          assessmentId,
          createdAt: new Date('2022-01-01'),
          status: KnowledgeElement.StatusType.RESET,
        });
        databaseBuilder.factory.buildKnowledgeElement(keA_old);
        databaseBuilder.factory.buildKnowledgeElement(keA_new);
        await databaseBuilder.commit();

        // when
        const res = await repositories.knowledgeElementRepository.findUniqByUserIdForCampaignParticipation({
          userId,
          campaignParticipationId,
        });

        // then
        expect(res).to.deep.equal([]);
      });

      it('should chose most recent KE when many KEs exist for a given skill, even if there are some RESET KEs', async function () {
        // given
        const keA_super_old = domainBuilder.buildKnowledgeElement({
          id: 1,
          userId,
          skillId: 'acquisA',
          answerId,
          assessmentId,
          createdAt: new Date('2021-01-01'),
          status: KnowledgeElement.StatusType.VALIDATED,
        });
        const keA_old = domainBuilder.buildKnowledgeElement({
          id: 2,
          userId,
          skillId: 'acquisA',
          answerId,
          assessmentId,
          createdAt: new Date('2022-01-01'),
          status: KnowledgeElement.StatusType.RESET,
        });
        const keA_new = domainBuilder.buildKnowledgeElement({
          id: 3,
          userId,
          skillId: 'acquisA',
          answerId,
          assessmentId,
          createdAt: new Date('2023-01-01'),
          status: KnowledgeElement.StatusType.INVALIDATED,
        });
        databaseBuilder.factory.buildKnowledgeElement(keA_old);
        databaseBuilder.factory.buildKnowledgeElement(keA_new);
        databaseBuilder.factory.buildKnowledgeElement(keA_super_old);
        await databaseBuilder.commit();

        // when
        const res = await repositories.knowledgeElementRepository.findUniqByUserIdForCampaignParticipation({
          userId,
          campaignParticipationId,
        });

        // then
        expect(res).to.deep.equal([keA_new]);
      });

      it('should return knowledge elements ordered by created at date, descending', async function () {
        // given
        const keA = domainBuilder.buildKnowledgeElement({
          id: 1,
          userId,
          skillId: 'acquisA',
          answerId,
          assessmentId,
          createdAt: new Date('2021-01-01'),
          status: KnowledgeElement.StatusType.VALIDATED,
        });
        const keB = domainBuilder.buildKnowledgeElement({
          id: 2,
          userId,
          skillId: 'acquisB',
          answerId,
          assessmentId,
          createdAt: new Date('2020-01-01'),
          status: KnowledgeElement.StatusType.INVALIDATED,
        });
        databaseBuilder.factory.buildKnowledgeElement(keA);
        databaseBuilder.factory.buildKnowledgeElement(keB);
        await databaseBuilder.commit();

        // when
        const res = await repositories.knowledgeElementRepository.findUniqByUserIdForCampaignParticipation({
          userId,
          campaignParticipationId,
        });

        // then
        expect(res).to.deep.equal([keA, keB]);
      });
    });
  });
});
