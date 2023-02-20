import { expect, sinon } from '../../../test-helper';
import replaceSupOrganizationLearners from '../../../../lib/domain/usecases/replace-sup-organization-learner';

describe('Unit | UseCase | ImportSupOrganizationLearner', function () {
  it('parses the csv received and replace the SupOrganizationLearner', async function () {
    const organizationId = 1;
    const learners = Symbol('learners');
    const warnings = Symbol('warnings');
    const supOrganizationLearnerParser = {
      parse: sinon.stub().returns({ learners, warnings }),
    };
    const supOrganizationLearnerRepository = {
      replaceStudents: sinon.stub(),
    };

    await replaceSupOrganizationLearners({
      organizationId,
      supOrganizationLearnerParser,
      supOrganizationLearnerRepository,
    });

    expect(supOrganizationLearnerRepository.replaceStudents).to.have.been.calledWith(organizationId, learners);
  });

  it('should return warnings about the import', async function () {
    const organizationId = 1;
    const learners = Symbol('learners');
    const expectedWarnings = Symbol('warnings');
    const supOrganizationLearnerParser = {
      parse: sinon.stub().returns({ learners, warnings: expectedWarnings }),
    };
    const supOrganizationLearnerRepository = {
      replaceStudents: sinon.stub(),
    };

    const warnings = await replaceSupOrganizationLearners({
      organizationId,
      supOrganizationLearnerParser,
      supOrganizationLearnerRepository,
    });

    expect(warnings).to.equal(expectedWarnings);
  });
});
