const { expect, sinon, catchErr } = require('../../../test-helper');
const { createOrganization } = require('../../../../lib/domain/usecases');
const Organization = require('../../../../lib/domain/models/Organization');
const organizationCreationValidator = require('../../../../lib/domain/validators/organization-creation-validator');
const organizationService = require('../../../../lib/domain/services/organization-service');
const { EntityValidationError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | create-organization', () => {

  beforeEach(() => {
    sinon.stub(organizationCreationValidator, 'validate');
    sinon.stub(organizationService, 'generateUniqueOrganizationCode');
  });

  context('Green cases', () => {

    const name = 'ACME';
    const type = 'PRO';
    const code = 'ABCD12';
    const externalId = 'externalId';
    const provinceCode = 'provinceCode';
    let organizationRepository;

    beforeEach(() => {
      organizationCreationValidator.validate.returns();
      organizationService.generateUniqueOrganizationCode.resolves(code);

      organizationRepository = { create: sinon.stub() };
      organizationRepository.create.resolves();
    });

    it('should validate params (name + type)', async () => {
      // when
      await createOrganization({ name, type, externalId, provinceCode, organizationRepository });

      // then
      expect(organizationCreationValidator.validate).to.have.been.calledWithExactly({ name, type });
    });

    it('should generate a unique code', async () => {
      // when
      await createOrganization({ name, type, externalId, provinceCode, organizationRepository });

      // then
      expect(organizationService.generateUniqueOrganizationCode).to.have.been.calledWithExactly({ organizationRepository });
    });

    it('should create a new Organization Entity into data repository', async () => {
      // given
      const expectedOrganization = new Organization({ name, type, code, externalId, provinceCode });

      // when
      await createOrganization({ name, type, externalId, provinceCode, organizationRepository });

      // then
      expect(organizationRepository.create).to.have.been.calledWithMatch(expectedOrganization);
    });
  });

  context('Red cases', () => {

    it('should reject an EntityValidationError when params are not valid', async () => {
      // given
      const name = 'ACME';
      const type = 'PRO';
      const organizationRepository = {};

      organizationCreationValidator.validate.throws(new EntityValidationError({}));

      // when
      const error = await catchErr(createOrganization)({ name, type, organizationRepository });

      // then
      expect(error).to.be.an.instanceOf(EntityValidationError);
    });
  });
});
