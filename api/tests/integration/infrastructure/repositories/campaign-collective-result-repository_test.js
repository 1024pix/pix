import _ from 'lodash';
import { expect, databaseBuilder, domainBuilder, knex } from '../../../test-helper';
import campaignCollectiveResultRepository from '../../../../lib/infrastructure/repositories/campaign-collective-result-repository';
import CampaignCollectiveResult from '../../../../lib/domain/read-models/CampaignCollectiveResult';
import CampaignParticipationStatuses from '../../../../lib/domain/models/CampaignParticipationStatuses';

const { STARTED } = CampaignParticipationStatuses;

function _createUserWithSharedCampaignParticipation(userName, campaignId, sharedAt, isImproved) {
  const userId = databaseBuilder.factory.buildUser({ firstName: userName }).id;
  const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
    campaignId,
    userId,
    sharedAt,
    isImproved,
  });

  return { userId, campaignParticipation };
}

function _createUserWithSharedCampaignParticipationDeleted(userName, campaignId, sharedAt, deletedAt) {
  const userId = databaseBuilder.factory.buildUser({ firstName: userName }).id;
  const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
    campaignId,
    userId,
    sharedAt,
    deletedAt,
  });

  return { userId, campaignParticipation };
}

function _createUserWithNonSharedCampaignParticipation(userName, campaignId) {
  const userId = databaseBuilder.factory.buildUser({ firstName: userName }).id;
  const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
    campaignId,
    userId,
    status: STARTED,
    isImproved: false,
  });

  return { userId, campaignParticipation };
}

describe('Integration | Repository | Campaign collective result repository', function () {
  describe('#getCampaignCollectiveResults', function () {
    afterEach(function () {
      return knex('knowledge-element-snapshots').delete();
    });

    context('in a rich context close to reality', function () {
      let learningContent;
      let campaignId;

      beforeEach(async function () {
        campaignId = databaseBuilder.factory.buildCampaign().id;

        // Competence A - nobody validated skills @url4 and @url5
        const url1 = domainBuilder.buildSkill({ id: 'recUrl1', tubeId: 'recTubeA' });
        const url2 = domainBuilder.buildSkill({ id: 'recUrl2', tubeId: 'recTubeA' });
        const url3 = domainBuilder.buildSkill({ id: 'recUrl3', tubeId: 'recTubeA' });
        const url4 = domainBuilder.buildSkill({ id: 'recUrl4', tubeId: 'recTubeA' });
        const url5 = domainBuilder.buildSkill({ id: 'recUrl5', tubeId: 'recTubeA' });
        const tubeA = domainBuilder.buildTube({
          id: 'recTubeA',
          competenceId: 'recCompetenceA',
          skills: [url1, url2, url3, url4, url5],
        });

        // Competence B - all skills are validated by different people
        const file2 = domainBuilder.buildSkill({ id: 'recFile2', tubeId: 'recTubeB' });
        const file3 = domainBuilder.buildSkill({ id: 'recFile3', tubeId: 'recTubeB' });
        const file5 = domainBuilder.buildSkill({ id: 'recFile5', tubeId: 'recTubeB' });
        const text1 = domainBuilder.buildSkill({ id: 'recText1', tubeId: 'recTubeB' });
        const tubeB = domainBuilder.buildTube({
          id: 'recTubeB',
          competenceId: 'recCompetenceB',
          skills: [file2, file3, file5, text1],
        });

        // Competence C - skill @media2 is validated by someone but is not part of campaign target profile
        const media1 = domainBuilder.buildSkill({ id: 'recMedia1', tubeId: 'recTubeC' });
        const tubeC = domainBuilder.buildTube({
          id: 'recTubeC',
          competenceId: 'recCompetenceC',
          skills: [media1],
        });

        // Competence D - competence D is not covered by campaign target profile

        // Competence E - competence E is targeted by campaign but nobody validated its skills
        const browser1 = domainBuilder.buildSkill({ id: 'recBrowser1', tubeId: 'recTubeE' });
        const tubeE = domainBuilder.buildTube({
          id: 'recTubeE',
          competenceId: 'recCompetenceE',
          skills: [browser1],
        });

        // Competence F - skill is validated and then invalidated
        const computer1 = domainBuilder.buildSkill({ id: 'recComputer1', tubeId: 'recTubeF' });
        const tubeF = domainBuilder.buildTube({
          id: 'recTubeF',
          competenceId: 'recCompetenceF',
          skills: [computer1],
        });

        const area1 = domainBuilder.buildArea({
          id: 'recArea1',
          competences: [
            domainBuilder.buildCompetence({
              id: 'recCompetenceA',
              tubes: [tubeA],
              name: 'Competence A',
              index: '1.1',
              areaId: 'recArea1',
            }),
            domainBuilder.buildCompetence({
              id: 'recCompetenceB',
              tubes: [tubeB],
              name: 'Competence B',
              index: '1.2',
              areaId: 'recArea1',
            }),
            domainBuilder.buildCompetence({
              id: 'recCompetenceC',
              tubes: [tubeC],
              name: 'Competence C',
              index: '1.3',
              areaId: 'recArea1',
            }),
          ],
          color: 'jaffa',
        });

        const area2 = domainBuilder.buildArea({
          id: 'recArea2',
          color: 'emerald',
          competences: [
            domainBuilder.buildCompetence({
              id: 'recCompetenceE',
              tubes: [tubeE],
              name: 'Competence E',
              index: '2.2',
              areaId: 'recArea2',
            }),
            domainBuilder.buildCompetence({
              id: 'recCompetenceF',
              tubes: [tubeF],
              name: 'Competence F',
              index: '2.3',
              areaId: 'recArea2',
            }),
          ],
        });
        const framework = domainBuilder.buildFramework({ areas: [area1, area2] });

        learningContent = domainBuilder.buildCampaignLearningContent.fromFrameworks([framework]);
      });

      context('when there is no participant', function () {
        beforeEach(function () {
          return databaseBuilder.commit();
        });

        it('should resolves a collective result synthesis with default values for all competences', async function () {
          // when
          const result = await campaignCollectiveResultRepository.getCampaignCollectiveResult(
            campaignId,
            learningContent
          );

          // then
          expect(result).to.be.an.instanceof(CampaignCollectiveResult);
          expect(result.id).to.equal(campaignId);
          const competenceACollectiveResult = result.campaignCompetenceCollectiveResults[0];
          expect(competenceACollectiveResult).to.deep.include({
            areaCode: '1',
            areaColor: 'jaffa',
            competenceId: 'recCompetenceA',
            id: `${campaignId}_recCompetenceA`,
            competenceName: 'Competence A',
            targetedSkillsCount: 5,
            averageValidatedSkills: 0,
          });
          const competenceBCollectiveResult = result.campaignCompetenceCollectiveResults[1];
          expect(competenceBCollectiveResult).to.deep.include({
            areaCode: '1',
            areaColor: 'jaffa',
            competenceId: 'recCompetenceB',
            id: `${campaignId}_recCompetenceB`,
            competenceName: 'Competence B',
            targetedSkillsCount: 4,
            averageValidatedSkills: 0,
          });
          const competenceCCollectiveResult = result.campaignCompetenceCollectiveResults[2];
          expect(competenceCCollectiveResult).to.deep.include({
            areaCode: '1',
            areaColor: 'jaffa',
            competenceId: 'recCompetenceC',
            id: `${campaignId}_recCompetenceC`,
            competenceName: 'Competence C',
            targetedSkillsCount: 1,
            averageValidatedSkills: 0,
          });
          const competenceECollectiveResult = result.campaignCompetenceCollectiveResults[3];
          expect(competenceECollectiveResult).to.deep.include({
            areaCode: '2',
            areaColor: 'emerald',
            competenceId: 'recCompetenceE',
            id: `${campaignId}_recCompetenceE`,
            competenceName: 'Competence E',
            targetedSkillsCount: 1,
            averageValidatedSkills: 0,
          });
          const competenceFCollectiveResult = result.campaignCompetenceCollectiveResults[4];
          expect(competenceFCollectiveResult).to.deep.include({
            areaCode: '2',
            areaColor: 'emerald',
            competenceId: 'recCompetenceF',
            id: `${campaignId}_recCompetenceF`,
            competenceName: 'Competence F',
            targetedSkillsCount: 1,
            averageValidatedSkills: 0,
          });
        });
      });

      context('when there is a participant but she did not share its contribution', function () {
        beforeEach(function () {
          const goliathId = databaseBuilder.factory.buildUser({ firstName: 'Goliath' }).id;

          databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
            userId: goliathId,
            status: STARTED,
            isImproved: false,
          });

          databaseBuilder.factory.buildKnowledgeElement({
            userId: goliathId,
            competenceId: 'recCompetenceA',
            skillId: 'recUrl1',
            status: 'validated',
            createdAt: new Date('2019-02-01'),
          });

          return databaseBuilder.commit();
        });

        it('should resolves a collective result synthesis with default values for all competences', async function () {
          // when
          const result = await campaignCollectiveResultRepository.getCampaignCollectiveResult(
            campaignId,
            learningContent
          );

          // then
          expect(result).to.be.an.instanceof(CampaignCollectiveResult);
          expect(result.id).to.equal(campaignId);
          const competenceACollectiveResult = result.campaignCompetenceCollectiveResults[0];
          expect(competenceACollectiveResult).to.deep.include({
            areaCode: '1',
            areaColor: 'jaffa',
            competenceId: 'recCompetenceA',
            id: `${campaignId}_recCompetenceA`,
            competenceName: 'Competence A',
            targetedSkillsCount: 5,
            averageValidatedSkills: 0,
          });
          const competenceBCollectiveResult = result.campaignCompetenceCollectiveResults[1];
          expect(competenceBCollectiveResult).to.deep.include({
            areaCode: '1',
            areaColor: 'jaffa',
            competenceId: 'recCompetenceB',
            id: `${campaignId}_recCompetenceB`,
            competenceName: 'Competence B',
            targetedSkillsCount: 4,
            averageValidatedSkills: 0,
          });
          const competenceCCollectiveResult = result.campaignCompetenceCollectiveResults[2];
          expect(competenceCCollectiveResult).to.deep.include({
            areaCode: '1',
            areaColor: 'jaffa',
            competenceId: 'recCompetenceC',
            id: `${campaignId}_recCompetenceC`,
            competenceName: 'Competence C',
            targetedSkillsCount: 1,
            averageValidatedSkills: 0,
          });
          const competenceECollectiveResult = result.campaignCompetenceCollectiveResults[3];
          expect(competenceECollectiveResult).to.deep.include({
            areaCode: '2',
            areaColor: 'emerald',
            competenceId: 'recCompetenceE',
            id: `${campaignId}_recCompetenceE`,
            competenceName: 'Competence E',
            targetedSkillsCount: 1,
            averageValidatedSkills: 0,
          });
          const competenceFCollectiveResult = result.campaignCompetenceCollectiveResults[4];
          expect(competenceFCollectiveResult).to.deep.include({
            areaCode: '2',
            areaColor: 'emerald',
            competenceId: 'recCompetenceF',
            id: `${campaignId}_recCompetenceF`,
            competenceName: 'Competence F',
            targetedSkillsCount: 1,
            averageValidatedSkills: 0,
          });
        });
      });

      context('when there a deleted participations', function () {
        beforeEach(function () {
          const goliath = _createUserWithSharedCampaignParticipationDeleted(
            'Fred',
            campaignId,
            new Date('2019-02-10'),
            new Date('2022-01-01')
          );

          databaseBuilder.factory.buildKnowledgeElement({
            userId: goliath.userId,
            competenceId: 'recCompetenceA',
            skillId: 'recUrl1',
            status: 'validated',
            createdAt: new Date('2019-02-01'),
          });

          return databaseBuilder.commit();
        });

        it('should resolves a collective result synthesis with default values for all competences', async function () {
          // when
          const result = await campaignCollectiveResultRepository.getCampaignCollectiveResult(
            campaignId,
            learningContent
          );

          // then
          expect(result).to.be.an.instanceof(CampaignCollectiveResult);
          expect(result.id).to.equal(campaignId);
          const competenceACollectiveResult = result.campaignCompetenceCollectiveResults[0];
          expect(competenceACollectiveResult).to.deep.include({
            areaCode: '1',
            areaColor: 'jaffa',
            competenceId: 'recCompetenceA',
            id: `${campaignId}_recCompetenceA`,
            competenceName: 'Competence A',
            targetedSkillsCount: 5,
            averageValidatedSkills: 0,
          });
          const competenceBCollectiveResult = result.campaignCompetenceCollectiveResults[1];
          expect(competenceBCollectiveResult).to.deep.include({
            areaCode: '1',
            areaColor: 'jaffa',
            competenceId: 'recCompetenceB',
            id: `${campaignId}_recCompetenceB`,
            competenceName: 'Competence B',
            targetedSkillsCount: 4,
            averageValidatedSkills: 0,
          });
          const competenceCCollectiveResult = result.campaignCompetenceCollectiveResults[2];
          expect(competenceCCollectiveResult).to.deep.include({
            areaCode: '1',
            areaColor: 'jaffa',
            competenceId: 'recCompetenceC',
            id: `${campaignId}_recCompetenceC`,
            competenceName: 'Competence C',
            targetedSkillsCount: 1,
            averageValidatedSkills: 0,
          });
          const competenceECollectiveResult = result.campaignCompetenceCollectiveResults[3];
          expect(competenceECollectiveResult).to.deep.include({
            areaCode: '2',
            areaColor: 'emerald',
            competenceId: 'recCompetenceE',
            id: `${campaignId}_recCompetenceE`,
            competenceName: 'Competence E',
            targetedSkillsCount: 1,
            averageValidatedSkills: 0,
          });
          const competenceFCollectiveResult = result.campaignCompetenceCollectiveResults[4];
          expect(competenceFCollectiveResult).to.deep.include({
            areaCode: '2',
            areaColor: 'emerald',
            competenceId: 'recCompetenceF',
            id: `${campaignId}_recCompetenceF`,
            competenceName: 'Competence F',
            targetedSkillsCount: 1,
            averageValidatedSkills: 0,
          });
        });
      });

      context('when there is a single participant who shared its contribution', function () {
        beforeEach(function () {
          const longTimeAgo = new Date('2018-01-01');
          const beforeCampaignParticipationShareDate = new Date('2019-01-01');
          const userWithCampaignParticipationFred = _createUserWithSharedCampaignParticipation(
            'Fred',
            campaignId,
            new Date(),
            false
          );
          const fredId = userWithCampaignParticipationFred.userId;

          _.each(
            [
              {
                userId: fredId,
                competenceId: 'recCompetenceA',
                skillId: 'recUrl1',
                status: 'validated',
                createdAt: beforeCampaignParticipationShareDate,
              },
              {
                userId: fredId,
                competenceId: 'recCompetenceA',
                skillId: 'recUrl2',
                status: 'invalidated',
                createdAt: beforeCampaignParticipationShareDate,
              },
              {
                userId: fredId,
                competenceId: 'recCompetenceA',
                skillId: 'recUrl3',
                status: 'invalidated',
                createdAt: beforeCampaignParticipationShareDate,
              },
              {
                userId: fredId,
                competenceId: 'recCompetenceB',
                skillId: 'recFile2',
                status: 'validated',
                createdAt: beforeCampaignParticipationShareDate,
              },
              {
                userId: fredId,
                competenceId: 'recCompetenceB',
                skillId: 'recFile3',
                status: 'validated',
                createdAt: beforeCampaignParticipationShareDate,
              },
              {
                userId: fredId,
                competenceId: 'recCompetenceB',
                skillId: 'recFile5',
                status: 'validated',
                createdAt: beforeCampaignParticipationShareDate,
              },
              {
                userId: fredId,
                competenceId: 'recCompetenceB',
                skillId: 'recText1',
                status: 'validated',
                createdAt: beforeCampaignParticipationShareDate,
              },
              {
                userId: fredId,
                competenceId: 'recCompetenceC',
                skillId: 'recMedia1',
                status: 'invalidated',
                createdAt: beforeCampaignParticipationShareDate,
              },
              {
                userId: fredId,
                competenceId: 'recCompetenceF',
                skillId: 'recComputer1',
                status: 'validated',
                createdAt: longTimeAgo,
              },
              {
                userId: fredId,
                competenceId: 'recCompetenceF',
                skillId: 'recComputer1',
                status: 'invalidated',
                createdAt: beforeCampaignParticipationShareDate,
              },
            ],
            (knowledgeElement) => {
              databaseBuilder.factory.buildKnowledgeElement(knowledgeElement);
            }
          );

          return databaseBuilder.commit();
        });

        it('should resolves a collective result synthesis with its results as collective’s ones', async function () {
          // when
          const result = await campaignCollectiveResultRepository.getCampaignCollectiveResult(
            campaignId,
            learningContent
          );

          // then
          expect(result).to.be.an.instanceof(CampaignCollectiveResult);
          expect(result.id).to.equal(campaignId);
          const competenceACollectiveResult = result.campaignCompetenceCollectiveResults[0];
          expect(competenceACollectiveResult.averageValidatedSkills).to.deep.equal(1);
          const competenceBCollectiveResult = result.campaignCompetenceCollectiveResults[1];
          expect(competenceBCollectiveResult.averageValidatedSkills).to.deep.equal(4);
          const competenceCCollectiveResult = result.campaignCompetenceCollectiveResults[2];
          expect(competenceCCollectiveResult.averageValidatedSkills).to.deep.equal(0);
          const competenceECollectiveResult = result.campaignCompetenceCollectiveResults[3];
          expect(competenceECollectiveResult.averageValidatedSkills).to.deep.equal(0);
          const competenceFCollectiveResult = result.campaignCompetenceCollectiveResults[4];
          expect(competenceFCollectiveResult.averageValidatedSkills).to.deep.equal(0);
        });
      });

      context('when there are multiple participants who shared their participation', function () {
        beforeEach(function () {
          const longTimeAgo = new Date('2018-01-01');
          const campaignParticipationShareDate = new Date('2019-03-01');
          const beforeBeforeCampaignParticipationShareDate = new Date('2019-01-01');
          const beforeCampaignParticipationShareDate = new Date('2019-02-01');
          const afterCampaignParticipationShareDate = new Date('2019-05-01');

          // Alice
          const userWithCampaignParticipationAlice = _createUserWithSharedCampaignParticipation(
            'Alice',
            campaignId,
            campaignParticipationShareDate,
            false
          );
          const aliceId = userWithCampaignParticipationAlice.userId;

          // Bob
          const userWithCampaignParticipationBob = _createUserWithSharedCampaignParticipation(
            'Bob',
            campaignId,
            campaignParticipationShareDate,
            false
          );
          const bobId = userWithCampaignParticipationBob.userId;

          // Charlie
          const userWithCampaignParticipationCharlie = _createUserWithSharedCampaignParticipation(
            'Charlie',
            campaignId,
            campaignParticipationShareDate,
            false
          );
          const charlieId = userWithCampaignParticipationCharlie.userId;

          // Dan (did not share his campaign participation)
          const userWithCampaignParticipationDan = _createUserWithNonSharedCampaignParticipation('Dan', campaignId);
          const danId = userWithCampaignParticipationDan.userId;

          // Elo (participated in another campaign)
          const anotherCampaignId = databaseBuilder.factory.buildCampaign().id;
          const userWithCampaignParticipationElo = _createUserWithSharedCampaignParticipation(
            'Elo',
            anotherCampaignId,
            campaignParticipationShareDate,
            false
          );
          const eloId = userWithCampaignParticipationElo.id;

          /* KNOWLEDGE ELEMENTS */

          _.each(
            [
              // Alice
              {
                userId: aliceId,
                competenceId: 'recCompetenceA',
                skillId: 'recUrl1',
                status: 'validated',
                createdAt: beforeCampaignParticipationShareDate,
              },
              {
                userId: aliceId,
                competenceId: 'recCompetenceA',
                skillId: 'recUrl2',
                status: 'validated',
                createdAt: beforeCampaignParticipationShareDate,
              },
              {
                userId: aliceId,
                competenceId: 'recCompetenceA',
                skillId: 'recUrl3',
                status: 'validated',
                createdAt: beforeCampaignParticipationShareDate,
              },

              {
                userId: aliceId,
                competenceId: 'recCompetenceB',
                skillId: 'recFile2',
                status: 'invalidated',
                createdAt: beforeCampaignParticipationShareDate,
              },
              {
                userId: aliceId,
                competenceId: 'recCompetenceB',
                skillId: 'recFile3',
                status: 'invalidated',
                createdAt: beforeCampaignParticipationShareDate,
              },
              {
                userId: aliceId,
                competenceId: 'recCompetenceB',
                skillId: 'recFile5',
                status: 'invalidated',
                createdAt: beforeCampaignParticipationShareDate,
              },
              {
                userId: aliceId,
                competenceId: 'recCompetenceB',
                skillId: 'recText1',
                status: 'invalidated',
                createdAt: beforeCampaignParticipationShareDate,
              },

              {
                userId: aliceId,
                competenceId: 'recCompetenceC',
                skillId: 'recMedia1',
                status: 'invalidated',
                createdAt: beforeCampaignParticipationShareDate,
              },

              {
                userId: aliceId,
                competenceId: 'recCompetenceD',
                skillId: 'recAlgo1',
                status: 'validated',
                createdAt: beforeCampaignParticipationShareDate,
              },
              {
                userId: aliceId,
                competenceId: 'recCompetenceD',
                skillId: 'recAlgo2',
                status: 'validated',
                createdAt: beforeCampaignParticipationShareDate,
              },

              {
                userId: aliceId,
                competenceId: 'recCompetenceF',
                skillId: 'recComputer1',
                status: 'validated',
                createdAt: longTimeAgo,
              },
              {
                userId: aliceId,
                competenceId: 'recCompetenceF',
                skillId: 'recComputer1',
                status: 'invalidated',
                createdAt: beforeCampaignParticipationShareDate,
              },

              // Bob
              {
                userId: bobId,
                competenceId: 'recCompetenceA',
                skillId: 'recUrl1',
                status: 'validated',
                createdAt: beforeCampaignParticipationShareDate,
              },
              {
                userId: bobId,
                competenceId: 'recCompetenceA',
                skillId: 'recUrl2',
                status: 'invalidated',
                createdAt: beforeCampaignParticipationShareDate,
              },
              {
                userId: bobId,
                competenceId: 'recCompetenceA',
                skillId: 'recUrl3',
                status: 'invalidated',
                createdAt: beforeCampaignParticipationShareDate,
              },

              {
                userId: bobId,
                competenceId: 'recCompetenceB',
                skillId: 'recFile2',
                status: 'validated',
                createdAt: beforeCampaignParticipationShareDate,
              },
              {
                userId: bobId,
                competenceId: 'recCompetenceB',
                skillId: 'recFile3',
                status: 'validated',
                createdAt: beforeBeforeCampaignParticipationShareDate,
              },
              {
                userId: bobId,
                competenceId: 'recCompetenceB',
                skillId: 'recFile3',
                status: 'validated',
                createdAt: beforeCampaignParticipationShareDate,
              },
              {
                userId: bobId,
                competenceId: 'recCompetenceB',
                skillId: 'recFile5',
                status: 'validated',
                createdAt: beforeCampaignParticipationShareDate,
              },
              {
                userId: bobId,
                competenceId: 'recCompetenceB',
                skillId: 'recFile5',
                status: 'invalidated',
                createdAt: afterCampaignParticipationShareDate,
              },
              {
                userId: bobId,
                competenceId: 'recCompetenceB',
                skillId: 'recText1',
                status: 'validated',
                createdAt: beforeCampaignParticipationShareDate,
              },

              {
                userId: bobId,
                competenceId: 'recCompetenceC',
                skillId: 'recMedia1',
                status: 'invalidated',
                createdAt: beforeCampaignParticipationShareDate,
              },

              {
                userId: bobId,
                competenceId: 'recCompetenceF',
                skillId: 'recComputer1',
                status: 'invalidated',
                createdAt: longTimeAgo,
              },
              {
                userId: bobId,
                competenceId: 'recCompetenceF',
                skillId: 'recComputer1',
                status: 'validated',
                createdAt: beforeCampaignParticipationShareDate,
              },

              // Charlie
              {
                userId: charlieId,
                competenceId: 'recCompetenceA',
                skillId: 'recUrl1',
                status: 'invalidated',
                createdAt: beforeCampaignParticipationShareDate,
              },
              {
                userId: charlieId,
                competenceId: 'recCompetenceA',
                skillId: 'recUrl2',
                status: 'invalidated',
                createdAt: beforeCampaignParticipationShareDate,
              },
              {
                userId: charlieId,
                competenceId: 'recCompetenceA',
                skillId: 'recUrl3',
                status: 'invalidated',
                createdAt: beforeCampaignParticipationShareDate,
              },

              {
                userId: charlieId,
                competenceId: 'recCompetenceB',
                skillId: 'recFile2',
                status: 'validated',
                createdAt: beforeCampaignParticipationShareDate,
              },
              {
                userId: charlieId,
                competenceId: 'recCompetenceB',
                skillId: 'recFile3',
                status: 'invalidated',
                createdAt: beforeCampaignParticipationShareDate,
              },
              {
                userId: charlieId,
                competenceId: 'recCompetenceB',
                skillId: 'recFile5',
                status: 'invalidated',
                createdAt: beforeCampaignParticipationShareDate,
              },
              {
                userId: charlieId,
                competenceId: 'recCompetenceB',
                skillId: 'recText1',
                status: 'invalidated',
                createdAt: beforeCampaignParticipationShareDate,
              },

              {
                userId: charlieId,
                competenceId: 'recCompetenceC',
                skillId: 'recMedia1',
                status: 'validated',
                createdAt: beforeCampaignParticipationShareDate,
              },
              {
                userId: charlieId,
                competenceId: 'recCompetenceC',
                skillId: 'recMedia2',
                status: 'validated',
                createdAt: beforeCampaignParticipationShareDate,
              },

              {
                userId: charlieId,
                competenceId: 'recCompetenceF',
                skillId: 'recComputer1',
                status: 'validated',
                createdAt: longTimeAgo,
              },
              {
                userId: charlieId,
                competenceId: 'recCompetenceF',
                skillId: 'recComputer1',
                status: 'invalidated',
                createdAt: afterCampaignParticipationShareDate,
              },

              // Dan
              {
                userId: danId,
                competenceId: 'recCompetenceA',
                skillId: 'recUrl1',
                status: 'validated',
                createdAt: beforeCampaignParticipationShareDate,
              },
              {
                userId: danId,
                competenceId: 'recCompetenceA',
                skillId: 'recUrl2',
                status: 'invalidated',
                createdAt: beforeCampaignParticipationShareDate,
              },
              {
                userId: danId,
                competenceId: 'recCompetenceA',
                skillId: 'recUrl3',
                status: 'invalidated',
                createdAt: beforeCampaignParticipationShareDate,
              },

              {
                userId: danId,
                competenceId: 'recCompetenceB',
                skillId: 'recFile2',
                status: 'validated',
                createdAt: beforeCampaignParticipationShareDate,
              },
              {
                userId: danId,
                competenceId: 'recCompetenceB',
                skillId: 'recFile3',
                status: 'validated',
                createdAt: beforeCampaignParticipationShareDate,
              },
              {
                userId: danId,
                competenceId: 'recCompetenceB',
                skillId: 'recFile5',
                status: 'validated',
                createdAt: beforeCampaignParticipationShareDate,
              },
              {
                userId: danId,
                competenceId: 'recCompetenceB',
                skillId: 'recText1',
                status: 'validated',
                createdAt: beforeCampaignParticipationShareDate,
              },

              {
                userId: danId,
                competenceId: 'recCompetenceC',
                skillId: 'recMedia1',
                status: 'invalidated',
                createdAt: beforeCampaignParticipationShareDate,
              },

              // Elo
              {
                userId: eloId,
                competenceId: 'recCompetenceA',
                skillId: 'recUrl1',
                status: 'validated',
                createdAt: beforeCampaignParticipationShareDate,
              },
            ],
            (knowledgeElement) => {
              databaseBuilder.factory.buildKnowledgeElement(knowledgeElement);
            }
          );

          return databaseBuilder.commit();
        });

        it('should return a correct aggregated synthesis of participants results', async function () {
          // when
          const result = await campaignCollectiveResultRepository.getCampaignCollectiveResult(
            campaignId,
            learningContent
          );

          // then
          expect(result).to.be.an.instanceof(CampaignCollectiveResult);
          expect(result.id).to.equal(campaignId);
          const competenceACollectiveResult = result.campaignCompetenceCollectiveResults[0];
          expect(competenceACollectiveResult.averageValidatedSkills).to.deep.equal(4 / 3);
          const competenceBCollectiveResult = result.campaignCompetenceCollectiveResults[1];
          expect(competenceBCollectiveResult.averageValidatedSkills).to.deep.equal(5 / 3);
          const competenceCCollectiveResult = result.campaignCompetenceCollectiveResults[2];
          expect(competenceCCollectiveResult.averageValidatedSkills).to.deep.equal(1 / 3);
          const competenceECollectiveResult = result.campaignCompetenceCollectiveResults[3];
          expect(competenceECollectiveResult.averageValidatedSkills).to.deep.equal(0 / 3);
          const competenceFCollectiveResult = result.campaignCompetenceCollectiveResults[4];
          expect(competenceFCollectiveResult.averageValidatedSkills).to.deep.equal(2 / 3);
        });
      });

      context('when there is one participant who shared his participation and try to improve it', function () {
        beforeEach(async function () {
          const { id: userId } = databaseBuilder.factory.buildUser();
          databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
            userId,
            sharedAt: new Date('2020-01-01'),
            isImproved: true,
          });
          databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
            userId,
            sharedAt: new Date('2020-01-04'),
            isImproved: false,
          });

          databaseBuilder.factory.buildKnowledgeElement({
            userId,
            competenceId: 'recCompetenceA',
            skillId: 'recUrl1',
            status: 'validated',
            createdAt: new Date('2020-01-03'),
          });

          await databaseBuilder.commit();
        });

        it("should return a correct aggregated synthesis of the participant's result", async function () {
          // when
          const result = await campaignCollectiveResultRepository.getCampaignCollectiveResult(
            campaignId,
            learningContent
          );

          // then
          expect(result).to.be.an.instanceof(CampaignCollectiveResult);
          expect(result.id).to.equal(campaignId);
          const competenceACollectiveResult = result.campaignCompetenceCollectiveResults[0];
          expect(competenceACollectiveResult.averageValidatedSkills).to.deep.equal(1);
          expect(competenceACollectiveResult.targetedSkillsCount).to.deep.equal(5);
        });
      });

      context('when there are multiple participants with validated skills on old competences', function () {
        beforeEach(function () {
          const campaignParticipationShareDate = new Date('2019-03-01');
          const beforeCampaignParticipationShareDate = new Date('2019-02-01');

          // Alice
          const userWithCampaignParticipationAlice = _createUserWithSharedCampaignParticipation(
            'Alice',
            campaignId,
            campaignParticipationShareDate,
            false
          );
          const aliceId = userWithCampaignParticipationAlice.userId;

          // Bob
          const userWithCampaignParticipationBob = _createUserWithSharedCampaignParticipation(
            'Bob',
            campaignId,
            campaignParticipationShareDate,
            false
          );
          const bobId = userWithCampaignParticipationBob.userId;

          /* KNOWLEDGE ELEMENTS */

          _.each(
            [
              // Alice
              {
                userId: aliceId,
                competenceId: 'recOldCompetence',
                skillId: 'recUrl1',
                status: 'validated',
                createdAt: beforeCampaignParticipationShareDate,
              },
              {
                userId: aliceId,
                competenceId: 'recOldCompetence',
                skillId: 'recUrl2',
                status: 'validated',
                createdAt: beforeCampaignParticipationShareDate,
              },

              // Bob
              {
                userId: bobId,
                competenceId: 'recCompetenceA',
                skillId: 'recUrl1',
                status: 'validated',
                createdAt: beforeCampaignParticipationShareDate,
              },
              {
                userId: bobId,
                competenceId: 'recCompetenceA',
                skillId: 'recUrl2',
                status: 'invalidated',
                createdAt: beforeCampaignParticipationShareDate,
              },
            ],
            (knowledgeElement) => {
              databaseBuilder.factory.buildKnowledgeElement(knowledgeElement);
            }
          );

          return databaseBuilder.commit();
        });

        it('should return a correct average validated skills for the competence A', async function () {
          // when
          const result = await campaignCollectiveResultRepository.getCampaignCollectiveResult(
            campaignId,
            learningContent
          );

          // then
          expect(result.campaignCompetenceCollectiveResults[0].averageValidatedSkills).to.equal(3 / 2);
        });
      });
    });
  });
});
