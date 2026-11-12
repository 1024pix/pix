import { expect } from 'chai';
import sinon from 'sinon';

import { creditsLotController } from '../../../../../src/organizational-entities/application/credits/credits-lot.admin.controller.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Unit | Organizational Entities | Application | Controller | credit', function () {
  describe('#create', function () {
    it('takes the organization from the url and the author from the token', async function () {
      // given
      sinon.stub(usecases, 'createCreditsLot').resolves(123);

      const request = {
        params: { organizationId: 1 },
        auth: { credentials: { userId: 7 } },
        payload: Symbol('payload'),
      };
      const creditsLotSerializer = {
        deserialize: sinon.stub().resolves({
          count: 50,
          reference: 'CONV-2026-042',
          activationDate: '2026-01-01',
          expirationDate: '2026-12-31',
        }),
        serialize: sinon.stub().returns(Symbol('serialized')),
      };

      // when
      const response = await creditsLotController.create(request, hFake, { creditsLotSerializer });

      // then
      expect(usecases.createCreditsLot).to.have.been.calledWithExactly({
        organizationId: 1,
        creditsLot: {
          count: 50,
          reference: 'CONV-2026-042',
          activationDate: '2026-01-01',
          expirationDate: '2026-12-31',
          createdBy: 7,
        },
      });
      expect(response.statusCode).to.equal(201);
    });
  });
});
