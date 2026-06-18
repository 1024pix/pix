import sinon from 'sinon';

import {
  CampaignParticipationStatuses,
  CampaignTypes,
} from '../../../../../../src/prescription/shared/domain/constants.js';
import { KnowledgeElementCollection } from '../../../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import knowledgeElementForParticipationService from '../../../../../../src/prescription/shared/domain/services/knowledge-element-for-participation-service.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { KnowledgeElement } from '../../../../../../src/shared/domain/models/KnowledgeElement.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Integration | Prescription | Shared | Service | KnowledgeElementForParticipationService', function () {
  describe('#save', function () {
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
        const err = await catchErr(
          knowledgeElementForParticipationService.save,
          knowledgeElementForParticipationService,
        )({
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
        const err = await catchErr(
          knowledgeElementForParticipationService.save,
          knowledgeElementForParticipationService,
        )({
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
          const err = await catchErr(
            knowledgeElementForParticipationService.save,
            knowledgeElementForParticipationService,
          )({
            knowledgeElements: knowledgeElementsToSave,
            campaignParticipationId,
          });

          // then
          const [{ count }] = await knex('knowledge-elements').count();
          expect(count).to.equal(0);
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal(
            'Saving knowledge-elements for campaign of type PROFILES_COLLECTION not implemented',
          );
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
          await knowledgeElementForParticipationService.save({
            knowledgeElements: knowledgeElementsToSave,
            campaignParticipationId,
          });

          // then

          const keFromDB = await knex('knowledge-elements').orderBy('skillId');
          // eslint-disable-next-line no-unused-vars
          const expectedKeFromDb = keFromDB.map(({ id, createdAt, ...keDb }) => keDb);
          // eslint-disable-next-line no-unused-vars
          const keToSave = knowledgeElementsToSave.map(({ id, createdAt, ...keTs }) => keTs);

          expect(keFromDB.length).to.equal(2);
          expect(expectedKeFromDb[0]).to.deep.equal(keToSave[0]);
          expect(expectedKeFromDb[1]).to.deep.equal(keToSave[1]);
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
            await knowledgeElementForParticipationService.save({
              knowledgeElements: knowledgeElementsToSave,
              campaignParticipationId,
            });

            // then
            const [{ count }] = await knex('knowledge-elements').count();
            expect(count).to.equal(0);
            const snapshotForParticipation = await knex('knowledge-element-snapshots')
              .select('campaignParticipationId', 'snapshot')
              .where({ campaignParticipationId })
              .first();
            expect(snapshotForParticipation).to.deep.equal({
              campaignParticipationId,
              snapshot: [
                {
                  competenceId: knowledgeElementsToSave[0].competenceId,
                  createdAt: new Date().toISOString(),
                  earnedPix: knowledgeElementsToSave[0].earnedPix,
                  skillId: knowledgeElementsToSave[0].skillId,
                  source: knowledgeElementsToSave[0].source,
                  status: knowledgeElementsToSave[0].status,
                },
                {
                  competenceId: knowledgeElementsToSave[1].competenceId,
                  createdAt: new Date().toISOString(),
                  earnedPix: knowledgeElementsToSave[1].earnedPix,
                  skillId: knowledgeElementsToSave[1].skillId,
                  source: knowledgeElementsToSave[1].source,
                  status: knowledgeElementsToSave[1].status,
                },
                {
                  competenceId: knowledgeElement1.competenceId,
                  createdAt: knowledgeElement1.createdAt.toISOString(),
                  earnedPix: knowledgeElement1.earnedPix,
                  skillId: knowledgeElement1.skillId,
                  source: knowledgeElement1.source,
                  status: knowledgeElement1.status,
                },
                {
                  competenceId: knowledgeElement2.competenceId,
                  createdAt: knowledgeElement2.createdAt.toISOString(),
                  earnedPix: knowledgeElement2.earnedPix,
                  skillId: knowledgeElement2.skillId,
                  source: knowledgeElement2.source,
                  status: knowledgeElement2.status,
                },
              ],
            });
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
            await knowledgeElementForParticipationService.save({
              knowledgeElements: knowledgeElementsToSave,
              campaignParticipationId,
            });

            // then
            const [{ count }] = await knex('knowledge-elements').count();
            expect(count).to.equal(0);
            const snapshotForParticipation = await knex('knowledge-element-snapshots')
              .select('campaignParticipationId', 'snapshot')
              .where({ campaignParticipationId })
              .first();
            expect(snapshotForParticipation).to.deep.equal({
              campaignParticipationId,
              snapshot: [
                {
                  competenceId: knowledgeElementsToSave[0].competenceId,
                  createdAt: new Date().toISOString(),
                  earnedPix: knowledgeElementsToSave[0].earnedPix,
                  skillId: knowledgeElementsToSave[0].skillId,
                  source: knowledgeElementsToSave[0].source,
                  status: knowledgeElementsToSave[0].status,
                },
                {
                  competenceId: knowledgeElementsToSave[1].competenceId,
                  createdAt: new Date().toISOString(),
                  earnedPix: knowledgeElementsToSave[1].earnedPix,
                  skillId: knowledgeElementsToSave[1].skillId,
                  source: knowledgeElementsToSave[1].source,
                  status: knowledgeElementsToSave[1].status,
                },
              ],
            });
          });
        });
      });
    });
  });

  describe('#findUniqByUserOrCampaignParticipationId', function () {
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
        const err = await catchErr(
          knowledgeElementForParticipationService.findUniqByUserOrCampaignParticipationId,
          knowledgeElementForParticipationService,
        )({
          userId,
          campaignParticipationId: 777,
        });

        // then
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.equal('Invalid campaign participation 777');
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
        const error = await catchErr(
          knowledgeElementForParticipationService.findUniqByUserOrCampaignParticipationId,
          knowledgeElementForParticipationService,
        )({
          userId,
          campaignParticipationId,
        });

        // then
        expect(error).instanceOf(Error);
        expect(error.message).to.equal('find knowledge-elements for campaign of type Bouloulou not implemented');
      });
    });

    context('when campaign is of type PROFILES_COLLECTION', function () {
      context('when a limit date is provided', function () {
        it('should return the Knowledge Elements of the user before limit date', async function () {
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
          const res = await knowledgeElementForParticipationService.findUniqByUserOrCampaignParticipationId({
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
          const res = await knowledgeElementForParticipationService.findUniqByUserOrCampaignParticipationId({
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
          const res = await knowledgeElementForParticipationService.findUniqByUserOrCampaignParticipationId({
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
          const res = await knowledgeElementForParticipationService.findUniqByUserOrCampaignParticipationId({
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
          const res = await knowledgeElementForParticipationService.findUniqByUserOrCampaignParticipationId({
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
          const res = await knowledgeElementForParticipationService.findUniqByUserOrCampaignParticipationId({
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
        return knowledgeElementForParticipationService.findUniqByUserOrCampaignParticipationId({
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
        const res = await knowledgeElementForParticipationService.findUniqByUserOrCampaignParticipationId({
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
        const res = await knowledgeElementForParticipationService.findUniqByUserOrCampaignParticipationId({
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
        const res = await knowledgeElementForParticipationService.findUniqByUserOrCampaignParticipationId({
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
        const res = await knowledgeElementForParticipationService.findUniqByUserOrCampaignParticipationId({
          userId,
          campaignParticipationId,
        });

        // then
        expect(res).to.deep.equal([keA, keB]);
      });
    });
  });

  describe('#findUniqByUsersOrCampaignParticipationIds', function () {
    context('When fetch data from snapshots', function () {
      it('should return empty ke elements on started participation', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const campaign = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.EXAM });
        const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: campaign.organizationId,
          userId,
        });

        const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          status: CampaignParticipationStatuses.STARTED,
          userId: organizationLearner.userId,
          organizationLearnerId: organizationLearner.id,
          campaignId: campaign.id,
        }).id;

        databaseBuilder.factory.buildKnowledgeElement({
          userId,
          skillId: 'acquisABC123',
          createdAt: new Date('2021-01-01'),
        });

        await databaseBuilder.commit();

        const res = await knowledgeElementForParticipationService.findUniqByUsersOrCampaignParticipationIds({
          participationInfos: [
            {
              userId,
              campaignParticipationId,
            },
          ],
          fetchFromSnapshot: true,
        });

        // then
        expect(res).to.deep.equal([
          {
            campaignParticipationId,
            knowledgeElements: [],
          },
        ]);
      });

      it('should return knowledge element saved in snapshots only', async function () {
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
          campaignParticipationId,
          snapshot: new KnowledgeElementCollection([domainKEInParticipation]).toSnapshot(),
        });

        databaseBuilder.factory.buildKnowledgeElement(domainKEOutsideOfParticipation);

        await databaseBuilder.commit();

        const res = await knowledgeElementForParticipationService.findUniqByUsersOrCampaignParticipationIds({
          participationInfos: [
            {
              userId,
              campaignParticipationId,
            },
          ],
          fetchFromSnapshot: true,
        });

        // then
        expect(res).to.deep.equal([
          {
            campaignParticipationId,
            knowledgeElements: [
              {
                ...domainKEInParticipation,
                answerId: undefined,
                assessmentId: undefined,
                id: undefined,
                userId: undefined,
              },
            ],
          },
        ]);
      });
    });

    context('When fetch data from knowledge element', function () {
      it('should return empty ke elements on started participation', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const campaign = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.ASSESSMENT });
        const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: campaign.organizationId,
          userId,
        });

        const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          status: CampaignParticipationStatuses.STARTED,
          userId: organizationLearner.userId,
          organizationLearnerId: organizationLearner.id,
          campaignId: campaign.id,
        }).id;

        await databaseBuilder.commit();

        const res = await knowledgeElementForParticipationService.findUniqByUsersOrCampaignParticipationIds({
          participationInfos: [
            {
              userId,
              campaignParticipationId,
            },
          ],
          fetchFromSnapshot: false,
        });

        // then
        expect(res).to.deep.equal([
          {
            userId,
            knowledgeElements: [],
          },
        ]);
      });

      it('should return knowledge element saved in knowledge element only', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const campaignId = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.ASSESSMENT }).id;
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
          id: 2,
          userId,
          skillId: 'acquisDEF456',
          answerId,
          assessmentId,
          createdAt: new Date('2022-01-01'),
        });
        databaseBuilder.factory.buildKnowledgeElementSnapshot({
          campaignParticipationId,
          snapshot: new KnowledgeElementCollection([domainKEInParticipation]).toSnapshot(),
        });

        databaseBuilder.factory.buildKnowledgeElement(domainKEInParticipation);
        databaseBuilder.factory.buildKnowledgeElement(domainKEOutsideOfParticipation);

        await databaseBuilder.commit();

        const res = await knowledgeElementForParticipationService.findUniqByUsersOrCampaignParticipationIds({
          participationInfos: [
            {
              userId,
              campaignParticipationId,
            },
          ],
          fetchFromSnapshot: false,
        });

        // then
        expect(res).to.deep.equal([
          {
            userId,
            knowledgeElements: [domainKEInParticipation, domainKEOutsideOfParticipation],
          },
        ]);
      });

      it('should only return knowledge element matching the given skillIds', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const campaignId = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.ASSESSMENT }).id;
        const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
        }).id;
        const assessmentId = databaseBuilder.factory.buildAssessment({ campaignParticipationId }).id;
        const answerId = databaseBuilder.factory.buildAnswer({ assessmentId }).id;
        const otherAnswerId = databaseBuilder.factory.buildAnswer({ assessmentId }).id;
        const domainKEOnTargetedSkill = domainBuilder.buildKnowledgeElement({
          id: 1,
          userId,
          skillId: 'acquisABC123',
          answerId,
          assessmentId,
          createdAt: new Date('2021-01-01'),
        });
        const domainKEOnOtherSkill = domainBuilder.buildKnowledgeElement({
          id: 2,
          userId,
          skillId: 'acquisDEF456',
          answerId: otherAnswerId,
          assessmentId,
          createdAt: new Date('2022-01-01'),
        });

        databaseBuilder.factory.buildKnowledgeElement(domainKEOnTargetedSkill);
        databaseBuilder.factory.buildKnowledgeElement(domainKEOnOtherSkill);

        await databaseBuilder.commit();

        const res = await knowledgeElementForParticipationService.findUniqByUsersOrCampaignParticipationIds({
          participationInfos: [
            {
              userId,
              campaignParticipationId,
            },
          ],
          fetchFromSnapshot: false,
          skillIds: ['acquisABC123'],
        });

        // then
        expect(res).to.deep.equal([
          {
            userId,
            knowledgeElements: [domainKEOnTargetedSkill],
          },
        ]);
      });
    });
  });
});
