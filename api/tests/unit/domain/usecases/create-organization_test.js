const { expect, sinon, catchErr } = require('../../../test-helper');
const { createOrganization } = require('../../../../lib/domain/usecases');
const Organization = require('../../../../lib/domain/models/Organization');
const organizationCreationValidator = require('../../../../lib/domain/validators/organization-creation-validator');
const { EntityValidationError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | create-organization', () => {

  beforeEach(() => {
    sinon.stub(organizationCreationValidator, 'validate');
  });

  context('Green cases', () => {

    const name = 'ACME';
    const type = 'PRO';
    const externalId = 'externalId';
    const provinceCode = 'provinceCode';
    let organizationRepository;

    beforeEach(() => {
      organizationCreationValidator.validate.returns();

      organizationRepository = { create: sinon.stub() };
      organizationRepository.create.resolves();
    });

    it('should validate params (name + type)', async () => {
      // when
      await createOrganization({ name, type, externalId, provinceCode, organizationRepository });

      // then
      expect(organizationCreationValidator.validate).to.have.been.calledWithExactly({ name, type });
    });

    it('should create a new Organization Entity into data repository', async () => {
      // given
      const expectedOrganization = new Organization({ name, type, externalId, provinceCode });

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
