import sinon from 'sinon';

import { profileController } from '../../../../src/profile/application/profile-controller.js';
import { usecases } from '../../../../src/profile/domain/usecases/index.js';
import { hFake } from '../../../tooling/mocks/hapi.mock.js';

describe('Profile | Unit | Controller | profile-controller', function () {
  describe('#getProfile', function () {
    beforeEach(function () {
      sinon.stub(usecases, 'getUserProfile').resolves({
        pixScore: 3,
        scorecards: [],
      });
    });

    it('should call the expected usecase', async function () {
      // given
      const profileSerializer = { serialize: sinon.stub() };
      profileSerializer.serialize.resolves();
      const userId = '12';
      const locale = 'fr';

      const request = {
        auth: {
          credentials: {
            userId,
          },
        },
        params: {
          id: userId,
        },
        state: { locale },
      };

      // when
      await profileController.getProfile(request, hFake, { profileSerializer });

      // then
      expect(usecases.getUserProfile).to.have.been.calledWithExactly({ userId, locale });
    });
  });
});
