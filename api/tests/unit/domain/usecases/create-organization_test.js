const { expect, sinon, catchErr } = require('../../../test-helper');
const { createOrganization } = require('../../../../lib/domain/usecases');
const Organization = require('../../../../lib/domain/models/Organization');
const organizationCreationValidator = require('../../../../lib/domain/validators/organization-creation-validator');
const { EntityValidationError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | create-organization', function () {
  beforeEach(function () {
    sinon.stub(organizationCreationValidator, 'validate');
  });

  context('Green cases', function () {
    let name;
    let type;
    let externalId;
    let provinceCode;
    let documentationUrl;
    let organizationRepository;

    beforeEach(function () {
      name = 'ACME';
      type = 'PRO';
      externalId = 'externalId';
      provinceCode = 'provinceCode';
      documentationUrl = 'https://pix.fr';
      organizationCreationValidator.validate.returns();

      organizationRepository = { create: sinon.stub() };
      organizationRepository.create.resolves();
    });

    it('should validate params (name + type + documentationUrl)', async function () {
      // when
      await createOrganization({ name, type, documentationUrl, externalId, provinceCode, organizationRepository });

      // then
      expect(organizationCreationValidator.validate).to.have.been.calledWithExactly({ name, type, documentationUrl });
    });

    it('should create a new Organization Entity with Pix Master userId', async function () {
      // given
      const pixMasterUserId = 10;
      const createdBy = pixMasterUserId;
      const expectedOrganization = new Organization({
        createdBy,
        name,
        documentationUrl,
        type,
        externalId,
        provinceCode,
      });

      // when
      await createOrganization({
        createdBy,
        externalId,
        name,
        provinceCode,
        type,
        documentationUrl,
        organizationRepository,
      });

      // then
      expect(organizationRepository.create).to.have.been.calledWith(expectedOrganization);
    });
  });

  context('Red cases', function () {
    it('should reject an EntityValidationError when params are not valid', async function () {
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
