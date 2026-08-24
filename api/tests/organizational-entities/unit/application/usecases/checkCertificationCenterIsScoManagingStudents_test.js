import sinon from 'sinon';

import * as useCase from '../../../../../src/organizational-entities/application/usecases/checkCertificationCenterIsScoManagingStudents.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Organizational Entities | Application | Use Case | checkCertificationCenterIsScoManagingStudents', function () {
  context('When certification center is linked to an organization with SCO managing students', function () {
    it('should return true', async function () {
      // given
      const dependencies = {
        organizationRepository: { get: sinon.stub() },
        centerRepository: { findActiveScoOrganizationId: sinon.stub() },
      };

      const organization = domainBuilder.buildOrganization({ type: 'SCO', isManagingStudents: true });
      dependencies.organizationRepository.get.resolves(organization);
      dependencies.centerRepository.findActiveScoOrganizationId.resolves(organization.id);

      // when
      const response = await useCase.execute({ certificationCenterId: 123, dependencies });

      // then
      expect(response).to.be.true;
    });
  });

  context('When certification center is linked to an organization with SCO not managing students', function () {
    it('should return false', async function () {
      // given
      const dependencies = {
        organizationRepository: { get: sinon.stub() },
        centerRepository: { findActiveScoOrganizationId: sinon.stub() },
      };

      const organization = domainBuilder.buildOrganization({ type: 'SCO', isManagingStudents: false });
      dependencies.organizationRepository.get.resolves(organization);
      dependencies.centerRepository.findActiveScoOrganizationId.resolves(organization.id);

      // when
      const response = await useCase.execute({ certificationCenterId: 123, dependencies });

      // then
      expect(response).to.be.false;
    });
  });

  context('When certification center is linked to an organization not SCO', function () {
    it('should return false', async function () {
      // given
      const dependencies = {
        organizationRepository: { get: sinon.stub() },
        centerRepository: { findActiveScoOrganizationId: sinon.stub() },
      };

      const organization = domainBuilder.buildOrganization({ type: 'PRO', isManagingStudents: true });
      dependencies.organizationRepository.get.resolves(organization);
      dependencies.centerRepository.findActiveScoOrganizationId.resolves(organization.id);

      // when
      const response = await useCase.execute({ certificationCenterId: 123, dependencies });

      // then
      expect(response).to.be.false;
    });
  });
});
