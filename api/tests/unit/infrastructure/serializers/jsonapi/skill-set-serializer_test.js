const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/skill-set-serializer');
const { expect } = require('../../../../test-helper');
const SkillSet = require('../../../../../lib/domain/models/SkillSet');

describe('Unit | Serializer | JSONAPI | skill-set-serializer', function () {
  describe('#serialize', function () {
    it('should convert a SkillSet model object into JSON API data', function () {
      // given
      const skillSet = new SkillSet({
        name: 'Mon SkillSet',
        skillIds: ['recSkill1', 'recSkill2'],
      });

      // when
      const serializedSkillSet = serializer.serialize(skillSet);

      // then
      const expectedSkillSet = {
        data: {
          type: 'skill-sets',
          attributes: {
            name: 'Mon SkillSet',
            'skill-ids': ['recSkill1', 'recSkill2'],
          },
        },
      };

      expect(serializedSkillSet).to.deep.equal(expectedSkillSet);
    });
  });
});
