import { OrganizationLearner } from '../../../../../src/school/domain/models/OrganizationLearner.js';
import { repositories } from '../../../../../src/school/infrastructure/repositories/index.js';
import { databaseBuilder, expect } from '../../../../test-helper.js';

describe('Integration | Repository | organizationLearner', function () {
  describe('#getById', function () {
    it('should return only the good organization learner', async function () {
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner();
      databaseBuilder.factory.buildOrganizationLearner();
      await databaseBuilder.commit();

      const result = await repositories.organizationLearnerRepository.getById({
        organizationLearnerId: organizationLearner.id,
      });
      expect(result).to.deep.equal(new OrganizationLearner({ ...organizationLearner }));
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

      const divisions = await repositories.organizationLearnerRepository.getDivisionsWhichStartedMission({
        missionId,
        organizationId,
      });

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

      const divisions = await repositories.organizationLearnerRepository.getDivisionsWhichStartedMission({
        missionId,
        organizationId,
      });

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

      const divisions = await repositories.organizationLearnerRepository.getDivisionsWhichStartedMission({
        missionId,
        organizationId,
      });

      expect(divisions).to.equal('CM2-started-mission');
    });
  });
});
