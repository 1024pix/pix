import { IMPORT_STATUSES } from '../../../../../../src/prescription/learner-management/domain/constants.js';
import { OrganizationImport } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationImport.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Models | OrganizationImport', function () {
  let clock;

  beforeEach(async function () {
    clock = sinon.useFakeTimers({
      now: new Date('2023-01-01'),
      toFake: ['Date'],
    });
  });

  afterEach(async function () {
    clock.restore();
  });

  it('should instantiate an OrganizationImport', function () {
    const attributes = {
      id: 1,
      status: IMPORT_STATUSES.VALIDATION_ERROR,
      filename: 'test.csv',
      encoding: 'utf8',
      errors: [{ message: 'Something wants wrong' }],
      updatedAt: new Date(),
      createdAt: new Date(),
      createdBy: 1,
      organizationId: 1,
    };

    const organizationImport = new OrganizationImport(attributes);

    expect(organizationImport).to.be.deep.equal(attributes);
  });

  it('should create new OrganizationImport', function () {
    const organizationImport = OrganizationImport.create({ organizationId: 1, createdBy: 1 });
    const createdAt = new Date('2023-01-01');

    expect(organizationImport).to.be.deep.equal({
      id: undefined,
      organizationId: 1,
      createdBy: 1,
      createdAt,
      status: IMPORT_STATUSES.UPLOADING,
      filename: undefined,
      encoding: undefined,
      errors: undefined,
      updatedAt: undefined,
    });
  });

  describe('#upload', function () {
    it('should upload an OrganizationImport with success', function () {
      const organizationImport = OrganizationImport.create({ organizationId: 1, createdBy: 1 });

      organizationImport.upload({ filename: 'test,csv', encoding: 'utf8', errors: undefined });

      expect(organizationImport).to.includes({
        filename: 'test,csv',
        encoding: 'utf8',
        status: IMPORT_STATUSES.UPLOADED,
      });
    });

    it('should upload an OrganizationImport with failure', function () {
      const organizationImport = OrganizationImport.create({ organizationId: 1, createdBy: 1 });
      const errors = [{ message: 'Something went wrong' }];

      organizationImport.upload({ errors });

      expect(organizationImport).to.includes({
        errors,
        status: IMPORT_STATUSES.UPLOAD_ERROR,
      });
    });
  });

  describe('#validate', function () {
    it('should validate an OrganizationImport with success', function () {
      const organizationImport = OrganizationImport.create({ organizationId: 1, createdBy: 1 });

      organizationImport.validate({ errors: undefined });

      expect(organizationImport).to.includes({
        status: IMPORT_STATUSES.VALIDATED,
      });
      expect(organizationImport.errors).to.be.null;
    });

    it('should validate an OrganizationImport with success and warnings', function () {
      const organizationImport = OrganizationImport.create({ organizationId: 1, createdBy: 1 });
      const warnings = [{ message: 'There is an unknown column' }];

      organizationImport.validate({ warnings });

      expect(organizationImport.status).to.equal(IMPORT_STATUSES.VALIDATED);
      expect(organizationImport.errors).to.be.deep.equal(warnings);
    });

    it('should validate an OrganizationImport with failure', function () {
      const organizationImport = OrganizationImport.create({ organizationId: 1, createdBy: 1 });
      const errors = [{ message: 'Something went wrong' }];

      organizationImport.validate({ errors });

      expect(organizationImport.status).to.equal(IMPORT_STATUSES.VALIDATION_ERROR);
      expect(organizationImport.errors).to.be.deep.equal(errors);
    });

    it('should validate an OrganizationImport with failure and warnings', function () {
      const organizationImport = OrganizationImport.create({ organizationId: 1, createdBy: 1 });
      const errors = [{ message: 'Something went wrong' }];
      const warnings = [{ message: 'There is an unknown column' }];

      organizationImport.validate({ errors, warnings });

      expect(organizationImport.status).to.equal(IMPORT_STATUSES.VALIDATION_ERROR);
      expect(organizationImport.errors).to.have.members([...warnings, ...errors]);
    });
  });

  describe('#process', function () {
    it('should process an OrganizationImport with success', function () {
      const organizationImport = OrganizationImport.create({ organizationId: 1, createdBy: 1 });

      organizationImport.process({ errors: undefined });

      expect(organizationImport.status).to.equal(IMPORT_STATUSES.IMPORTED);
    });

    it('should process an OrganizationImport with failure', function () {
      const organizationImport = OrganizationImport.create({ organizationId: 1, createdBy: 1 });
      const errors = [{ message: 'Something went wrong' }];

      organizationImport.process({ errors });

      expect(organizationImport).to.includes({
        errors,
        status: IMPORT_STATUSES.IMPORT_ERROR,
      });
    });
  });
});
