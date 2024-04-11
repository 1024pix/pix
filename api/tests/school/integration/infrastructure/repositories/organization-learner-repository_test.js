import { OrganizationLearner } from '../../../../../src/school/domain/models/OrganizationLearner.js';
import * as organizationLearnersRepository from '../../../../../src/school/infrastructure/repositories/organization-learner-repository.js';
import { databaseBuilder, expect } from '../../../../test-helper.js';

describe('Integration | Repository | organizationLearner', function () {
  describe('#getStudentsByOrganizationId', function () {
    it('should return student corresponding to the organizationId', async function () {
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const rawStudent = databaseBuilder.factory.buildOrganizationLearner({ organizationId });
      const student = new OrganizationLearner(rawStudent);
      databaseBuilder.factory.buildOrganizationLearner({ organizationId: otherOrganizationId });
      await databaseBuilder.commit();

      const students = await organizationLearnersRepository.getStudentsByOrganizationId(organizationId);

      expect(students).to.deep.equal([student]);
    });

    it('should return student order by firstname', async function () {
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const rawStudent1 = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
        firstName: 'Aaaaa',
        lastname: 'Aaaa',
      });

      const rawStudent2 = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
        firstName: 'Bbbbb',
        lastName: 'Bbbbb',
      });

      const rawStudent3 = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
        firstName: 'Aaaaaa',
        lastName: 'Bbbbb',
      });
      const student1 = new OrganizationLearner(rawStudent1);
      const student2 = new OrganizationLearner(rawStudent2);
      const student3 = new OrganizationLearner(rawStudent3);
      await databaseBuilder.commit();

      const students = await organizationLearnersRepository.getStudentsByOrganizationId(organizationId);

      expect(students).to.deep.equal([student1, student3, student2]);
    });
  });

  describe('#getById', function () {
    it('should return only the good organization learner', async function () {
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner();
      databaseBuilder.factory.buildOrganizationLearner();
      await databaseBuilder.commit();

      const result = await organizationLearnersRepository.getById(organizationLearner.id);
      expect(result).to.deep.equal(
        new OrganizationLearner({
          ...organizationLearner,
        }),
      );
    });
  });

  describe('#getDivisionsWhichStartedMission', function () {
    it('returns all divisions which started the mission', async function () {
      const missionId = 123;
      const organizationId = databaseBuilder.factory.buildOrganization().id;

      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
        division: 'CM2-started-mission',
      });
      databaseBuilder.factory.buildMissionAssessment({
        missionId,
        organizationLearnerId: organizationLearner.id,
      });

      const organizationLearner2 = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
        division: 'CM2-other-started-mission',
      });
      databaseBuilder.factory.buildMissionAssessment({
        missionId,
        organizationLearnerId: organizationLearner2.id,
      });

      databaseBuilder.factory.buildOrganizationLearner({ organizationId, division: 'CM2-not-started-mission' });

      await databaseBuilder.commit();

      const divisions = await organizationLearnersRepository.getDivisionsWhichStartedMission(missionId, organizationId);

      expect(divisions).to.equal('CM2-other-started-mission, CM2-started-mission');
    });

    it('returns the divisions which started the mission for the given organizationId', async function () {
      const missionId = 123;
      const organizationId = databaseBuilder.factory.buildOrganization().id;

      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
        division: 'CM2-started-mission',
      });
      databaseBuilder.factory.buildMissionAssessment({
        missionId,
        organizationLearnerId: organizationLearner.id,
      });

      const organizationLearnerFromOtherOrga = databaseBuilder.factory.buildOrganizationLearner({
        division: 'CM2-other-started-mission',
      });
      databaseBuilder.factory.buildMissionAssessment({
        missionId,
        organizationLearnerId: organizationLearnerFromOtherOrga.id,
      });
      await databaseBuilder.commit();

      const divisions = await organizationLearnersRepository.getDivisionsWhichStartedMission(missionId, organizationId);

      expect(divisions).to.equal('CM2-started-mission');
    });

    it('returns the divisions of organizationLearners who started the mission and who are not disabled', async function () {
      const missionId = 123;
      const organizationId = databaseBuilder.factory.buildOrganization().id;

      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
        division: 'CM2-started-mission',
      });
      databaseBuilder.factory.buildMissionAssessment({
        missionId,
        organizationLearnerId: organizationLearner.id,
      });

      const organizationLearner2 = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
        division: 'CM2-other-started-mission',
        isDisabled: true,
      });

      databaseBuilder.factory.buildMissionAssessment({
        missionId,
        organizationLearnerId: organizationLearner2.id,
      });
      await databaseBuilder.commit();

      const divisions = await organizationLearnersRepository.getDivisionsWhichStartedMission(missionId, organizationId);

      expect(divisions).to.equal('CM2-started-mission');
    });
  });
});
