const { expect, catchErrSync } = require('../../../test-helper');
const createOrganization = require('../../../../lib/domain/usecases/organization-management/create-organization-v2');
const OrganizationForAdmin = require('../../../../lib/domain/models/OrganizationForAdmin_v2');
const { EntityValidationError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | organization-management | create-organization', function () {
  let validCommand;
  beforeEach(function () {
    validCommand = {
      name: 'valid name',
      type: 'SCO',
      documentationUrl: 'https://a-documentation-url.org',
      credit: 150,
      dataProtectionOfficerFirstName: 'Roxane',
      dataProtectionOfficerLastName: 'Popuchet',
      dataProtectionOfficerEmail: 'roxane.popuchet@baby.com',
    };
  });
  context('input validation', function () {
    context('name field', function () {
      context('KO', function () {
        it('should throw an error when name is empty', function () {
          // given
          validCommand.name = '';

          // when
          const err = catchErrSync(createOrganization)({ organizationCreationCommand: validCommand });

          // then
          expect(err).to.be.instanceOf(EntityValidationError);
          expect(err.invalidAttributes[0]).to.deep.equal({
            attribute: 'name',
            message: 'Le nom de l’organisation doit être une chaîne de caractères.',
          });
        });
        it('should throw an error when name is null', function () {
          // given
          validCommand.name = null;

          // when
          const err = catchErrSync(createOrganization)({ organizationCreationCommand: validCommand });

          // then
          expect(err).to.be.instanceOf(EntityValidationError);
          expect(err.invalidAttributes[0]).to.deep.equal({
            attribute: 'name',
            message: 'Le nom de l’organisation doit être une chaîne de caractères.',
          });
        });
        it('should throw an error when name is not a string', function () {
          // given
          validCommand.name = 123;

          // when
          const err = catchErrSync(createOrganization)({ organizationCreationCommand: validCommand });

          // then
          expect(err).to.be.instanceOf(EntityValidationError);
          expect(err.invalidAttributes[0]).to.deep.equal({
            attribute: 'name',
            message: 'Le nom de l’organisation doit être une chaîne de caractères.',
          });
        });
      });
      context('OK', function () {
        it('should create the organization with the given name', function () {
          // given
          validCommand.name = 'valid name';

          // when
          const createdOrganization = createOrganization({ organizationCreationCommand: validCommand });

          // then
          expect(createdOrganization.toDTO().name).to.equal('valid name');
        });
      });
    });
    context('type field', function () {
      context('KO', function () {
        it('should throw an error when type is empty', function () {
          // given
          validCommand.type = '';

          // when
          const err = catchErrSync(createOrganization)({ organizationCreationCommand: validCommand });

          // then
          expect(err).to.be.instanceOf(EntityValidationError);
          expect(err.invalidAttributes[0]).to.deep.equal({
            attribute: 'type',
            message: 'Le type de l’organisation doit avoir l’une des valeurs suivantes: SCO, SUP, PRO.',
          });
        });

        it('should throw an error when type is null', function () {
          // given
          validCommand.type = null;

          // when
          const err = catchErrSync(createOrganization)({ organizationCreationCommand: validCommand });

          // then
          expect(err).to.be.instanceOf(EntityValidationError);
          expect(err.invalidAttributes[0]).to.deep.equal({
            attribute: 'type',
            message: 'Le type de l’organisation doit avoir l’une des valeurs suivantes: SCO, SUP, PRO.',
          });
        });

        it('should throw an error when type is not a string', function () {
          // given
          validCommand.type = 123;

          // when
          const err = catchErrSync(createOrganization)({ organizationCreationCommand: validCommand });

          // then
          expect(err).to.be.instanceOf(EntityValidationError);
          expect(err.invalidAttributes[0]).to.deep.equal({
            attribute: 'type',
            message: 'Le type de l’organisation doit avoir l’une des valeurs suivantes: SCO, SUP, PRO.',
          });
        });

        it('should throw an error when type is not a string among expected values', function () {
          // given
          validCommand.type = 'HELLO';

          // when
          const err = catchErrSync(createOrganization)({ organizationCreationCommand: validCommand });

          // then
          expect(err).to.be.instanceOf(EntityValidationError);
          expect(err.invalidAttributes[0]).to.deep.equal({
            attribute: 'type',
            message: 'Le type de l’organisation doit avoir l’une des valeurs suivantes: SCO, SUP, PRO.',
          });
        });
      });
      context('OK', function () {
        it('should create the organization with type "SCO"', function () {
          // given
          validCommand.type = 'SCO';

          // when
          const createdOrganization = createOrganization({ organizationCreationCommand: validCommand });

          // then
          expect(createdOrganization.toDTO().type).to.equal('SCO');
        });
        it('should create the organization with type "SUP"', function () {
          // given
          validCommand.type = 'SUP';

          // when
          const createdOrganization = createOrganization({ organizationCreationCommand: validCommand });

          // then
          expect(createdOrganization.toDTO().type).to.equal('SUP');
        });
        it('should create the organization with type "PRO"', function () {
          // given
          validCommand.type = 'PRO';

          // when
          const createdOrganization = createOrganization({ organizationCreationCommand: validCommand });

          // then
          expect(createdOrganization.toDTO().type).to.equal('PRO');
        });
      });
    });
    context('documentationUrl field', function () {
      context('KO', function () {
        it('should throw an error when documentationUrl is not a valid URI', function () {
          // given
          validCommand.documentationUrl = 'invalid uri';

          // when
          const err = catchErrSync(createOrganization)({ organizationCreationCommand: validCommand });

          // then
          expect(err).to.be.instanceOf(EntityValidationError);
          expect(err.invalidAttributes[0]).to.deep.equal({
            attribute: 'documentationUrl',
            message: 'Le lien vers la documentation n’est pas valide.',
          });
        });
      });
      context('OK', function () {
        it('should create the organization with given documentationUrl when provided', function () {
          // given
          validCommand.documentationUrl = 'https://documentation-url.org';

          // when
          const createdOrganization = createOrganization({ organizationCreationCommand: validCommand });

          // then
          expect(createdOrganization.toDTO().documentationUrl).to.equal('https://documentation-url.org');
        });

        it('should create the organization with an empty documentationUrl when empty string provided', function () {
          // given
          validCommand.documentationUrl = '';

          // when
          const createdOrganization = createOrganization({ organizationCreationCommand: validCommand });

          // then
          expect(createdOrganization.toDTO().documentationUrl).to.equal('');
        });
        it('should create the organization with an empty documentationUrl when null provided', function () {
          // given
          validCommand.documentationUrl = null;

          // when
          const createdOrganization = createOrganization({ organizationCreationCommand: validCommand });

          // then
          expect(createdOrganization.toDTO().documentationUrl).to.equal('');
        });
      });
    });
    context('credit field', function () {
      context('KO', function () {
        it('should throw an error when credit is not a number', function () {
          // given
          validCommand.credit = 'invalid credit';

          // when
          const err = catchErrSync(createOrganization)({ organizationCreationCommand: validCommand });

          // then
          expect(err).to.be.instanceOf(EntityValidationError);
          expect(err.invalidAttributes[0]).to.deep.equal({
            attribute: 'credit',
            message: 'Le nombre de crédits est optionnel. Si renseigné, il doit être positif ou nul.',
          });
        });
        it('should throw an error when credit is not positive', function () {
          // given
          validCommand.credit = -10;

          // when
          const err = catchErrSync(createOrganization)({ organizationCreationCommand: validCommand });

          // then
          expect(err).to.be.instanceOf(EntityValidationError);
          expect(err.invalidAttributes[0]).to.deep.equal({
            attribute: 'credit',
            message: 'Le nombre de crédits est optionnel. Si renseigné, il doit être positif ou nul.',
          });
        });
        it('should throw an error when credit is not an integer', function () {
          // given
          validCommand.credit = 12.5;

          // when
          const err = catchErrSync(createOrganization)({ organizationCreationCommand: validCommand });

          // then
          expect(err).to.be.instanceOf(EntityValidationError);
          expect(err.invalidAttributes[0]).to.deep.equal({
            attribute: 'credit',
            message: 'Le nombre de crédits est optionnel. Si renseigné, il doit être positif ou nul.',
          });
        });
      });
      context('OK', function () {
        it('should create the organization with given credit amount when provided', function () {
          // given
          validCommand.credit = 66;

          // when
          const createdOrganization = createOrganization({ organizationCreationCommand: validCommand });

          // then
          expect(createdOrganization.toDTO().credit).to.equal(66);
        });
        it('should create the organization with 0 credit when passing 0', function () {
          // given
          validCommand.credit = 0;

          // when
          const createdOrganization = createOrganization({ organizationCreationCommand: validCommand });

          // then
          expect(createdOrganization.toDTO().credit).to.equal(0);
        });
        it('should create the organization with 0 credit when passing null', function () {
          // given
          validCommand.credit = null;

          // when
          const createdOrganization = createOrganization({ organizationCreationCommand: validCommand });

          // then
          expect(createdOrganization.toDTO().credit).to.equal(0);
        });
      });
    });
    context('dataProtectionOfficerEmail field', function () {
      context('KO', function () {
        it('should throw an error when dataProtectionOfficerEmail is not a valid email', function () {
          // given
          validCommand.dataProtectionOfficerEmail = 'invalid email';

          // when
          const err = catchErrSync(createOrganization)({ organizationCreationCommand: validCommand });

          // then
          expect(err).to.be.instanceOf(EntityValidationError);
          expect(err.invalidAttributes[0]).to.deep.equal({
            attribute: 'dataProtectionOfficerEmail',
            message: 'L’email fourni n’est pas valide.',
          });
        });
      });
      context('OK', function () {
        it('should create the organization with given dataProtectionOfficerEmail when provided', function () {
          // given
          validCommand.dataProtectionOfficerEmail = 'roxane.popuchet@baby.com';

          // when
          const createdOrganization = createOrganization({ organizationCreationCommand: validCommand });

          // then
          expect(createdOrganization.toDTO().dataProtectionOfficerEmail).to.equal('roxane.popuchet@baby.com');
        });
        it('should create the organization with an empty dataProtectionOfficerEmail when null provided', function () {
          // given
          validCommand.dataProtectionOfficerEmail = null;

          // when
          const createdOrganization = createOrganization({ organizationCreationCommand: validCommand });

          // then
          expect(createdOrganization.toDTO().dataProtectionOfficerEmail).to.equal('');
        });
        it('should create the organization with an empty dataProtectionOfficerEmail when empty string provided', function () {
          // given
          validCommand.dataProtectionOfficerEmail = '';

          // when
          const createdOrganization = createOrganization({ organizationCreationCommand: validCommand });

          // then
          expect(createdOrganization.toDTO().dataProtectionOfficerEmail).to.equal('');
        });
      });
    });
  });
  context('initialisation values', function () {
    it('should create an organization with some default values set', function () {
      // when
      const createdOrganization = createOrganization({ organizationCreationCommand: validCommand });

      // then
      const expectedOrganization = new OrganizationForAdmin({
        ...validCommand,
        id: undefined,
        isManagingStudents: false,
        showNPS: false,
        showSkills: false,
      });
      expect(createdOrganization).to.deepEqualInstance(expectedOrganization);
    });
  });
});
