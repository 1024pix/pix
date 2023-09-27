import { expect, sinon, catchErr } from '../../../test-helper.js';
import { createOrganization } from '../../../../lib/domain/usecases/create-organization.js';
import { OrganizationForAdmin } from '../../../../lib/domain/models/organizations-administration/OrganizationForAdmin.js';
import { EntityValidationError } from '../../../../src/shared/domain/errors.js';

describe('Unit | UseCase | create-organization', function () {
  let organizationCreationValidator;
  let schoolRepository;
  let codeGenerator;

  beforeEach(function () {
    organizationCreationValidator = { validate: sinon.stub() };
    schoolRepository = { save: sinon.stub() };
    codeGenerator = { generate: sinon.stub() };
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
      schoolRepository,
    });

    // then
    expect(organizationCreationValidator.validate).to.have.been.calledWithExactly(organization);
    expect(dataProtectionOfficerRepository.create).to.have.been.calledWithExactly({
      organizationId: 1,
      firstName: '',
      lastName: '',
      email: 'justin.ptipeu@example.net',
    });
    expect(organizationForAdminRepository.save).to.have.been.calledWithExactly(organization);
  });

  context('When the type is SCO-1D', function () {
    it('should call the method to create a new code', async function () {
      // given

      const organization = new OrganizationForAdmin({
        id: 4,
        name: 'ACME',
        type: 'SCO-1D',
        documentationUrl: 'https://pix.fr',
      });

      const organizationForAdminRepository = {
        save: sinon.stub().resolves(organization),
        get: sinon.stub().resolves({ id: 1 }),
      };
      const dataProtectionOfficerRepository = { create: sinon.stub() };

      // when
      await createOrganization({
        organization,
        dataProtectionOfficerRepository,
        organizationForAdminRepository,
        organizationCreationValidator,
        schoolRepository,
        codeGenerator,
      });

      // then
      expect(codeGenerator.generate).to.have.been.calledWith(schoolRepository);
    });

    it('should call schoolRepository ', async function () {
      // given

      const organization = new OrganizationForAdmin({
        id: 4,
        name: 'ACME',
        type: 'SCO-1D',
        documentationUrl: 'https://pix.fr',
      });

      const organizationForAdminRepository = {
        save: sinon.stub().resolves(organization),
        get: sinon.stub().resolves({ id: 1 }),
      };
      const dataProtectionOfficerRepository = { create: sinon.stub() };
      const code = 'HAPPYY123';
      codeGenerator.generate.returns(code);

      // when
      await createOrganization({
        organization,
        dataProtectionOfficerRepository,
        organizationForAdminRepository,
        organizationCreationValidator,
        schoolRepository,
        codeGenerator,
      });

      // then
      expect(schoolRepository.save).to.have.been.calledWith({ organizationId: organization.id, code });
    });
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
