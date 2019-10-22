const { expect, sinon } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
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
    const isManagingStudents = true;
    let organizationRepository;

    beforeEach(() => {
      organizationCreationValidator.validate.resolves(true);
      organizationService.generateUniqueOrganizationCode.resolves(code);

      organizationRepository = { create: sinon.stub() };
      organizationRepository.create.resolves();
    });

    it('should validate params (name + type)', () => {
      // when
      const promise = usecases.createOrganization({ name, type, externalId, provinceCode, isManagingStudents, organizationRepository });

      // then
      return promise.then(() => {
        expect(organizationCreationValidator.validate).to.have.been.calledWithExactly({ name, type });
      });
    });

    it('should generate a unique code', () => {
      // when
      const promise = usecases.createOrganization({ name, type, externalId, provinceCode, isManagingStudents, organizationRepository });

      // then
      return promise.then(() => {
        expect(organizationService.generateUniqueOrganizationCode).to.have.been.calledWithExactly({ organizationRepository });
      });
    });

    it('should create a new Organization Entity into data repository', () => {
      // when
      const promise = usecases.createOrganization({ name, type, externalId, provinceCode, isManagingStudents, organizationRepository });

      // then
      return expect(promise).to.be.fulfilled.then(() => {
        const expectedOrganization = new Organization({ name, type, code, externalId, provinceCode, isManagingStudents, });
        expect(organizationRepository.create).to.have.been.calledWithMatch(expectedOrganization);
      });
    });

  });

  context('Red cases', () => {

    it('should reject an EntityValidationError when params are not valid', () => {
      // given
      const name = 'ACME';
      const type = 'PRO';
      const organizationRepository = {};

      organizationCreationValidator.validate.rejects(new EntityValidationError({}));

      // when
      const promise = usecases.createOrganization({ name, type, organizationRepository });

      // then
      return expect(promise).to.be.rejected.then((error) => {
        expect(error).to.be.an.instanceOf(EntityValidationError);
      });
    });
  });
});
