const { expect } = require('../../../test-helper');
const Skill = require('../../../../lib/domain/models/Skill');
const Tube = require('../../../../lib/domain/models/Tube');
const { computeTubesFromSkills } = require('../../../../lib/domain/services/tube-service');

describe('Integration | Domain | Services | TubeService', () => {

  describe('#computeTubesFromSkills', function() {
    it('should return an array of tubes when all challenges require only one skill', function() {
      // given
      const web4 = new Skill({ name: '@web4' });
      const web5 = new Skill({ name: '@web5' });
      const url1 = new Skill({ name: '@url1' });
      const listSkills = [web4, web5, url1];
      const tubeWeb = new Tube({ skills: [web4, web5] });
      const tubeUrl = new Tube({ skills: [url1] });
      const expectedTubes = [tubeWeb, tubeUrl];

      // when
      const actualTubes = computeTubesFromSkills(listSkills);

      // then
      expect(actualTubes).to.deep.equal(expectedTubes);
    });

    it('should not add the same skill twice in a tube', function() {
      // given
      const web4 = new Skill({ name: '@web4' });
      const web5 = new Skill({ name: '@web5' });
      const url1 = new Skill({ name: '@url1' });
      const listSkills = [web5, web4, url1, url1];
      const tubeWeb = new Tube({ skills: [web4, web5] });
      const tubeUrl = new Tube({ skills: [url1] });
      const expectedTubes = [tubeWeb, tubeUrl];

      // when
      const actualTubes = computeTubesFromSkills(listSkills);

      // then
      expect(actualTubes).to.deep.equal(expectedTubes);
    });

  });
});
