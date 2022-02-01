const { expect, sinon } = require('../../../test-helper');

const replaceHigherSchoolingRegistrations = require('../../../../lib/domain/usecases/replace-higher-schooling-registrations');

describe('Unit | UseCase | ImportHigherSchoolingRegistration', function () {
  it('parses the csv received and replace the HigherSchoolingRegistration', async function () {
    const organizationId = 1;
    const registrations = Symbol('registrations');
    const warnings = Symbol('warnings');
    const higherSchoolingRegistrationParser = {
      parse: sinon.stub().returns({ registrations, warnings }),
    };
    const higherSchoolingRegistrationRepository = {
      replaceStudents: sinon.stub(),
    };

    await replaceHigherSchoolingRegistrations({
      organizationId,
      higherSchoolingRegistrationParser,
      higherSchoolingRegistrationRepository,
    });

    expect(higherSchoolingRegistrationRepository.replaceStudents).to.have.been.calledWith(
      organizationId,
      registrations
    );
  });

  it('should return warnings about the import', async function () {
    const organizationId = 1;
    const registrations = Symbol('registrations');
    const expectedWarnings = Symbol('warnings');
    const higherSchoolingRegistrationParser = {
      parse: sinon.stub().returns({ registrations, warnings: expectedWarnings }),
    };
    const higherSchoolingRegistrationRepository = {
      replaceStudents: sinon.stub(),
    };

    const warnings = await replaceHigherSchoolingRegistrations({
      organizationId,
      higherSchoolingRegistrationParser,
      higherSchoolingRegistrationRepository,
    });

    expect(warnings).to.equal(expectedWarnings);
  });
});
