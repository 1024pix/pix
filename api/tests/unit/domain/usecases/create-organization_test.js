import { expect, sinon, catchErr } from '../../../test-helper';
import { createOrganization } from '../../../../lib/domain/usecases';
import OrganizationForAdmin from '../../../../lib/domain/models/OrganizationForAdmin';
import organizationCreationValidator from '../../../../lib/domain/validators/organization-creation-validator';
import { EntityValidationError } from '../../../../lib/domain/errors';

describe('Unit | UseCase | create-organization', function () {
  beforeEach(function () {
    sinon.stub(organizationCreationValidator, 'validate');
  });

  it('validates organization properties and saves it', async function () {
    // given
    const organization = new OrganizationForAdmin({
      name: 'ACME',
      type: 'PRO',
      externalId: 'externalId',
      provinceCode: 'provinceCode',
      documentationUrl: 'https://pix.fr',
      dataProtectionOfficerEmail: 'justin.ptipeu@example.net',
    });

    const organizationForAdminRepository = { save: sinon.stub().resolves({ id: 1 }) };
    const dataProtectionOfficerRepository = { create: sinon.stub().resolves({}) };

    organizationCreationValidator.validate.returns();

    // when
    await createOrganization({
      dataProtectionOfficerRepository,
      organization,
      organizationForAdminRepository,
    });

    // then
    expect(organizationCreationValidator.validate).to.have.been.calledWith(organization);
    expect(dataProtectionOfficerRepository.create).to.have.been.calledWith({
      organizationId: 1,
      firstName: undefined,
      lastName: undefined,
      email: 'justin.ptipeu@example.net',
    });
    expect(organizationForAdminRepository.save).to.have.been.calledWith(organization);
  });

  context('Error cases', function () {
    context('when params are not valid', function () {
      it('rejects an EntityValidationError', async function () {
        // given
        const organization = new OrganizationForAdmin({
          name: 'ACME',
          type: 'PRO',
        });
        const organizationRepository = {};

        organizationCreationValidator.validate.throws(new EntityValidationError({}));

        // when
        const error = await catchErr(createOrganization)({ organization, organizationRepository });

        // then
        expect(error).to.be.an.instanceOf(EntityValidationError);
      });
    });
  });
});
