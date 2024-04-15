import { OrganizationLearnerImported } from '../../../../../../src/prescription/organization-learner/domain/models/OrganizationLearnerImported.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Domain | Models | OrganizationLearnerImported', function () {
  it('should flattened attributes from learner', function () {
    // given

    // when
    const organizationLearnerImported = new OrganizationLearnerImported({
      firstName: 'Jean-Michel',
      lastName: 'Dubois',
      attributes: { classe: '2nd', 'date de naissance': '2000-03-09' },
    });

    // then
    expect(organizationLearnerImported.classe).to.equal('2nd');
    expect(organizationLearnerImported['date de naissance']).to.equal('2000-03-09');
  });
});
