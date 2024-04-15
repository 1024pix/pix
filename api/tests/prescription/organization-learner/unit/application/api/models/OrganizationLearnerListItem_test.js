import { OrganizationLearnerListItem } from '../../../../../../../src/prescription/organization-learner/application/api/models/OrganizationLearnerListItem.js';
import { expect } from '../../../../../../test-helper.js';

describe('Unit | Application| API | Models | OrganizationLearnerListItem', function () {
  it('should return attributes from learner', function () {
    // given

    // when
    const organizationLearnerListItem = new OrganizationLearnerListItem({
      firstName: 'Jean-Hugues',
      lastName: 'Delaforêt',
      classe: '4ème',
    });

    // then
    expect(organizationLearnerListItem.firstName).to.equal('Jean-Hugues');
    expect(organizationLearnerListItem.lastName).to.equal('Delaforêt');
    expect(organizationLearnerListItem.classe).to.equal('4ème');
  });
});
