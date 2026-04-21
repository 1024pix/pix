import { usecases } from '../../../../../../src/prescription/learner-management/domain/usecases/index.js';

import { databaseBuilder, knex } from '../../../../../tooling/databases.js';

describe('Integration | UseCase | update-organization-learner-name', function () {
  describe('#updateOrganizationLearnerName', function () {
    it('should update organization learner first name and last name', async function () {
      // given
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        firstName: 'John',
        lastName: 'Doe',
      });
      await databaseBuilder.commit();

      // when
      await usecases.updateOrganizationLearnerName({
        organizationLearnerId: organizationLearner.id,
        firstName: 'Jane',
        lastName: 'Smith',
      });

      // then
      const updatedLearner = await knex('organization-learners')
        .select('firstName', 'lastName', 'updatedAt')
        .where({ id: organizationLearner.id })
        .first();

      expect(updatedLearner.firstName).to.equal('Jane');
      expect(updatedLearner.lastName).to.equal('Smith');
      expect(updatedLearner.updatedAt).to.be.a('date');
    });
  });
});
