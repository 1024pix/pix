import { expect } from 'chai';

import { OrganizationLearnerWithDivision } from '../../../../../../../src/prescription/organization-learner/application/api/models/OrganizationLearnerWithDivision.js';

describe('Unit | Application| API | Models | OrganizationLearnerWithDivision', function () {
  it('should return the division column of the learner, not its attributes', function () {
    // when
    const organizationLearner = new OrganizationLearnerWithDivision({
      id: 123,
      firstName: 'Jean-Hugues',
      lastName: 'Delaforêt',
      division: '4ème A',
      'Libellé classe': 'CM2',
      organizationId: 358,
      userId: 777,
    });

    // then
    expect(organizationLearner).to.deep.equal({
      id: 123,
      firstName: 'Jean-Hugues',
      lastName: 'Delaforêt',
      division: '4ème A',
      organizationId: 358,
      userId: 777,
    });
  });
});
