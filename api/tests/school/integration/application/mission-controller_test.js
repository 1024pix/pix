import { expect, hFake, sinon } from '../../../test-helper.js';
import { missionController } from '../../../../src/school/application/mission-controller.js';
import { Mission } from '../../../../src/school/domain/models/Mission.js';
import { usecases } from '../../../../src/school/shared/usecases/index.js';

describe('Integration | Controller | mission-controller', function () {
  describe('#getById', function () {
    it('should get mission by id', async function () {
      // given
      const mission = new Mission({ name: 'TAG1', id: 1 });
      sinon.stub(usecases, 'getMission').withArgs({ missionId: mission.id }).resolves(mission);

      // when
      const result = await missionController.getById(
        {
          params: {
            id: mission.id,
          },
        },
        hFake,
      );

      // then
      expect(result.data).to.deep.equal({
        attributes: {
          name: mission.name,
        },
        id: mission.id.toString(),
        type: 'missions',
      });
    });
  });
});
