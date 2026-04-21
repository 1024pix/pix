import { OrganizationLearner } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationLearner.js';
import { usecases } from '../../../../../../src/prescription/organization-learner/domain/usecases/index.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | UseCases | find-organization-learners-by-userId', function () {
  it('should return organization learner that match a userId', async function () {
    const adminUser = databaseBuilder.factory.buildUser();
    // given
    const learner = databaseBuilder.factory.buildOrganizationLearner({
      firstName: 'Bernard',
      lastName: 'Peurre',
    });
    const otherLearner = databaseBuilder.factory.buildOrganizationLearner({
      firstName: 'Bernard',
      lastName: 'Peurre',
      userId: learner.userId,
    });
    databaseBuilder.factory.buildOrganizationLearner({
      firstName: 'Bernard',
      lastName: 'Peurre',
      userId: learner.userId,
      deletedAt: new Date('2023-10-09'),
      deletedBy: adminUser.id,
    });
    await databaseBuilder.commit();

    // when
    const learners = await usecases.findOrganizationLearnersByUserId({
      userId: learner.userId,
    });

    // then
    expect(learners).lengthOf(2);
    expect(learners[0]).instanceOf(OrganizationLearner);
    expect(learners[1]).instanceOf(OrganizationLearner);
    expect(learners).deep.members([
      {
        id: learner.id,
        MEFCode: learner.MEFCode,
        attributes: learner.attributes,
        birthCity: learner.birthCity,
        birthCityCode: learner.birthCityCode,
        birthCountryCode: learner.birthCountryCode,
        birthProvinceCode: learner.birthProvinceCode,
        birthdate: learner.birthdate,
        certifiableAt: learner.certifiableAt,
        createdAt: learner.createdAt,
        deletedAt: learner.deletedAt,
        deletedBy: learner.deletedBy,
        department: learner.department,
        diploma: learner.diploma,
        division: learner.division,
        educationalTeam: learner.educationalTeam,
        email: learner.email,
        firstName: learner.firstName,
        group: learner.group,
        isCertifiable: learner.isCertifiable,
        isDisabled: learner.isDisabled,
        lastName: learner.lastName,
        middleName: learner.middleName,
        nationalApprenticeId: learner.nationalApprenticeId,
        nationalStudentId: learner.nationalStudentId,
        organizationId: learner.organizationId,
        preferredLastName: learner.preferredLastName,
        sex: learner.sex,
        status: learner.status,
        studentNumber: learner.studentNumber,
        thirdName: learner.thirdName,
        updatedAt: learner.updatedAt,
        userId: learner.userId,
      },
      {
        id: otherLearner.id,
        MEFCode: otherLearner.MEFCode,
        attributes: otherLearner.attributes,
        birthCity: otherLearner.birthCity,
        birthCityCode: otherLearner.birthCityCode,
        birthCountryCode: otherLearner.birthCountryCode,
        birthProvinceCode: otherLearner.birthProvinceCode,
        birthdate: otherLearner.birthdate,
        certifiableAt: otherLearner.certifiableAt,
        createdAt: otherLearner.createdAt,
        deletedAt: otherLearner.deletedAt,
        deletedBy: otherLearner.deletedBy,
        department: otherLearner.department,
        diploma: otherLearner.diploma,
        division: otherLearner.division,
        educationalTeam: otherLearner.educationalTeam,
        email: otherLearner.email,
        firstName: otherLearner.firstName,
        group: otherLearner.group,
        isCertifiable: otherLearner.isCertifiable,
        isDisabled: otherLearner.isDisabled,
        lastName: otherLearner.lastName,
        middleName: otherLearner.middleName,
        nationalApprenticeId: otherLearner.nationalApprenticeId,
        nationalStudentId: otherLearner.nationalStudentId,
        organizationId: otherLearner.organizationId,
        preferredLastName: otherLearner.preferredLastName,
        sex: otherLearner.sex,
        status: otherLearner.status,
        studentNumber: otherLearner.studentNumber,
        thirdName: otherLearner.thirdName,
        updatedAt: otherLearner.updatedAt,
        userId: otherLearner.userId,
      },
    ]);
  });
});
