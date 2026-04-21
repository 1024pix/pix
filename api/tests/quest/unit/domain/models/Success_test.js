import { Success } from '../../../../../src/quest/domain/models/Success.js';
import { KnowledgeElement } from '../../../../../src/shared/domain/models/KnowledgeElement.js';

describe('Quest | Unit | Domain | Models | Success ', function () {
  describe('#getMasteryPercentageForSkills', function () {
    context('when no skill ids provided', function () {
      it('should return 0', function () {
        // given
        const skillIdsEmpty = [];
        const brokenSkillIds = null;
        const success = new Success({
          knowledgeElements: [
            { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skillA' },
            { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skillB' },
            { status: KnowledgeElement.StatusType.INVALIDATED, skillId: 'skillC' },
          ],
          skills: [
            { id: 'skillA', tubeId: 'tubeA', difficulty: 1 },
            { id: 'skillB', tubeId: 'tubeB', difficulty: 1 },
            { id: 'skillC', tubeId: 'tubeC', difficulty: 1 },
          ],
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
      it('should return the expected mastery percentage according to knowledge elements in Success model', function () {
        // given
        const skillIds = ['skillB', 'skillA', 'skillC', 'skillE'];
        const success = new Success({
          knowledgeElements: [
            { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skillA' },
            { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skillB' },
            { status: KnowledgeElement.StatusType.INVALIDATED, skillId: 'skillC' },
            { status: KnowledgeElement.StatusType.INVALIDATED, skillId: 'skillD' },
          ],
          skills: [
            { id: 'skillA', tubeId: 'tubeA', difficulty: 1 },
            { id: 'skillB', tubeId: 'tubeB', difficulty: 1 },
            { id: 'skillC', tubeId: 'tubeC', difficulty: 1 },
            { id: 'skillD', tubeId: 'tubeD', difficulty: 1 },
          ],
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
        knowledgeElements: [],
        campaignSkills: [],
      });

      expect(success.skills).to.have.length(0);
    });

    it('should return an array when there are campaignSkills', function () {
      const success = new Success({
        knowledgeElements: [],
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
        knowledgeElements: [],
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
        knowledgeElements: [],
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
          knowledgeElements: [
            { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skillA' },
            { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skillB' },
            { status: KnowledgeElement.StatusType.INVALIDATED, skillId: 'skillC' },
          ],
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
          knowledgeElements: [
            { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skillA' },
            { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skillB' },
            { status: KnowledgeElement.StatusType.INVALIDATED, skillId: 'skillC' },
          ],
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
        it('should return the expected mastery percentage according to knowledge elements by tube in Success model', function () {
          // given
          const success = new Success({
            knowledgeElements: [
              { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skill1tubeA' },
              { status: KnowledgeElement.StatusType.INVALIDATED, skillId: 'skill2tubeA' },
              { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skill3tubeA' }, // ignoré, hors cap
              { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skill4tubeA' }, // ignoré, hors cap
              { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skill1tubeB' },
              { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skill2tubeB' },
              { status: KnowledgeElement.StatusType.INVALIDATED, skillId: 'skill3tubeB' },
              { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skillTubeC' }, // ignoré, hors scope
              { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skillTubeD' }, // ignoré, hors scope
            ],
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
            knowledgeElements: [{ status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skill1_v2' }],
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
              knowledgeElements: [],
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

        context('when one of them have been assessed to the user', function () {
          it('should count as if the skill is validated', function () {
            // given
            const success = new Success({
              knowledgeElements: [{ status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skill1_v2' }],
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

        context('when some of them have been assessed to the user', function () {
          it('should count as if the skill is validated', function () {
            // given
            const success = new Success({
              knowledgeElements: [
                { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skill1_v1' },
                { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skill1_v2' },
              ],
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

        context('when all of them have been assessed to the user', function () {
          it('should count as if the skill is validated', function () {
            // given
            const success = new Success({
              knowledgeElements: [
                { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skill1_v1' },
                { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skill1_v2' },
                { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skill1_v3' },
              ],
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

        it('should return the expected mastery percentage according to knowledge elements by tube in Success model', function () {
          // given
          const success = new Success({
            knowledgeElements: [
              { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skill1tubeA_v1' },
              { status: KnowledgeElement.StatusType.INVALIDATED, skillId: 'skill2tubeA' },
              { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skill3tubeA' }, // ignoré, hors cap
              { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skill4tubeA' }, // ignoré, hors cap
              { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skill1tubeB' },
              { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skill2tubeB' },
              { status: KnowledgeElement.StatusType.INVALIDATED, skillId: 'skill3tubeB' },
              { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skillTubeC' }, // ignoré, hors scope
              { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skillTubeD' }, // ignoré, hors scope
            ],
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
