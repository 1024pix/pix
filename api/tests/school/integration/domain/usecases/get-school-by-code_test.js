import { databaseBuilder, expect } from '../../../../test-helper.js';
import { usecases } from '../../../../../src/school/shared/usecases/index.js';
import { OrganizationLearner } from '../../../../../src/school/domain/models/OrganizationLearner.js';
import { School } from '../../../../../src/school/domain/models/School.js';

describe('Integration | UseCase | get-school-by-code', function () {
  context('when the school exists', function () {
    it('should return the school with students', async function () {
      const organization = databaseBuilder.factory.buildOrganization();
      const code = 'QUOICOUBE';
      const school = databaseBuilder.factory.buildSchool({ code, organizationId: organization.id });
      const rawStudent = databaseBuilder.factory.buildOrganizationLearner({ organizationId: organization.id });
      await databaseBuilder.commit();

      const expectedSchoolWithStudents = new School({
        id: organization.id,
        name: organization.name,
        code: school.code,
        organizationLearners: [new OrganizationLearner(rawStudent)],
      });

      const schoolWithStudents = await usecases.getSchoolByCode({ code });

      expect(schoolWithStudents).to.deep.equal(expectedSchoolWithStudents);
    });

    it('should return the school corresponding to code', async function () {
      const organization = databaseBuilder.factory.buildOrganization();
      const otherOrganization = databaseBuilder.factory.buildOrganization();
      const code = 'QUOICOUBE';
      const school = databaseBuilder.factory.buildSchool({ code, organizationId: organization.id });
      databaseBuilder.factory.buildSchool({ code: 'OTHERCODE', organizationId: otherOrganization.id });
      await databaseBuilder.commit();

      const expectedSchool = new School({
        id: organization.id,
        name: organization.name,
        code: school.code,
        organizationLearners: [],
      });

      const resultSchool = await usecases.getSchoolByCode({ code });

      expect(resultSchool).to.deep.equal(expectedSchool);
    });
  });
});
