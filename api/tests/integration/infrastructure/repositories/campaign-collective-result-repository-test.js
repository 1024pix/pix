const { expect, databaseBuilder, domainBuilder, airtableBuilder } = require('../../../test-helper');
const campaignCollectiveResultRepository = require('../../../../lib/infrastructure/repositories/campaign-collective-result-repository');
const CampaignCollectiveResult = require('../../../../lib/domain/models/CampaignCollectiveResult');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');
const _ = require('lodash');

function _createUserWithSharedCampaignParticipation(userName, campaignId, sharedAt) {
  const userId = databaseBuilder.factory.buildUser({ firstName: userName }).id;
  const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
    campaignId,
    userId,
    isShared: true,
    sharedAt
  });

  return { userId, campaignParticipation };
}

function _createUserWithNonSharedCampaignParticipation(userName, campaignId) {
  const userId = databaseBuilder.factory.buildUser({ firstName: userName }).id;
  const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
    campaignId,
    userId,
    isShared: false,
  });

  return { userId, campaignParticipation };
}

describe('Integration | Repository | Service | Campaign collective result repository', () => {
  const competences = [];

  const rawCompetences = [
    {
      competence: { id: 'recCompetenceA', name: 'Competence A', index: '1.1', area: { color: 'jaffa' } },
      skillIds: ['recUrl1', 'recUrl2', 'recUrl3', 'recUrl4', 'recUrl5']
    }, {
      competence: { id: 'recCompetenceB', name: 'Competence B', index: '1.2', area: { color: 'jaffa' } },
      skillIds: ['recFile2', 'recFile3', 'recFile5', 'recText1']
    }, {
      competence: { id: 'recCompetenceC', name: 'Competence C', index: '1.3', area: { color: 'jaffa' } },
      skillIds: ['recMedia1', 'recMedia2']
    }, {
      competence: { id: 'recCompetenceD', name: 'Competence D', index: '2.1', area: { color: 'emerald' } },
      skillIds: ['recAlgo1', 'recAlgo2']
    }, {
      competence: { id: 'recCompetenceE', name: 'Competence E', index: '2.2', area: { color: 'emerald' } },
      skillIds: ['recBrowser1']
    }, {
      competence: { id: 'recCompetenceF', name: 'Competence F', index: '2.3', area: { color: 'emerald' } },
      skillIds: ['recComputer1']
    }
  ];

  beforeEach(() => {
    _.each(rawCompetences, ({ competence }) => {
      competences.push(domainBuilder.buildCompetence(competence));
    });
  });

  afterEach(() => {
    airtableBuilder.cleanAll();
    return cache.flushAll();
  });

  context('#getCampaignCollectiveResultByCompetence', () => {

    context('in a rich context close to reality', () => {
      let targetProfileId;
      let campaignId;

      let url1Id, url2Id, url3Id, // comp. A
        file2Id, file3Id, file5Id, text1Id, // comp. B
        media1Id, media2Id, // comp. C
        algo1Id, algo2Id, // comp. D
        computer1Id; // comp. F

      let expectedCampaignCollectiveResult;

      beforeEach(async () => {

        const areas = [airtableBuilder.factory.buildArea()];
        const skills = [];

        _.each(rawCompetences, ({ competence, skillIds }) => {
          _.each(skillIds, (skillId) => skills.push(
            airtableBuilder.factory.buildSkill({ id: skillId, 'compétenceViaTube': [competence.id] })
          ));
        });

        airtableBuilder
          .mockList({ tableName: 'Domaines' })
          .returns(areas)
          .activate();

        airtableBuilder
          .mockList({ tableName: 'Acquis' })
          .returns(skills)
          .activate();

        targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;

        // Competence A - nobody validated skills @url4 and @url5
        url1Id = databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'recUrl1' }).skillId;
        url2Id = databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'recUrl2' }).skillId;
        url3Id = databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'recUrl3' }).skillId;
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'recUrl4' });
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'recUrl5' });

        // Competence B - all skills are validated by different people
        file2Id = databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'recFile2' }).skillId;
        file3Id = databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'recFile3' }).skillId;
        file5Id = databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'recFile5' }).skillId;
        text1Id = databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'recText1' }).skillId;

        // Competence C - skill @media2 is validated by someone but is not part of campaign target profile
        media1Id = databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'recMedia1' }).skillId;
        media2Id = 'recMedia2';

        // Competence D - competence D is not covered by campaign target profile
        algo1Id = 'recAlgo1';
        algo2Id = 'recAlgo2';

        // Competence E - competence E is targeted by campaign but nobody validated its skills
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'recBrowser1' });

        // Competence F - skill is validated and then invalidated
        computer1Id = databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'recComputer1' }).skillId;

        expectedCampaignCollectiveResult = Object.freeze(domainBuilder.buildCampaignCollectiveResult({
          id: campaignId,
          campaignCompetenceCollectiveResults: [
            {
              averageValidatedSkills: 0,
              campaignId,
              competenceId: 'recCompetenceA',
              competenceName: 'Competence A',
              competenceIndex: '1.1',
              areaColor: 'jaffa',
              totalSkillsCount: 5,
            },
            {
              averageValidatedSkills: 0,
              campaignId,
              competenceId: 'recCompetenceB',
              competenceName: 'Competence B',
              competenceIndex: '1.2',
              areaColor: 'jaffa',
              totalSkillsCount: 4,
            },
            {
              averageValidatedSkills: 0,
              campaignId,
              competenceId: 'recCompetenceC',
              competenceName: 'Competence C',
              competenceIndex: '1.3',
              areaColor: 'jaffa',
              totalSkillsCount: 1,
            },
            {
              averageValidatedSkills: 0,
              campaignId,
              competenceId: 'recCompetenceE',
              competenceName: 'Competence E',
              competenceIndex: '2.2',
              areaColor: 'emerald',
              totalSkillsCount: 1,
            },
            {
              averageValidatedSkills: 0,
              campaignId,
              competenceId: 'recCompetenceF',
              competenceName: 'Competence F',
              competenceIndex: '2.3',
              areaColor: 'emerald',
              totalSkillsCount: 1,
            }
          ],
        }
        ));
      });

      context('when there is no participant', () => {

        beforeEach(async () => {
          await databaseBuilder.commit();
        });

        it('should resolves a collective result synthesis with default values for all competences', async () => {
          // when
          const result = await campaignCollectiveResultRepository.getCampaignCollectiveResultByCompetence(campaignId, competences);

          // then
          expect(result).to.be.an.instanceof(CampaignCollectiveResult);
          expect(result.id).to.equal(expectedCampaignCollectiveResult.id);
          expect(result.campaignCompetenceCollectiveResults).to.deep.include.ordered.members(expectedCampaignCollectiveResult.campaignCompetenceCollectiveResults);
          expect(result.campaignCompetenceCollectiveResults).to.deep.equal(expectedCampaignCollectiveResult.campaignCompetenceCollectiveResults);
        });
      });

      context('when there is a participant but she did not share its contribution', () => {

        beforeEach(async () => {

          const goliathId = databaseBuilder.factory.buildUser({ firstName: 'Goliath' }).id;

          databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
            userId: goliathId,
            isShared: false,
          });

          databaseBuilder.factory.buildKnowledgeElement({
            userId: goliathId,
            competenceId: 'recCompetenceA',
            skillId: url1Id,
            status: 'validated',
            campaignId,
            createdAt: new Date('2019-02-01')
          });

          await databaseBuilder.commit();
        });

        it('should resolves a collective result synthesis with default values for all competences', async () => {
          // when
          const result = await campaignCollectiveResultRepository.getCampaignCollectiveResultByCompetence(campaignId, competences);

          // then
          expect(result).to.be.an.instanceof(CampaignCollectiveResult);
          expect(result.id).to.equal(expectedCampaignCollectiveResult.id);
          expect(result.campaignCompetenceCollectiveResults).to.deep.include.ordered.members(expectedCampaignCollectiveResult.campaignCompetenceCollectiveResults);
          expect(result.campaignCompetenceCollectiveResults).to.deep.equal(expectedCampaignCollectiveResult.campaignCompetenceCollectiveResults);
        });
      });

      context('when there is a single participant who shared its contribution', () => {

        beforeEach(async () => {
          const longTimeAgo = new Date('2018-01-01');
          const beforeCampaignParticipationShareDate = new Date('2019-01-01');
          const userWithCampaignParticipationFred = _createUserWithSharedCampaignParticipation('Fred', campaignId, new Date());
          const fredId = userWithCampaignParticipationFred.userId;

          _.each([
            { userId: fredId, competenceId: 'recCompetenceA', skillId: url1Id, status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: fredId, competenceId: 'recCompetenceA', skillId: url2Id, status: 'invalidated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: fredId, competenceId: 'recCompetenceA', skillId: url3Id, status: 'invalidated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: fredId, competenceId: 'recCompetenceB', skillId: file2Id, status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: fredId, competenceId: 'recCompetenceB', skillId: file3Id, status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: fredId, competenceId: 'recCompetenceB', skillId: file5Id, status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: fredId, competenceId: 'recCompetenceB', skillId: text1Id, status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: fredId, competenceId: 'recCompetenceC', skillId: media1Id, status: 'invalidated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: fredId, competenceId: 'recCompetenceF', skillId: computer1Id, status: 'validated', campaignId, createdAt: longTimeAgo },
            { userId: fredId, competenceId: 'recCompetenceF', skillId: computer1Id, status: 'invalidated', campaignId, createdAt: beforeCampaignParticipationShareDate },

          ], (knownledgeElement) => {
            databaseBuilder.factory.buildKnowledgeElement(knownledgeElement);
          });

          await databaseBuilder.commit();
        });

        it('should resolves a collective result synthesis with its results as collective’s ones', async () => {
          // given
          const expectedResult = {
            id: campaignId,
            campaignCompetenceCollectiveResults: [
              {
                averageValidatedSkills: 1,
                campaignId,
                competenceId: 'recCompetenceA',
                competenceName: 'Competence A',
                competenceIndex: '1.1',
                areaColor: 'jaffa',
                totalSkillsCount: 5,
              },
              {
                averageValidatedSkills: 4,
                campaignId,
                competenceId: 'recCompetenceB',
                competenceName: 'Competence B',
                competenceIndex: '1.2',
                areaColor: 'jaffa',
                totalSkillsCount: 4,
              },
              {
                averageValidatedSkills: 0,
                campaignId,
                competenceId: 'recCompetenceC',
                competenceName: 'Competence C',
                competenceIndex: '1.3',
                areaColor: 'jaffa',
                totalSkillsCount: 1,
              },
              {
                averageValidatedSkills: 0,
                campaignId,
                competenceId: 'recCompetenceE',
                competenceName: 'Competence E',
                competenceIndex: '2.2',
                areaColor: 'emerald',
                totalSkillsCount: 1,
              },
              {
                averageValidatedSkills: 0,
                campaignId,
                competenceId: 'recCompetenceF',
                competenceName: 'Competence F',
                competenceIndex: '2.3',
                areaColor: 'emerald',
                totalSkillsCount: 1,
              }
            ],
          };

          // when
          const result = await campaignCollectiveResultRepository.getCampaignCollectiveResultByCompetence(campaignId, competences);

          // then
          expect(result).to.be.an.instanceof(CampaignCollectiveResult);
          expect(result.id).to.equal(expectedResult.id);
          expect(result.campaignCompetenceCollectiveResults).to.deep.include.ordered.members(expectedResult.campaignCompetenceCollectiveResults);
          expect(result.campaignCompetenceCollectiveResults).to.deep.equal(expectedResult.campaignCompetenceCollectiveResults);
        });
      });

      context('when there are multiple participants who shared their participation', () => {

        beforeEach(async () => {

          const longTimeAgo = new Date('2018-01-01');
          const campaignParticipationShareDate = new Date('2019-03-01');
          const beforeBeforeCampaignParticipationShareDate = new Date('2019-01-01');
          const beforeCampaignParticipationShareDate = new Date('2019-02-01');
          const afterCampaignParticipationShareDate = new Date('2019-05-01');

          // Alice
          const userWithCampaignParticipationAlice = _createUserWithSharedCampaignParticipation('Alice', campaignId, campaignParticipationShareDate);
          const aliceId = userWithCampaignParticipationAlice.userId;

          // Bob
          const userWithCampaignParticipationBob = _createUserWithSharedCampaignParticipation('Bob', campaignId, campaignParticipationShareDate);
          const bobId = userWithCampaignParticipationBob.userId;

          // Charlie
          const userWithCampaignParticipationCharlie = _createUserWithSharedCampaignParticipation('Charlie', campaignId, campaignParticipationShareDate);
          const charlieId = userWithCampaignParticipationCharlie.userId;

          // Dan (did not share his campaign participation)
          const userWithCampaignParticipationDan = _createUserWithNonSharedCampaignParticipation('Dan', campaignId);
          const danId =  userWithCampaignParticipationDan.userId;

          // Elo (participated in another campaign)
          const anotherCampaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
          const userWithCampaignParticipationElo = _createUserWithSharedCampaignParticipation('Elo', anotherCampaignId, campaignParticipationShareDate);
          const eloId = userWithCampaignParticipationElo.id;

          /* KNOWLEDGE ELEMENTS */

          _.each([
            // Alice
            { userId: aliceId, competenceId: 'recCompetenceA', skillId: url1Id, status: 'validated', createdAt: beforeCampaignParticipationShareDate },
            { userId: aliceId, competenceId: 'recCompetenceA', skillId: url2Id, status: 'validated', createdAt: beforeCampaignParticipationShareDate },
            { userId: aliceId, competenceId: 'recCompetenceA', skillId: url3Id, status: 'validated', createdAt: beforeCampaignParticipationShareDate },

            { userId: aliceId, competenceId: 'recCompetenceB', skillId: file2Id, status: 'invalidated', createdAt: beforeCampaignParticipationShareDate },
            { userId: aliceId, competenceId: 'recCompetenceB', skillId: file3Id, status: 'invalidated', createdAt: beforeCampaignParticipationShareDate },
            { userId: aliceId, competenceId: 'recCompetenceB', skillId: file5Id, status: 'invalidated', createdAt: beforeCampaignParticipationShareDate },
            { userId: aliceId, competenceId: 'recCompetenceB', skillId: text1Id, status: 'invalidated', createdAt: beforeCampaignParticipationShareDate },

            { userId: aliceId, competenceId: 'recCompetenceC', skillId: media1Id, status: 'invalidated', createdAt: beforeCampaignParticipationShareDate },

            { userId: aliceId, competenceId: 'recCompetenceD', skillId: algo1Id, status: 'validated', createdAt: beforeCampaignParticipationShareDate },
            { userId: aliceId, competenceId: 'recCompetenceD', skillId: algo2Id, status: 'validated', createdAt: beforeCampaignParticipationShareDate },

            { userId: aliceId, competenceId: 'recCompetenceF', skillId: computer1Id, status: 'validated', createdAt: longTimeAgo },
            { userId: aliceId, competenceId: 'recCompetenceF', skillId: computer1Id, status: 'invalidated', createdAt: beforeCampaignParticipationShareDate },

            // Bob
            { userId: bobId, competenceId: 'recCompetenceA', skillId: url1Id, status: 'validated', createdAt: beforeCampaignParticipationShareDate },
            { userId: bobId, competenceId: 'recCompetenceA', skillId: url2Id, status: 'invalidated', createdAt: beforeCampaignParticipationShareDate },
            { userId: bobId, competenceId: 'recCompetenceA', skillId: url3Id, status: 'invalidated', createdAt: beforeCampaignParticipationShareDate },

            { userId: bobId, competenceId: 'recCompetenceB', skillId: file2Id, status: 'validated', createdAt: beforeCampaignParticipationShareDate },
            { userId: bobId, competenceId: 'recCompetenceB', skillId: file3Id, status: 'validated', createdAt: beforeBeforeCampaignParticipationShareDate },
            { userId: bobId, competenceId: 'recCompetenceB', skillId: file3Id, status: 'validated', createdAt: beforeCampaignParticipationShareDate },
            { userId: bobId, competenceId: 'recCompetenceB', skillId: file5Id, status: 'validated', createdAt: beforeCampaignParticipationShareDate },
            { userId: bobId, competenceId: 'recCompetenceB', skillId: file5Id, status: 'invalidated', createdAt: afterCampaignParticipationShareDate },
            { userId: bobId, competenceId: 'recCompetenceB', skillId: text1Id, status: 'validated', createdAt: beforeCampaignParticipationShareDate },

            { userId: bobId, competenceId: 'recCompetenceC', skillId: media1Id, status: 'invalidated', createdAt: beforeCampaignParticipationShareDate },

            { userId: bobId, competenceId: 'recCompetenceF', skillId: computer1Id, status: 'invalidated', createdAt: longTimeAgo },
            { userId: bobId, competenceId: 'recCompetenceF', skillId: computer1Id, status: 'validated', createdAt: beforeCampaignParticipationShareDate },

            // Charlie
            { userId: charlieId, competenceId: 'recCompetenceA', skillId: url1Id, status: 'invalidated', createdAt: beforeCampaignParticipationShareDate },
            { userId: charlieId, competenceId: 'recCompetenceA', skillId: url2Id, status: 'invalidated', createdAt: beforeCampaignParticipationShareDate },
            { userId: charlieId, competenceId: 'recCompetenceA', skillId: url3Id, status: 'invalidated', createdAt: beforeCampaignParticipationShareDate },

            { userId: charlieId, competenceId: 'recCompetenceB', skillId: file2Id, status: 'validated', createdAt: beforeCampaignParticipationShareDate },
            { userId: charlieId, competenceId: 'recCompetenceB', skillId: file3Id, status: 'invalidated', createdAt: beforeCampaignParticipationShareDate },
            { userId: charlieId, competenceId: 'recCompetenceB', skillId: file5Id, status: 'invalidated', createdAt: beforeCampaignParticipationShareDate },
            { userId: charlieId, competenceId: 'recCompetenceB', skillId: text1Id, status: 'invalidated', createdAt: beforeCampaignParticipationShareDate },

            { userId: charlieId, competenceId: 'recCompetenceC', skillId: media1Id, status: 'validated', createdAt: beforeCampaignParticipationShareDate },
            { userId: charlieId, competenceId: 'recCompetenceC', skillId: media2Id, status: 'validated', createdAt: beforeCampaignParticipationShareDate },

            { userId: charlieId, competenceId: 'recCompetenceF', skillId: computer1Id, status: 'validated', createdAt: longTimeAgo },
            { userId: charlieId, competenceId: 'recCompetenceF', skillId: computer1Id, status: 'invalidated', createdAt: afterCampaignParticipationShareDate },

            // Dan
            { userId: danId, competenceId: 'recCompetenceA', skillId: url1Id, status: 'validated', createdAt: beforeCampaignParticipationShareDate },
            { userId: danId, competenceId: 'recCompetenceA', skillId: url2Id, status: 'invalidated', createdAt: beforeCampaignParticipationShareDate },
            { userId: danId, competenceId: 'recCompetenceA', skillId: url3Id, status: 'invalidated', createdAt: beforeCampaignParticipationShareDate },

            { userId: danId, competenceId: 'recCompetenceB', skillId: file2Id, status: 'validated', createdAt: beforeCampaignParticipationShareDate },
            { userId: danId, competenceId: 'recCompetenceB', skillId: file3Id, status: 'validated', createdAt: beforeCampaignParticipationShareDate },
            { userId: danId, competenceId: 'recCompetenceB', skillId: file5Id, status: 'validated', createdAt: beforeCampaignParticipationShareDate },
            { userId: danId, competenceId: 'recCompetenceB', skillId: text1Id, status: 'validated', createdAt: beforeCampaignParticipationShareDate },

            { userId: danId, competenceId: 'recCompetenceC', skillId: media1Id, status: 'invalidated', createdAt: beforeCampaignParticipationShareDate },

            // Elo
            { userId: eloId, competenceId: 'recCompetenceA', skillId: url1Id, status: 'validated', createdAt: beforeCampaignParticipationShareDate },
          ], (knowledgeElement) => {
            databaseBuilder.factory.buildKnowledgeElement(knowledgeElement);
          });

          await databaseBuilder.commit();
        });

        it('should return a correct aggregated synthesis of participants results', async () => {
          // given
          const expectedResult = {
            id: campaignId,
            campaignCompetenceCollectiveResults: [
              {
                averageValidatedSkills: 4 / 3,
                campaignId,
                competenceId: 'recCompetenceA',
                competenceName: 'Competence A',
                competenceIndex: '1.1',
                areaColor: 'jaffa',
                totalSkillsCount: 5,
              },
              {
                averageValidatedSkills: 5 / 3,
                campaignId,
                competenceId: 'recCompetenceB',
                competenceName: 'Competence B',
                competenceIndex: '1.2',
                areaColor: 'jaffa',
                totalSkillsCount: 4,
              },
              {
                averageValidatedSkills: 1 / 3,
                campaignId,
                competenceId: 'recCompetenceC',
                competenceName: 'Competence C',
                competenceIndex: '1.3',
                areaColor: 'jaffa',
                totalSkillsCount: 1,
              },
              {
                averageValidatedSkills: 0 / 3,
                campaignId,
                competenceId: 'recCompetenceE',
                competenceName: 'Competence E',
                competenceIndex: '2.2',
                areaColor: 'emerald',
                totalSkillsCount: 1,
              },
              {
                averageValidatedSkills: 2 / 3,
                campaignId,
                competenceId: 'recCompetenceF',
                competenceName: 'Competence F',
                competenceIndex: '2.3',
                areaColor: 'emerald',
                totalSkillsCount: 1,
              }
            ],
          };

          // when
          const result = await campaignCollectiveResultRepository.getCampaignCollectiveResultByCompetence(campaignId, competences);

          // then
          expect(result).to.be.an.instanceof(CampaignCollectiveResult);
          expect(result.id).to.equal(expectedResult.id);
          expect(result.campaignCompetenceCollectiveResults).to.deep.include.ordered.members(expectedResult.campaignCompetenceCollectiveResults);
          expect(result.campaignCompetenceCollectiveResults).to.deep.equal(expectedResult.campaignCompetenceCollectiveResults);
        });
      });

    });
  });

  context('#getCampaignCollectiveResultByTube', () => {

    context('in a rich context close to reality', () => {
      let tubes;
      let targetProfileId;
      let campaignId;

      let url1Id, // tube 1
        file2Id, file5Id, // tube 2
        algo1Id, // tube 3
        computer1Id; // tube 5

      let expectedCampaignCollectiveResult;

      beforeEach(async () => {
        const areas = [airtableBuilder.factory.buildArea()];
        const skills = [];

        tubes = [];

        _.each([
          {
            tube: { id: 'recTubeUrl', practicalTitle: 'Tube url', competenceId: 'recCompetenceC' },
            skillIds: ['recUrl1', 'recUrl4']
          }, {
            tube: { id: 'recTubeFile', practicalTitle: 'Tube file', competenceId: 'recCompetenceC' },
            skillIds: ['recFile2', 'recFile5']
          }, {
            tube: { id: 'recTubeAlgo', practicalTitle: 'Tube algo', competenceId: 'recCompetenceC' },
            skillIds: ['recAlgo1']
          }, {
            tube: { id: 'recTubeBrowser', practicalTitle: 'Tube browser', competenceId: 'recCompetenceC' },
            skillIds: ['recBrowser1']
          }, {
            tube: { id: 'recTubeComputer', practicalTitle: 'Tube computer', competenceId: 'recCompetenceE' },
            skillIds: ['recComputer1']
          },

        ], ({ tube, skillIds }) => {
          tubes.push(domainBuilder.buildTube(tube));

          _.each(skillIds, (skillId) => skills.push(
            airtableBuilder.factory.buildSkill({ id: skillId, 'compétenceViaTube': ['recCompetenceC'], tube: [tube.id] })
          ));
        });

        airtableBuilder
          .mockList({ tableName: 'Domaines' })
          .returns(areas)
          .activate();

        airtableBuilder
          .mockList({ tableName: 'Acquis' })
          .returns(skills)
          .activate();

        targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;

        // Tube url - nobody validated skills @url4 and @url5
        url1Id = databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'recUrl1' }).skillId;
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'recUrl4' });

        // Tube file - all skills are validated by different people
        file2Id = databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'recFile2' }).skillId;
        file5Id = databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'recFile5' }).skillId;

        // Tube algo - not covered by campaign target profile
        algo1Id = 'recAlgo1';

        // Tube browser - targeted by campaign but nobody validated its skills
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'recBrowser1' });

        // Tube computer - skill is validated and then invalidated
        computer1Id = databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'recComputer1' }).skillId;

        expectedCampaignCollectiveResult = Object.freeze(domainBuilder.buildCampaignCollectiveResult({
          id: campaignId,
          campaignTubeCollectiveResults: [
            {
              averageValidatedSkills: 0,
              campaignId,
              competenceName: 'Competence C',
              tubeId: 'recTubeUrl',
              tubePracticalTitle: 'Tube url',
              areaColor: 'jaffa',
              totalSkillsCount: 2,
            },
            {
              averageValidatedSkills: 0,
              campaignId,
              competenceName: 'Competence C',
              tubeId: 'recTubeFile',
              tubePracticalTitle: 'Tube file',
              areaColor: 'jaffa',
              totalSkillsCount: 2,
            },
            {
              averageValidatedSkills: 0,
              campaignId,
              competenceName: 'Competence C',
              tubeId: 'recTubeBrowser',
              tubePracticalTitle: 'Tube browser',
              areaColor: 'jaffa',
              totalSkillsCount: 1,
            },
            {
              averageValidatedSkills: 0,
              campaignId,
              competenceName: 'Competence E',
              tubeId: 'recTubeComputer',
              tubePracticalTitle: 'Tube computer',
              areaColor: 'emerald',
              totalSkillsCount: 1,
            }
          ]
        }));
      });

      context('when there is no participant', () => {

        beforeEach(async () => {
          await databaseBuilder.commit();
        });

        it('should resolves a collective result synthesis with default values for all tubes', async () => {
          // when
          const result = await campaignCollectiveResultRepository.getCampaignCollectiveResultByTube(campaignId, tubes, competences);

          // then
          expect(result).to.be.an.instanceof(CampaignCollectiveResult);
          expect(result.id).to.equal(expectedCampaignCollectiveResult.id);
          expect(result.campaignTubeCollectiveResults).to.deep.include.members(expectedCampaignCollectiveResult.campaignTubeCollectiveResults);
          expect(result.campaignTubeCollectiveResults).to.deep.equal(expectedCampaignCollectiveResult.campaignTubeCollectiveResults);
        });
      });

      context('when there is a participant but she did not share its contribution', () => {

        beforeEach(async () => {

          const goliathId = databaseBuilder.factory.buildUser({ firstName: 'Goliath' }).id;

          databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
            userId: goliathId,
            isShared: false,
          });

          databaseBuilder.factory.buildKnowledgeElement({
            userId: goliathId,
            competenceId: 'recCompetenceA',
            skillId: url1Id,
            status: 'validated',
            campaignId,
            createdAt: new Date('2019-02-01')
          });

          await databaseBuilder.commit();
        });

        it('should resolves a collective result synthesis with default values for all tubes', async () => {
          // when
          const result = await campaignCollectiveResultRepository.getCampaignCollectiveResultByTube(campaignId, tubes, competences);

          // then
          expect(result).to.be.an.instanceof(CampaignCollectiveResult);
          expect(result.id).to.equal(expectedCampaignCollectiveResult.id);
          expect(result.campaignTubeCollectiveResults).to.deep.include.members(expectedCampaignCollectiveResult.campaignTubeCollectiveResults);
          expect(result.campaignTubeCollectiveResults).to.deep.equal(expectedCampaignCollectiveResult.campaignTubeCollectiveResults);
        });
      });

      context('when there is a single participant who shared its contribution', () => {

        beforeEach(async () => {
          const longTimeAgo = new Date('2018-01-01');
          const beforeCampaignParticipationShareDate = new Date('2019-01-01');
          const userWithCampaignParticipationFred = _createUserWithSharedCampaignParticipation('Fred', campaignId, new Date());
          const fredId = userWithCampaignParticipationFred.userId;

          _.each([
            { userId: fredId, skillId: url1Id, status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: fredId, skillId: file2Id, status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: fredId, skillId: file5Id, status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: fredId, skillId: computer1Id, status: 'validated', campaignId, createdAt: longTimeAgo },
            { userId: fredId, skillId: computer1Id, status: 'invalidated', campaignId, createdAt: beforeCampaignParticipationShareDate },

          ], (knownledgeElement) => {
            databaseBuilder.factory.buildKnowledgeElement(knownledgeElement);
          });

          await databaseBuilder.commit();
        });

        it('should resolves a collective result synthesis with its results as collective’s ones', async () => {
          // given
          const expectedResult = {
            id: campaignId,
            campaignTubeCollectiveResults: [
              {
                averageValidatedSkills: 1,
                campaignId,
                competenceName: 'Competence C',
                tubeId: 'recTubeUrl',
                tubePracticalTitle: 'Tube url',
                areaColor: 'jaffa',
                totalSkillsCount: 2,
              },
              {
                averageValidatedSkills: 2,
                campaignId,
                competenceName: 'Competence C',
                tubeId: 'recTubeFile',
                tubePracticalTitle: 'Tube file',
                areaColor: 'jaffa',
                totalSkillsCount: 2,
              },
              {
                averageValidatedSkills: 0,
                campaignId,
                competenceName: 'Competence C',
                tubeId: 'recTubeBrowser',
                tubePracticalTitle: 'Tube browser',
                areaColor: 'jaffa',
                totalSkillsCount: 1,
              },
              {
                averageValidatedSkills: 0,
                campaignId,
                competenceName: 'Competence E',
                tubeId: 'recTubeComputer',
                tubePracticalTitle: 'Tube computer',
                areaColor: 'emerald',
                totalSkillsCount: 1,
              }
            ],
          };

          // when
          const result = await campaignCollectiveResultRepository.getCampaignCollectiveResultByTube(campaignId, tubes, competences);

          // then
          expect(result).to.be.an.instanceof(CampaignCollectiveResult);
          expect(result.id).to.equal(expectedResult.id);
          expect(result.campaignTubeCollectiveResults).to.deep.include.members(expectedResult.campaignTubeCollectiveResults);
          expect(result.campaignTubeCollectiveResults).to.deep.equal(expectedResult.campaignTubeCollectiveResults);
        });
      });

      context('when there are multiple participants who shared their participation', () => {

        beforeEach(async () => {

          const longTimeAgo = new Date('2018-01-01');
          const campaignParticipationShareDate = new Date('2019-03-01');
          const beforeCampaignParticipationShareDate = new Date('2019-02-01');
          const afterCampaignParticipationShareDate = new Date('2019-05-01');

          // Alice
          const userWithCampaignParticipationAlice = _createUserWithSharedCampaignParticipation('Alice', campaignId, campaignParticipationShareDate);
          const aliceId = userWithCampaignParticipationAlice.userId;

          // Bob
          const userWithCampaignParticipationBob = _createUserWithSharedCampaignParticipation('Bob', campaignId, campaignParticipationShareDate);
          const bobId = userWithCampaignParticipationBob.userId;

          // Dan (did not share his campaign participation)
          const userWithCampaignParticipationDan = _createUserWithNonSharedCampaignParticipation('Dan', campaignId);
          const danId =  userWithCampaignParticipationDan.userId;

          // Elo (participated in another campaign)
          const anotherCampaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
          const userWithCampaignParticipationElo = _createUserWithSharedCampaignParticipation('Elo', anotherCampaignId, campaignParticipationShareDate);
          const eloId = userWithCampaignParticipationElo.id;

          /!* KNOWLEDGE ELEMENTS *!/;

          _.each([
            // Alice
            { userId: aliceId, skillId: url1Id, status: 'validated', createdAt: beforeCampaignParticipationShareDate },
            { userId: aliceId, skillId: file2Id, status: 'invalidated', createdAt: beforeCampaignParticipationShareDate },
            { userId: aliceId, skillId: file5Id, status: 'invalidated', createdAt: beforeCampaignParticipationShareDate },
            { userId: aliceId, skillId: algo1Id, status: 'validated', createdAt: beforeCampaignParticipationShareDate },
            { userId: aliceId, skillId: computer1Id, status: 'validated', createdAt: longTimeAgo },
            { userId: aliceId, skillId: computer1Id, status: 'invalidated', createdAt: beforeCampaignParticipationShareDate },

            // Bob
            { userId: bobId, skillId: url1Id, status: 'validated', createdAt: beforeCampaignParticipationShareDate },
            { userId: bobId, skillId: file2Id, status: 'validated', createdAt: beforeCampaignParticipationShareDate },
            { userId: bobId, skillId: file5Id, status: 'invalidated', createdAt: beforeCampaignParticipationShareDate },
            { userId: bobId, skillId: file5Id, status: 'validated', createdAt: afterCampaignParticipationShareDate },
            { userId: bobId, skillId: computer1Id, status: 'invalidated', createdAt: longTimeAgo },
            { userId: bobId, skillId: computer1Id, status: 'validated', createdAt: beforeCampaignParticipationShareDate },

            // Dan
            { userId: danId, skillId: file2Id, status: 'validated', createdAt: beforeCampaignParticipationShareDate },

            // Elo
            { userId: eloId, skillId: url1Id, status: 'validated', createdAt: beforeCampaignParticipationShareDate },
          ], (knowledgeElement) => {
            databaseBuilder.factory.buildKnowledgeElement(knowledgeElement);
          });

          await databaseBuilder.commit();
        });

        it('should return a correct aggregated synthesis of participants results', async () => {
          // given
          const expectedResult = {
            id: campaignId,
            campaignTubeCollectiveResults: [
              {
                averageValidatedSkills: 2 / 2,
                campaignId,
                competenceName: 'Competence C',
                tubeId: 'recTubeUrl',
                tubePracticalTitle: 'Tube url',
                areaColor: 'jaffa',
                totalSkillsCount: 2,
              },
              {
                averageValidatedSkills: 1 / 2,
                campaignId,
                competenceName: 'Competence C',
                tubeId: 'recTubeFile',
                tubePracticalTitle: 'Tube file',
                areaColor: 'jaffa',
                totalSkillsCount: 2,
              },
              {
                averageValidatedSkills: 0 / 2,
                campaignId,
                competenceName: 'Competence C',
                tubeId: 'recTubeBrowser',
                tubePracticalTitle: 'Tube browser',
                areaColor: 'jaffa',
                totalSkillsCount: 1,
              },
              {
                averageValidatedSkills: 1 / 2,
                campaignId,
                competenceName: 'Competence E',
                tubeId: 'recTubeComputer',
                tubePracticalTitle: 'Tube computer',
                areaColor: 'emerald',
                totalSkillsCount: 1,
              }
            ],
          };

          // when
          const result = await campaignCollectiveResultRepository.getCampaignCollectiveResultByTube(campaignId, tubes, competences);

          // then
          expect(result).to.be.an.instanceof(CampaignCollectiveResult);
          expect(result.id).to.equal(expectedResult.id);
          expect(result.campaignTubeCollectiveResults).to.deep.include.members(expectedResult.campaignTubeCollectiveResults);
          expect(result.campaignTubeCollectiveResults).to.deep.equal(expectedResult.campaignTubeCollectiveResults);
        });
      });
    });
  });
});
