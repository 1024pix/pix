import sinon from 'sinon';

import { certificationCenterController } from '../../../../../src/certification/enrolment/application/certification-centers-get-divisions-controller.js';
import { usecases } from '../../../../../src/certification/enrolment/domain/usecases/index.js';

import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Certification | Enrolment | Unit | Controller | certifications-centers-get-divisions-controller', function () {
  describe('#getDivisions', function () {
    it('Should return a serialized list of divisions', async function () {
      // given
      const request = {
        auth: {
          credentials: { userId: 111 },
        },
        params: {
          certificationCenterId: 99,
        },
      };

      sinon
        .stub(usecases, 'findDivisionsByCertificationCenter')
        .withArgs({ certificationCenterId: 99 })
        .resolves([{ name: '3A' }, { name: '3B' }, { name: '4C' }]);

      // when
      const response = await certificationCenterController.getDivisions(request, hFake);

      // then
      expect(response).to.deep.equal({
        data: [
          {
            type: 'divisions',
            id: '3A',
            attributes: {
              name: '3A',
            },
          },
          {
            type: 'divisions',
            id: '3B',
            attributes: {
              name: '3B',
            },
          },
          {
            type: 'divisions',
            id: '4C',
            attributes: {
              name: '4C',
            },
          },
        ],
      });
    });
  });
});
