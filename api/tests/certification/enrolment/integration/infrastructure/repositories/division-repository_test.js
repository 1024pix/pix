import * as divisionRepository from '../../../../../../src/certification/enrolment/infrastructure/repositories/division-repository.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | Certification | Enrolment | Infrastructure | Repository | division-repository', function () {
  describe('#findActiveDivisionsByOrganizationId', function () {
    it('should return the distinct divisions of the organization ordered by name', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      databaseBuilder.factory.buildOrganizationLearner({ organizationId: organization.id, division: '5A' });
      databaseBuilder.factory.buildOrganizationLearner({ organizationId: organization.id, division: '_3A' });
      databaseBuilder.factory.buildOrganizationLearner({ organizationId: organization.id, division: '3A' });
      databaseBuilder.factory.buildOrganizationLearner({ organizationId: organization.id, division: 'T2' });
      databaseBuilder.factory.buildOrganizationLearner({ organizationId: organization.id, division: 't1' });
      databaseBuilder.factory.buildOrganizationLearner({ organizationId: organization.id, division: 't1' });

      await databaseBuilder.commit();

      // when
      const divisions = await divisionRepository.findActiveDivisionsByOrganizationId({
        organizationId: organization.id,
      });

      // then
      expect(divisions).to.deep.equal([
        { name: '3A' },
        { name: '5A' },
        { name: 'T2' },
        { name: '_3A' },
        { name: 't1' },
      ]);
    });

    it('should only return divisions of the given organization', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      databaseBuilder.factory.buildOrganizationLearner({ organizationId: organization.id, division: '5A' });
      databaseBuilder.factory.buildOrganizationLearner({ division: '5B' });

      await databaseBuilder.commit();

      // when
      const divisions = await divisionRepository.findActiveDivisionsByOrganizationId({
        organizationId: organization.id,
      });

      // then
      expect(divisions).to.deep.equal([{ name: '5A' }]);
    });

    it('should omit divisions of disabled organization learners', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        division: '5A',
        isDisabled: false,
      });
      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        division: '5B',
        isDisabled: true,
      });

      await databaseBuilder.commit();

      // when
      const divisions = await divisionRepository.findActiveDivisionsByOrganizationId({
        organizationId: organization.id,
      });

      // then
      expect(divisions).to.deep.equal([{ name: '5A' }]);
    });

    it('should return nothing when the organization learner has no division', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        division: null,
        isDisabled: false,
      });

      await databaseBuilder.commit();

      // when
      const divisions = await divisionRepository.findActiveDivisionsByOrganizationId({
        organizationId: organization.id,
      });

      // then
      expect(divisions).to.be.empty;
    });
  });
});
