import { expect, domainBuilder, sinon } from '../../../../test-helper';
import skillRepository from '../../../../../lib/infrastructure/repositories/skill-repository';
import { findActiveSkillsForCappedTubes } from '../../../../../lib/domain/services/learning-content/learning-content-conversion-service';

describe('Unit | Service | learning-content-conversion-service', function () {
  describe('#findActiveSkillsForCappedTubes', function () {
    it('should find all skills of provided tubes capped by difficulty', async function () {
      // given
      const cappedTubes = [
        {
          id: 'recTube1',
          level: '3',
        },
        {
          id: 'recTube2',
          level: '4',
        },
      ];
      const skill1Tube1 = domainBuilder.buildSkill({ tubeId: 'recTube1', name: '@skillTube1_1', difficulty: 1 });
      const skill2Tube1 = domainBuilder.buildSkill({ tubeId: 'recTube1', name: '@skillTube1_2', difficulty: 2 });
      const skill6Tube1 = domainBuilder.buildSkill({ tubeId: 'recTube1', name: '@skillTube1_6', difficulty: 6 });
      const skill2Tube2 = domainBuilder.buildSkill({ tubeId: 'recTube2', name: '@skillTube2_2', difficulty: 2 });
      const skill4Tube2 = domainBuilder.buildSkill({ tubeId: 'recTube2', name: '@skillTube2_4', difficulty: 4 });
      sinon.stub(skillRepository, 'findActiveByTubeId');
      skillRepository.findActiveByTubeId.withArgs('recTube1').resolves([skill1Tube1, skill2Tube1, skill6Tube1]);
      skillRepository.findActiveByTubeId.withArgs('recTube2').resolves([skill2Tube2, skill4Tube2]);
      skillRepository.findActiveByTubeId.throws(new Error('I should not be called with other arguments'));

      // when
      const skills = await findActiveSkillsForCappedTubes(cappedTubes);

      // then
      expect(skills).to.deepEqualArray([skill1Tube1, skill2Tube1, skill2Tube2, skill4Tube2]);
    });
  });
});
