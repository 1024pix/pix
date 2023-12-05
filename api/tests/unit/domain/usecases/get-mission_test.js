import { catchErr, expect, sinon } from '../../../test-helper.js';
import { getMission } from '../../../../src/school/domain/usecases/get-mission.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';
import { Mission } from '../../../../src/school/domain/models/Mission.js';

describe('Unit | UseCase | get-mission', function () {
  let missionRepository;

  beforeEach(function () {
    missionRepository = {
      get: sinon.stub(),
    };
  });

  context('when the mission exists', function () {
    it('should return an existing mission', async function () {
      // given
      const missionId = 1;
      const missionToFind = new Mission({ id: 1, name: 'test' });
      missionRepository.get.withArgs(missionId).resolves(missionToFind);

      // when
      const mission = await getMission({ missionId, missionRepository });

      // then
      expect(mission).to.equal(missionToFind);
    });
  });

  context('when the mission does not exist', function () {
    it('should throw an error', async function () {
      // given
      const missionId = 123;
      missionRepository.get.withArgs(missionId).rejects(new NotFoundError());

      // when
      const err = await catchErr(getMission)({ missionId, missionRepository });

      // then
      expect(err).to.be.an.instanceof(NotFoundError);
    });
  });
});
