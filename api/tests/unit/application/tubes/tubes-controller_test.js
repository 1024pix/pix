const { expect, sinon } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const tubeController = require('../../../../lib/application/tubes/tube-controller');
const skillSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/skill-serializer');

describe('Unit | Controller | tubes-controller', function () {
  let skills;
  let serializedSkills;

  beforeEach(function () {
    skills = Symbol('skills');
    serializedSkills = Symbol('serializedSkills');

    sinon.stub(usecases, 'getTubeSkills').returns(skills);
    sinon.stub(skillSerializer, 'serialize').returns(serializedSkills);
  });

  describe('#listSkills', function () {
    it('should return a list of skills', async function () {
      // given
      const request = {
        params: {
          id: 'tubeId',
        },
      };

      // when
      const result = await tubeController.listSkills(request);

      // then
      expect(result).to.equal(serializedSkills);
      expect(usecases.getTubeSkills).to.have.been.calledWith({ tubeId: 'tubeId' });
      expect(skillSerializer.serialize).to.have.been.calledWith(skills);
    });
  });
});
