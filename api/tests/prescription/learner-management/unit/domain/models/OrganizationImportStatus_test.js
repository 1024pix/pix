import { IMPORT_STATUSES } from '../../../../../../src/prescription/learner-management/domain/constants.js';
import { OrganizationImportStatus } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationImportStatus.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Models | OrganizationImportStatus', function () {
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

  it('should instantiate an OrganizationImportStatus', function () {
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

    const organizationImportStatus = new OrganizationImportStatus(attributes);

    expect(organizationImportStatus).to.be.deep.equal(attributes);
  });

  it('should create new OrganizationImportStatus', function () {
    const organizationImportStatus = OrganizationImportStatus.create({ organizationId: 1, createdBy: 1 });
    const createdAt = new Date('2023-01-01');

    expect(organizationImportStatus).to.be.deep.equal({
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
    it('should upload an OrganizationImportStatus with success', function () {
      const organizationImportStatus = OrganizationImportStatus.create({ organizationId: 1, createdBy: 1 });

      organizationImportStatus.upload({ filename: 'test,csv', encoding: 'utf8', errors: undefined });

      expect(organizationImportStatus).to.includes({
        filename: 'test,csv',
        encoding: 'utf8',
        status: IMPORT_STATUSES.UPLOADED,
      });
    });

    it('should upload an OrganizationImportStatus with failure', function () {
      const organizationImportStatus = OrganizationImportStatus.create({ organizationId: 1, createdBy: 1 });
      const errors = [{ message: 'Something went wrong' }];

      organizationImportStatus.upload({ errors });

      expect(organizationImportStatus).to.includes({
        errors,
        status: IMPORT_STATUSES.UPLOAD_ERROR,
      });
    });
  });

  describe('#validate', function () {
    it('should validate an OrganizationImportStatus with success', function () {
      const organizationImportStatus = OrganizationImportStatus.create({ organizationId: 1, createdBy: 1 });

      organizationImportStatus.validate({ errors: undefined });

      expect(organizationImportStatus).to.includes({
        status: IMPORT_STATUSES.VALIDATED,
      });
      expect(organizationImportStatus.errors).to.be.null;
    });

    it('should validate an OrganizationImportStatus with success and warnings', function () {
      const organizationImportStatus = OrganizationImportStatus.create({ organizationId: 1, createdBy: 1 });
      const warnings = [{ message: 'There is an unknown column' }];

      organizationImportStatus.validate({ warnings });

      expect(organizationImportStatus.status).to.equal(IMPORT_STATUSES.VALIDATED);
      expect(organizationImportStatus.errors).to.be.deep.equal(warnings);
    });

    it('should validate an OrganizationImportStatus with failure', function () {
      const organizationImportStatus = OrganizationImportStatus.create({ organizationId: 1, createdBy: 1 });
      const errors = [{ message: 'Something went wrong' }];

      organizationImportStatus.validate({ errors });

      expect(organizationImportStatus.status).to.equal(IMPORT_STATUSES.VALIDATION_ERROR);
      expect(organizationImportStatus.errors).to.be.deep.equal(errors);
    });

    it('should validate an OrganizationImportStatus with failure and warnings', function () {
      const organizationImportStatus = OrganizationImportStatus.create({ organizationId: 1, createdBy: 1 });
      const errors = [{ message: 'Something went wrong' }];
      const warnings = [{ message: 'There is an unknown column' }];

      organizationImportStatus.validate({ errors, warnings });

      expect(organizationImportStatus.status).to.equal(IMPORT_STATUSES.VALIDATION_ERROR);
      expect(organizationImportStatus.errors).to.have.members([...warnings, ...errors]);
    });
  });

  describe('#process', function () {
    it('should process an OrganizationImportStatus with success', function () {
      const organizationImportStatus = OrganizationImportStatus.create({ organizationId: 1, createdBy: 1 });

      organizationImportStatus.process({ errors: undefined });

      expect(organizationImportStatus.status).to.equal(IMPORT_STATUSES.IMPORTED);
    });

    it('should process an OrganizationImportStatus with failure', function () {
      const organizationImportStatus = OrganizationImportStatus.create({ organizationId: 1, createdBy: 1 });
      const errors = [{ message: 'Something went wrong' }];

      organizationImportStatus.process({ errors });

      expect(organizationImportStatus).to.includes({
        errors,
        status: IMPORT_STATUSES.IMPORT_ERROR,
      });
    });
  });
});
