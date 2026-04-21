import sinon from 'sinon';

import { OrganizationLearnerPasswordResetDTO } from '../../../../../../src/prescription/organization-learner/domain/models/OrganizationLearnerPasswordResetDTO.js';
import { generateResetOrganizationLearnersPasswordCsvContent } from '../../../../../../src/prescription/organization-learner/domain/usecases/generate-reset-organization-learners-password-cvs-content.js';

describe('Unit | UseCases | Generate reset organization learners csv', function () {
  it('returns generated CSV content', async function () {
    // given
    const OrganizationLearnerPasswordResets = [
      new OrganizationLearnerPasswordResetDTO({
        division: '3A',
        lastName: 'Brown',
        firstName: 'James',
        password: '123456@jb',
        username: 'jamesBrown',
      }),
      new OrganizationLearnerPasswordResetDTO({
        division: '3A',
        lastName: 'Lô',
        firstName: 'Ismaël',
        password: '123456@il',
        username: 'ismaelLo',
      }),
    ];
    const expectedCsvContent =
      'division;lastName;firstName;username;password\n3A;Brown;James;123456@jb\n3A;Lô;Ismaël;123456@il\n';
    const writeCsvUtils = { getCsvContent: sinon.stub().resolves(expectedCsvContent) };

    // when
    const generatedCsvContent = await generateResetOrganizationLearnersPasswordCsvContent({
      OrganizationLearnerPasswordResets,
      writeCsvUtils,
    });

    // then
    expect(generatedCsvContent).to.equal(expectedCsvContent);
  });
});
