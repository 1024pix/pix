import { missionController } from '../../../../lib/application/missions/mission-controller.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../test-helper.js';

describe('Unit | Controller | mission-controller', function () {
  describe('#getById', function () {
    it('should get mission by id', async function () {
      // given
      const serializedMission = Symbol('serialized-missions');
      const mission = Symbol('mission');
      const missionId = 1;

      sinon.stub(usecases, 'getMission').withArgs({ missionId }).resolves(mission);
      const missionSerializer = { serialize: sinon.stub() };
      missionSerializer.serialize.withArgs(mission).returns(serializedMission);

      // when
      const response = await missionController.getById(
        {
          params: {
            id: missionId,
          },
        },
        hFake,
        { missionSerializer },
      );

      // then
      expect(response).to.deep.equal(serializedMission);
    });
  });
});
