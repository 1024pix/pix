import sinon from 'sinon';

import { organizationLearnerTypesController } from '../../../../../src/organizational-entities/application/organization-learner-type/organization-learner-type.admin.controller.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Unit | Organizational Entities | Application | Controller | Admin | OrganizationLearnerType', function () {
  describe('#findAllOrganizationLearnerTypes', function () {
    it('calls findAllOrganizationLearnerTypes usecase and OrganizationLearnerType serializer', async function () {
      // given
      const organizationLearnerType1 = domainBuilder.acquisition.buildOrganizationLearnerType({ name: 'Public 1' });
      const organizationLearnerType2 = domainBuilder.acquisition.buildOrganizationLearnerType({ name: 'Public 2' });
      const organizationLearnerTypes = [organizationLearnerType1, organizationLearnerType2];
      sinon.stub(usecases, 'findAllOrganizationLearnerTypes').resolves(organizationLearnerTypes);
      const organizationLearnerTypeSerializer = { serialize: sinon.stub() };

      // when
      await organizationLearnerTypesController.findAllOrganizationLearnerTypes({}, hFake, {
        organizationLearnerTypeSerializer,
      });

      // then
      expect(usecases.findAllOrganizationLearnerTypes).to.have.been.calledOnce;
      expect(organizationLearnerTypeSerializer.serialize).to.have.been.calledWithExactly(organizationLearnerTypes);
    });
  });
});
