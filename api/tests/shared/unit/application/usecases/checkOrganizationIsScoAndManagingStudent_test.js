import * as useCase from '../../../../../src/shared/application/usecases/checkOrganizationIsScoAndManagingStudent.js';
import { domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Application | Use Case | checkOrganizationIsScoAndManagingStudent', function () {
  context('When organization is SCO managing students', function () {
    it('should return true', async function () {
      // given
      const organizationRepositoryStub = { get: sinon.stub() };
      const dependencies = {
        organizationRepository: organizationRepositoryStub,
      };

      const organization = domainBuilder.buildOrganization({ type: 'SCO', isManagingStudents: true });
      dependencies.organizationRepository.get.resolves(organization);

      // when
      const response = await useCase.execute({ organizationId: organization.id, dependencies });

      // then
      expect(response).to.be.true;
    });
  });

  context('When organization is SCO not managing students', function () {
    it('should return false', async function () {
      // given
      const organizationRepositoryStub = { get: sinon.stub() };
      const dependencies = {
        organizationRepository: organizationRepositoryStub,
      };
      const organization = domainBuilder.buildOrganization({ type: 'SCO', isManagingStudents: false });
      dependencies.organizationRepository.get.resolves(organization);

      // when
      const response = await useCase.execute({ organizationId: organization.id, dependencies });

      // then
      expect(response).to.be.false;
    });
  });

  context('When organization is not SCO and not managing students', function () {
    it('should return false', async function () {
      // given
      const organizationRepositoryStub = { get: sinon.stub() };
      const dependencies = {
        organizationRepository: organizationRepositoryStub,
      };
      const organization = domainBuilder.buildOrganization({ type: 'SCO', isManagingStudents: false });
      dependencies.organizationRepository.get.resolves(organization);

      // when
      const response = await useCase.execute({ organizationId: organization.id, dependencies });

      // then
      expect(response).to.be.false;
    });
  });
});
