import { OrganizationLearner } from '../../../../../../../src/prescription/organization-learner/application/api/models/OrganizationLearner.js';
import { expect } from '../../../../../../test-helper.js';

describe('Unit | Application| API | Models | OrganizationLearner', function () {
  it('should return attributes from learner', function () {
    // when
    const organizationLearner = new OrganizationLearner({
      firstName: 'Jean-Hugues',
      lastName: 'Delaforêt',
      'Libellé classe': '4ème',
      organizationId: 358,
    });

    // then
    expect(organizationLearner.firstName).to.equal('Jean-Hugues');
    expect(organizationLearner.lastName).to.equal('Delaforêt');
    expect(organizationLearner.division).to.equal('4ème');
    expect(organizationLearner.organizationId).to.equal(358);
  });
});
