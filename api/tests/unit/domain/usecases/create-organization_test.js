import { EntityValidationError } from '../../../../lib/domain/errors.js';
import { OrganizationForAdmin } from '../../../../lib/domain/models/organizations-administration/OrganizationForAdmin.js';
import { createOrganization } from '../../../../lib/domain/usecases/create-organization.js';
import { catchErr, expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | create-organization', function () {
  let organizationCreationValidator;
  beforeEach(function () {
    organizationCreationValidator = { validate: sinon.stub() };
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

    const organizationForAdminRepository = {
      save: sinon.stub().resolves({ id: 1 }),
      get: sinon.stub().resolves({ id: 1 }),
    };
    const dataProtectionOfficerRepository = { create: sinon.stub().resolves({}) };

    organizationCreationValidator.validate.returns();

    // when
    await createOrganization({
      dataProtectionOfficerRepository,
      organization,
      organizationForAdminRepository,
      organizationCreationValidator,
    });

    // then
    expect(organizationCreationValidator.validate).to.have.been.calledWith(organization);
    expect(dataProtectionOfficerRepository.create).to.have.been.calledWith({
      organizationId: 1,
      firstName: '',
      lastName: '',
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
        const error = await catchErr(createOrganization)({
          organization,
          organizationRepository,
          organizationCreationValidator,
        });

        // then
        expect(error).to.be.an.instanceOf(EntityValidationError);
      });
    });
  });
});
