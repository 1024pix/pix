import { expect, sinon } from '../../../test-helper.js';
import { generateResetOrganizationLearnersPasswordCsvContent } from '../../../../lib/domain/usecases/generate-reset-organization-learners-password-cvs-content.js';
import { OrganizationLearnerPasswordDTO } from '../../../../lib/domain/models/OrganizationLearnerPasswordDTO.js';

describe('Unit | UseCases | Generate reset organization learners csv', function () {
  it('returns generated CSV content', async function () {
    // given
    const organizationLearnersGeneratedPassword = [
      new OrganizationLearnerPasswordDTO({
        division: '3A',
        password: '123456@Bc',
        username: 'brown',
      }),
      new OrganizationLearnerPasswordDTO({
        division: '3A',
        password: '123456@Bc',
        username: 'sugar',
      }),
    ];
    const expectedCsvContent = 'username;password;classe\nbrown;123456@Bc;3A\nsugar;123456@Bc;3A\n';
    const writeCsvUtils = { getCsvContent: sinon.stub().resolves(expectedCsvContent) };

    // when
    const generatedCsvContent = await generateResetOrganizationLearnersPasswordCsvContent({
      organizationLearnersGeneratedPassword,
      writeCsvUtils,
    });

    // then
    expect(generatedCsvContent).to.equal(expectedCsvContent);
  });
});
