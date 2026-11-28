import { expect } from 'chai';
import sinon from 'sinon';

import { organizationCreditsLotController } from '../../../../../src/organizational-entities/application/credits/organization-credits-lot.controller.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Unit | Organizational Entities | Application | Controller | organization-credits-lot', function () {
  describe('#getOrganizationCreditsLots', function () {
    it('returns the serialized credits lots of the organization from the url', async function () {
      // given
      const creditsLots = Symbol('credits-lots');
      const serialized = Symbol('serialized');
      sinon.stub(usecases, 'getOrganizationCreditsLots').withArgs({ organizationId: 1 }).resolves(creditsLots);
      const serialize = sinon.stub();
      serialize.withArgs(creditsLots).returns(serialized);
      const organizationCreditsLotSerializer = { serialize };
      const request = { params: { id: 1 } };

      // when
      const response = await organizationCreditsLotController.getOrganizationCreditsLots(request, hFake, {
        organizationCreditsLotSerializer,
      });

      // then
      expect(response).to.equal(serialized);
    });
  });
});
