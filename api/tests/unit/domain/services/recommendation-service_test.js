import { expect } from '../../../test-helper';
import recommendationService from './../../../../lib/domain/services/recommendation-service';

describe('Unit | Service | Campaign Recommendation Service', function () {
  describe('computeRecommendationScore', function () {
    context('when no skill have been validated', function () {
      it('should return the maximum number of points for difficulty when there is a skill with the maximum difficulty of the target profile', function () {
        // given
        const maxSkillLevel = 6;
        const skills = [
          { id: 1, difficulty: 1 },
          { id: 2, difficulty: 2 },
          { id: 3, difficulty: 3 },
          { id: 4, difficulty: 6 },
        ];

        // when
        const score = recommendationService.computeRecommendationScore(skills, maxSkillLevel, []);

        // then
        expect(score).to.equal(30);
      });

      it('should return less than maximum number of points for difficulty when there is no skill with the maximum difficulty of the target profile', function () {
        // given
        const maxSkillLevel = 6;
        const skills = [
          { id: 1, difficulty: 1 },
          { id: 2, difficulty: 4 },
        ];

        // when
        const score = recommendationService.computeRecommendationScore(skills, maxSkillLevel, []);

        // then
        expect(score).to.equal(20);
      });
    });

    context('when all skills have been validated', function () {
      it('should return maximum number points', function () {
        // given
        const maxSkillLevel = 3;
        const skills = [
          { id: 1, difficulty: 1 },
          { id: 2, difficulty: 2 },
          { id: 3, difficulty: 3 },
        ];

        const knowledgeElements = [{ skillId: 1 }, { skillId: 2 }, { skillId: 3 }];
        // when
        const score = recommendationService.computeRecommendationScore(skills, maxSkillLevel, knowledgeElements);

        // then
        expect(score).to.equal(100);
      });
    });

    context('when only some skills have been validated', function () {
      it('should add more points when the next step is closer to the reached level', function () {
        // given
        const maxSkillLevel = 5;
        const skills = [
          { id: 1, difficulty: 1 },
          { id: 2, difficulty: 2 },
          { id: 3, difficulty: 3 },
          { id: 4, difficulty: 5 },
        ];

        const knowledgeElements = [{ skillId: 1 }, { skillId: 2 }, { skillId: 3 }];
        // when
        const score = recommendationService.computeRecommendationScore(skills, maxSkillLevel, knowledgeElements);

        // then
        expect(score).to.equal(75);
      });

      it('should add less points when the next step is closer to the reached level', function () {
        // given
        const maxSkillLevel = 6;
        const skills = [
          { id: 1, difficulty: 1 },
          { id: 2, difficulty: 2 },
          { id: 3, difficulty: 3 },
          { id: 4, difficulty: 6 },
        ];

        const knowledgeElements = [{ skillId: 1 }];
        // when
        const score = recommendationService.computeRecommendationScore(skills, maxSkillLevel, knowledgeElements);

        // then

        expect(score).to.be.closeTo(46.6, 0.1);
      });
    });
  });
});
