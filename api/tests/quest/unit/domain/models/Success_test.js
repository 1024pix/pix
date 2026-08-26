import { Success } from '../../../../../src/quest/domain/models/quests/aggregates/Success.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Domain | Models | Success ', function () {
  describe('#getMasteryPercentageForSkills', function () {
    context('when no skill ids provided', function () {
      it('should return 0', function () {
        // given
        const skillIdsEmpty = [];
        const brokenSkillIds = null;
        const success = new Success({
          knowledgeState: {
            validatedSkillIds: ['skillA', 'skillB'],
            floorByTubeId: { tubeA: 1, tubeB: 1 },
          },
        });

        // when
        const masteryPercentageEmpty = success.getMasteryPercentageForSkills(skillIdsEmpty);
        const masteryPercentageBroken = success.getMasteryPercentageForSkills(brokenSkillIds);

        // then
        expect(masteryPercentageEmpty).to.equal(0);
        expect(masteryPercentageBroken).to.equal(0);
      });
    });

    context('when skill ids are provided', function () {
      it('should return the expected mastery percentage according to the knowledge state in Success model', function () {
        // given — skillC et skillD invalidés, skillE jamais évalué
        const skillIds = ['skillB', 'skillA', 'skillC', 'skillE'];
        const success = new Success({
          knowledgeState: {
            validatedSkillIds: ['skillA', 'skillB'],
            floorByTubeId: { tubeA: 1, tubeB: 1 },
          },
        });

        // when
        const masteryPercentage = success.getMasteryPercentageForSkills(skillIds);

        // then
        const expectedMasteryPercentage = 50;
        expect(masteryPercentage).to.be.equal(expectedMasteryPercentage);
      });
    });
  });

  describe('#skills', function () {
    it('should return empty array when there are no campaignSkills or targetProfileSkills', function () {
      const success = new Success({
        knowledgeState: { validatedSkillIds: [], floorByTubeId: {} },
        campaignSkills: [],
      });

      expect(success.skills).to.have.length(0);
    });

    it('should return an array when there are campaignSkills', function () {
      const success = new Success({
        knowledgeState: { validatedSkillIds: [], floorByTubeId: {} },
        campaignSkills: [
          { id: 'skillA', tubeId: 'tubeA', difficulty: 1 },
          { id: 'skillB', tubeId: 'tubeB', difficulty: 1 },
        ],
      });

      expect(success.skills).to.have.length(2);
      expect(success.skills).to.have.deep.members([
        { id: 'skillA', tubeId: 'tubeA', difficulty: 1 },
        { id: 'skillB', tubeId: 'tubeB', difficulty: 1 },
      ]);
    });

    it('should return an array when there are targetProfileSkills', function () {
      const success = new Success({
        knowledgeState: { validatedSkillIds: [], floorByTubeId: {} },
        targetProfileSkills: [
          { id: 'skillA', tubeId: 'tubeA', difficulty: 1 },
          { id: 'skillB', tubeId: 'tubeB', difficulty: 1 },
        ],
      });

      expect(success.skills).to.have.length(2);
      expect(success.skills).to.have.deep.members([
        { id: 'skillA', tubeId: 'tubeA', difficulty: 1 },
        { id: 'skillB', tubeId: 'tubeB', difficulty: 1 },
      ]);
    });

    it('should return an array when there are campaignSkills and targetProfileSkills', function () {
      const success = new Success({
        knowledgeState: { validatedSkillIds: [], floorByTubeId: {} },
        targetProfileSkills: [
          { id: 'skillA', tubeId: 'tubeA', difficulty: 1 },
          { id: 'skillB', tubeId: 'tubeB', difficulty: 1 },
        ],
        campaignSkills: [
          { id: 'skillA', tubeId: 'tubeA', difficulty: 1 },
          { id: 'skillC', tubeId: 'tubeC', difficulty: 1 },
        ],
      });

      expect(success.skills).to.have.length(3);
      expect(success.skills).to.have.deep.members([
        { id: 'skillA', tubeId: 'tubeA', difficulty: 1 },
        { id: 'skillB', tubeId: 'tubeB', difficulty: 1 },
        { id: 'skillC', tubeId: 'tubeC', difficulty: 1 },
      ]);
    });
  });

  describe('#getMasteryPercentageForCappedTubes', function () {
    context('when no cappedTubes provided', function () {
      it('should return 0 when cappedTubes is empty', function () {
        // given
        const cappedTubesEmpty = [];
        const success = new Success({
          knowledgeState: { validatedSkillIds: ['skillA', 'skillB'], floorByTubeId: { tubeA: 1, tubeB: 1 } },
          campaignSkills: [
            { id: 'skillA', tubeId: 'tubeA', difficulty: 1 },
            { id: 'skillB', tubeId: 'tubeB', difficulty: 1 },
            { id: 'skillC', tubeId: 'tubeC', difficulty: 1 },
          ],
        });

        // when
        const masteryPercentageEmpty = success.getMasteryPercentageForCappedTubes(cappedTubesEmpty);

        // then
        expect(masteryPercentageEmpty).to.equal(0);
      });

      it('should return 0 when cappedTubes is invalid', function () {
        // given
        const brokenCappedTubes = null;
        const success = new Success({
          knowledgeState: { validatedSkillIds: ['skillA', 'skillB'], floorByTubeId: { tubeA: 1, tubeB: 1 } },
          campaignSkills: [
            { id: 'skillA', tubeId: 'tubeA', difficulty: 1 },
            { id: 'skillB', tubeId: 'tubeB', difficulty: 1 },
            { id: 'skillC', tubeId: 'tubeC', difficulty: 1 },
          ],
        });

        // when
        const masteryPercentageBroken = success.getMasteryPercentageForCappedTubes(brokenCappedTubes);

        // then
        expect(masteryPercentageBroken).to.equal(0);
      });
    });

    context('when cappedTubes are provided', function () {
      context('when there are no dupes in tubeId/difficulty', function () {
        it('should return the expected mastery percentage according to the state by tube in Success model', function () {
          // given — tubeA validé jusqu'au niveau 1 (le 2 est raté), tubeB jusqu'au 2 ;
          // tubeC et tubeD sont hors du périmètre demandé
          const success = new Success({
            knowledgeState: {
              validatedSkillIds: ['skill1tubeA', 'skill1tubeB', 'skill2tubeB', 'skillTubeC', 'skillTubeD'],
              floorByTubeId: { tubeA: 1, tubeB: 2, tubeC: 1, tubeD: 1 },
            },
            campaignSkills: [
              { id: 'skill1tubeA', tubeId: 'tubeA', difficulty: 1 },
              { id: 'skill2tubeA', tubeId: 'tubeA', difficulty: 2 },
              { id: 'skill3tubeA', tubeId: 'tubeA', difficulty: 3 },
              { id: 'skill4tubeA', tubeId: 'tubeA', difficulty: 4 },
              { id: 'skill1tubeB', tubeId: 'tubeB', difficulty: 1 },
              { id: 'skill2tubeB', tubeId: 'tubeB', difficulty: 2 },
              { id: 'skill3tubeB', tubeId: 'tubeB', difficulty: 3 },
              { id: 'skillTubeC', tubeId: 'tubeC', difficulty: 1 },
            ],
            targetProfileSkills: [
              { id: 'skillTubeC', tubeId: 'tubeC', difficulty: 1 },
              { id: 'skillTubeD', tubeId: 'tubeD', difficulty: 1 },
            ],
          });

          // when
          const cappedTubes = [
            { tubeId: 'tubeA', level: 2 },
            { tubeId: 'tubeB', level: 3 },
          ];
          const masteryPercentage = success.getMasteryPercentageForCappedTubes(cappedTubes);

          // then
          const expectedMasteryPercentage = 60;
          expect(masteryPercentage).to.be.equal(expectedMasteryPercentage);
        });
      });

      context('when there are several skills for the same tubeId/difficulty', function () {
        it('should only count as if there were one skill for the same tubeId/difficulty', function () {
          // given
          const success = new Success({
            knowledgeState: { validatedSkillIds: ['skill1_v2'], floorByTubeId: { tubeA: 1 } },
            campaignSkills: [
              { id: 'skill1_v1', tubeId: 'tubeA', difficulty: 1 },
              { id: 'skill1_v2', tubeId: 'tubeA', difficulty: 1 },
            ],
          });
          const cappedTubes = [{ tubeId: 'tubeA', level: 2 }];

          // when
          const masteryPercentage = success.getMasteryPercentageForCappedTubes(cappedTubes);

          // then
          expect(masteryPercentage).to.be.equal(100);
        });

        context('when none of them have been assessed to the user yet', function () {
          it('should count as if the skill is not validated', function () {
            // given
            const success = new Success({
              knowledgeState: { validatedSkillIds: [], floorByTubeId: {} },
              campaignSkills: [
                { id: 'skill1_v1', tubeId: 'tubeA', difficulty: 1 },
                { id: 'skill1_v2', tubeId: 'tubeA', difficulty: 1 },
              ],
            });
            const cappedTubes = [{ tubeId: 'tubeA', level: 2 }];

            // when
            const masteryPercentage = success.getMasteryPercentageForCappedTubes(cappedTubes);

            // then
            expect(masteryPercentage).to.be.equal(0);
          });
        });

        context('when the level of the tube has been reached', function () {
          it('should count as if the skill is validated, whatever the version', function () {
            // given — dans l'état par tube, valider le niveau vaut pour toutes
            // les versions de l'acquis : le plancher couvre le niveau 1
            const success = new Success({
              knowledgeState: { validatedSkillIds: ['skill1_v2'], floorByTubeId: { tubeA: 1 } },
              campaignSkills: [
                { id: 'skill1_v1', tubeId: 'tubeA', difficulty: 1 },
                { id: 'skill1_v2', tubeId: 'tubeA', difficulty: 1 },
                { id: 'skill1_v3', tubeId: 'tubeA', difficulty: 1 },
              ],
            });
            const cappedTubes = [{ tubeId: 'tubeA', level: 2 }];

            // when
            const masteryPercentage = success.getMasteryPercentageForCappedTubes(cappedTubes);

            // then
            expect(masteryPercentage).to.be.equal(100);
          });
        });

        it('should return the expected mastery percentage according to the state by tube in Success model', function () {
          // given
          const success = new Success({
            knowledgeState: {
              validatedSkillIds: ['skill1tubeA_v1', 'skill1tubeB', 'skill2tubeB', 'skillTubeC', 'skillTubeD'],
              floorByTubeId: { tubeA: 1, tubeB: 2, tubeC: 1, tubeD: 1 },
            },
            campaignSkills: [
              { id: 'skill1tubeA_v1', tubeId: 'tubeA', difficulty: 1 },
              { id: 'skill1tubeA_v2', tubeId: 'tubeA', difficulty: 1 },
              { id: 'skill2tubeA', tubeId: 'tubeA', difficulty: 2 },
              { id: 'skill3tubeA', tubeId: 'tubeA', difficulty: 3 },
              { id: 'skill4tubeA', tubeId: 'tubeA', difficulty: 4 },
              { id: 'skill1tubeB', tubeId: 'tubeB', difficulty: 1 },
              { id: 'skill2tubeB', tubeId: 'tubeB', difficulty: 2 },
              { id: 'skill3tubeB', tubeId: 'tubeB', difficulty: 3 },
              { id: 'skillTubeC', tubeId: 'tubeC', difficulty: 1 },
              { id: 'skillTubeD', tubeId: 'tubeD', difficulty: 1 },
            ],
          });

          // when
          const cappedTubes = [
            { tubeId: 'tubeA', level: 2 },
            { tubeId: 'tubeB', level: 3 },
          ];
          const masteryPercentage = success.getMasteryPercentageForCappedTubes(cappedTubes);

          // then
          const expectedMasteryPercentage = 60;
          expect(masteryPercentage).to.be.equal(expectedMasteryPercentage);
        });
      });
    });
  });
});
