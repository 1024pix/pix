import sinon from 'sinon';

import * as usecase from '../../../../../src/shared/application/usecases/checkOrganizationIsNotManagingStudents.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Application | Use Case | checkOrganizationIsNotManagingStudents', function () {
  context('When organization is not managing students', function () {
    it('should return true', async function () {
      // given
      const organizationRepositoryStub = { get: sinon.stub() };
      const dependencies = {
        organizationRepository: organizationRepositoryStub,
      };

      const organization = domainBuilder.buildOrganization({ isManagingStudents: false });
      dependencies.organizationRepository.get.resolves(organization);

      // when
      const response = await usecase.execute({ organizationId: organization.id, dependencies });

      // then
      expect(response).to.be.true;
    });
  });

  context('When organization is managing students', function () {
    it('should return false', async function () {
      // given
      const organizationRepositoryStub = { get: sinon.stub() };
      const dependencies = {
        organizationRepository: organizationRepositoryStub,
      };
      const organization = domainBuilder.buildOrganization({ isManagingStudents: true });
      dependencies.organizationRepository.get.resolves(organization);

      // when
      const response = await usecase.execute({ organizationId: organization.id, dependencies });

      // then
      expect(response).to.be.false;
    });
  });
});
