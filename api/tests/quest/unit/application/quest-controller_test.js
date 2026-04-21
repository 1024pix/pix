import sinon from 'sinon';

import { questController } from '../../../../src/quest/application/quest-controller.js';
import { usecases } from '../../../../src/quest/domain/usecases/index.js';

import { hFake } from '../../../tooling/mocks/hapi.mock.js';

describe('Unit | Application | Controller | Quest', function () {
  describe('#checkUserQuest', function () {
    it('should return statusCode 200', async function () {
      // given
      const userId = 1234;
      const questId = 1;
      const request = {
        payload: {
          data: {
            attributes: {
              'user-id': userId,
              'quest-id': questId,
            },
          },
        },
      };

      sinon.stub(usecases, 'checkUserQuest');

      // when
      const response = await questController.checkUserQuest(request, hFake);

      // then
      expect(response.statusCode).to.be.equal(200);
      expect(usecases.checkUserQuest).to.have.been.calledWithExactly({
        userId,
        questId,
      });
    });
  });
});
