import { expect, catchErr, sinon } from '../../../../test-helper.js';
import { updateOrganizationProvinceCode } from '../../../../../lib/domain/usecases/organizations-administration/update-organization-province-code.js';
import { OrganizationNotFoundError } from '../../../../../lib/domain/errors.js';
import { OrganizationForAdmin } from '../../../../../lib/domain/models/organizations-administration/OrganizationForAdmin.js';

describe('Unit | UseCases | Organizations administration | Update organization province code', function () {
  context('when organization exists', function () {
    it('updates organization department', async function () {
      // given
      const domainTransaction = Symbol('domainTransaction');
      const organizationForAdminRepository = {
        get: sinon.stub().resolves(new OrganizationForAdmin({ id: 1 })),
        update: sinon.stub().resolves(),
      };
      const organizationId = 1;
      const provinceCode = 12;

      // when
      await updateOrganizationProvinceCode({
        organizationId,
        provinceCode,
        organizationForAdminRepository,
        domainTransaction,
      });

      // then
      expect(organizationForAdminRepository.get).to.have.been.calledWithExactly(organizationId, domainTransaction);
      expect(organizationForAdminRepository.update).to.have.been.calledWithMatch(
        {
          id: organizationId,
          provinceCode,
        },
        domainTransaction,
      );
    });
  });

  context('when organization does not exists', function () {
    it('throws an OrganizationNotFoundError', async function () {
      // given
      const domainTransaction = Symbol('domainTransaction');
      const organizationForAdminRepository = { get: sinon.stub().resolves(), update: sinon.stub().resolves() };
      const organizationId = 1;
      const provinceCode = 14;

      // when
      const error = await catchErr(updateOrganizationProvinceCode)({
        organizationId,
        provinceCode,
        organizationForAdminRepository,
        domainTransaction,
      });

      // then
      expect(organizationForAdminRepository.get).to.have.been.calledWithExactly(organizationId, domainTransaction);
      expect(organizationForAdminRepository.update).to.not.have.been.called;
      expect(error).to.be.an.instanceOf(OrganizationNotFoundError);
    });
  });
});
