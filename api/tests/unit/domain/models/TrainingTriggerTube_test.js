const { expect, domainBuilder } = require('../../../test-helper');
const TrainingTriggerTube = require('../../../../lib/domain/models/TrainingTriggerTube');

describe('Unit | Domain | Models | TrainingTriggerTube', function () {
  describe('#constructor', function () {
    it('should be a valid type', function () {
      // given
      const trainingTriggerTube = domainBuilder.buildTrainingTriggerTube();

      // then
      expect(trainingTriggerTube).to.be.instanceOf(TrainingTriggerTube);
    });

    it('should have all properties', function () {
      // given
      const tube = { id: 1 };
      const trainingTriggerTube = domainBuilder.buildTrainingTriggerTube({
        id: 1,
        tube,
        level: 6,
      });

      // then
      expect(trainingTriggerTube.id).to.equal(1);
      expect(trainingTriggerTube.tube).to.equal(tube);
      expect(trainingTriggerTube.level).to.equal(6);
    });
  });

  describe('#getCappedSkills', function () {
    it('should return capped skills from given skills', function () {
      // given
      const tube = { id: 1 };
      const trainingTriggerTube = domainBuilder.buildTrainingTriggerTube({
        id: 1,
        tube,
        level: 6,
      });
      const skills = [
        domainBuilder.buildSkill({ id: 1, tubeId: 1, difficulty: 5 }),
        domainBuilder.buildSkill({ id: 2, tubeId: 1, difficulty: 6 }),
        domainBuilder.buildSkill({ id: 3, tubeId: 1, difficulty: 7 }),
        domainBuilder.buildSkill({ id: 4, tubeId: 2, difficulty: 5 }),
      ];

      // when
      const cappedSkills = trainingTriggerTube.getCappedSkills(skills);

      // then
      expect(cappedSkills).to.deep.equal([skills[0], skills[1]]);
    });

    it('should return empty array when no skills', function () {
      // given
      const tube = { id: 1 };
      const trainingTriggerTube = domainBuilder.buildTrainingTriggerTube({
        id: 1,
        tube,
        level: 6,
      });
      const skills = [];

      // when
      const cappedSkills = trainingTriggerTube.getCappedSkills(skills);

      // then
      expect(cappedSkills).to.deep.equal([]);
    });

    it('should return empty array when no skills with same tubeId', function () {
      // given
      const tube = { id: 1 };
      const trainingTriggerTube = domainBuilder.buildTrainingTriggerTube({
        id: 1,
        tube,
        level: 6,
      });
      const skills = [domainBuilder.buildSkill({ id: 1, tubeId: 2, difficulty: 5 })];

      // when
      const cappedSkills = trainingTriggerTube.getCappedSkills(skills);

      // then
      expect(cappedSkills).to.deep.equal([]);
    });
  });
});
