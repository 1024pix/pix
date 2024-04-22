import { repositories } from '../../../../../src/school/infrastructure/repositories/index.js';
import { databaseBuilder, expect } from '../../../../test-helper.js';

describe('Integration | Repository | organizationLearner', function () {
  describe('#getDivisionsWhichStartedMission', function () {
    it('returns all divisions which started the mission', async function () {
      const missionId = 123;
      const organizationId = databaseBuilder.factory.buildOrganization().id;

      const organizationLearner =
        databaseBuilder.factory.prescription.organizationLearners.buildOndeOrganizationLearner({
          organizationId,
          division: 'CM2-started-mission',
        });
      databaseBuilder.factory.buildMissionAssessment({
        missionId,
        organizationLearnerId: organizationLearner.id,
      });

      const organizationLearner2 =
        databaseBuilder.factory.prescription.organizationLearners.buildOndeOrganizationLearner({
          organizationId,
          division: 'CM2-other-started-mission',
        });
      databaseBuilder.factory.buildMissionAssessment({
        missionId,
        organizationLearnerId: organizationLearner2.id,
      });

      databaseBuilder.factory.prescription.organizationLearners.buildOndeOrganizationLearner({
        organizationId,
        division: 'CM2-not-started-mission',
      });

      await databaseBuilder.commit();

      const divisions = await repositories.organizationLearnerRepository.getDivisionsWhichStartedMission({
        missionId,
        organizationId,
      });

      expect(divisions).to.includes('CM2-other-started-mission');
      expect(divisions).to.includes('CM2-started-mission');
      expect(divisions).to.not.include('CM2-not-started-mission');
    });

    it('returns the divisions which started the mission for the given organizationId', async function () {
      const missionId = 123;
      const organizationId = databaseBuilder.factory.buildOrganization().id;

      const organizationLearner =
        databaseBuilder.factory.prescription.organizationLearners.buildOndeOrganizationLearner({
          organizationId,
          division: 'CM2-started-mission',
        });
      databaseBuilder.factory.buildMissionAssessment({
        missionId,
        organizationLearnerId: organizationLearner.id,
      });

      const organizationLearnerFromOtherOrga =
        databaseBuilder.factory.prescription.organizationLearners.buildOndeOrganizationLearner({
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

    it('when there are 2 learners from the same division should return the division once', async function () {
      const missionId = 123;
      const organizationId = databaseBuilder.factory.buildOrganization().id;

      const organizationLearner =
        databaseBuilder.factory.prescription.organizationLearners.buildOndeOrganizationLearner({
          organizationId,
          division: 'CM2-started-mission',
        });
      databaseBuilder.factory.buildMissionAssessment({
        missionId,
        organizationLearnerId: organizationLearner.id,
      });

      const organizationLearnerFromSameOrga =
        databaseBuilder.factory.prescription.organizationLearners.buildOndeOrganizationLearner({
          organizationId,
          division: 'CM2-started-mission',
        });
      databaseBuilder.factory.buildMissionAssessment({
        missionId,
        organizationLearnerId: organizationLearnerFromSameOrga.id,
      });
      await databaseBuilder.commit();

      const divisions = await repositories.organizationLearnerRepository.getDivisionsWhichStartedMission({
        missionId,
        organizationId,
      });

      expect(divisions).to.equal('CM2-started-mission');
    });

    it('should return empty string when there is no learners started mission yet', async function () {
      const missionId = 123;
      const organizationId = databaseBuilder.factory.buildOrganization().id;

      databaseBuilder.factory.prescription.organizationLearners.buildOndeOrganizationLearner({
        organizationId,
        division: 'CM2-started-mission',
      });

      await databaseBuilder.commit();

      const divisions = await repositories.organizationLearnerRepository.getDivisionsWhichStartedMission({
        missionId,
        organizationId,
      });

      expect(divisions).to.equal('');
    });

    it('should return empty string when there is no learners ', async function () {
      const missionId = 123;
      const organizationId = databaseBuilder.factory.buildOrganization().id;

      await databaseBuilder.commit();

      const divisions = await repositories.organizationLearnerRepository.getDivisionsWhichStartedMission({
        missionId,
        organizationId,
      });

      expect(divisions).to.equal('');
    });
  });
});
