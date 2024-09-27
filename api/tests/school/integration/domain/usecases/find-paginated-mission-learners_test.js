import { MissionLearner } from '../../../../../src/school/domain/models/MissionLearner.js';
import { usecases } from '../../../../../src/school/domain/usecases/index.js';
import { Assessment } from '../../../../../src/shared/domain/models/index.js';
import { databaseBuilder, expect } from '../../../../test-helper.js';

describe('Integration | Usecase | find-paginated-mission-learners', function () {
  describe('#findMissionLearners', function () {
    it('should return mission learners with mission progress status', async function () {
      const organization = databaseBuilder.factory.buildOrganization({ type: 'SCO-1D' });

      const organizationLearnerWithoutAssessment =
        databaseBuilder.factory.prescription.organizationLearners.buildOndeOrganizationLearner({
          organizationId: organization.id,
        });
      const organizationLearnerWithStartedAssessment =
        databaseBuilder.factory.prescription.organizationLearners.buildOndeOrganizationLearner({
          organizationId: organization.id,
        });
      const organizationLearnerWithCompletedAssessment =
        databaseBuilder.factory.prescription.organizationLearners.buildOndeOrganizationLearner({
          organizationId: organization.id,
        });

      const startedAssessment = databaseBuilder.factory.buildPix1dAssessment({
        state: Assessment.states.STARTED,
      });
      const completedAssessment = databaseBuilder.factory.buildPix1dAssessment({
        state: Assessment.states.COMPLETED,
      });

      const missionId = 1;
      databaseBuilder.factory.buildMissionAssessment({
        missionId,
        organizationLearnerId: organizationLearnerWithStartedAssessment.id,
        assessmentId: startedAssessment.id,
      });
      databaseBuilder.factory.buildMissionAssessment({
        missionId,
        organizationLearnerId: organizationLearnerWithCompletedAssessment.id,
        assessmentId: completedAssessment.id,
        result: { global: 'reached', steps: ['reached'], dare: 'not-reached' },
      });
      await databaseBuilder.commit();

      const page = {
        number: 1,
        size: 50,
      };
      const result = await usecases.findPaginatedMissionLearners({
        organizationId: organization.id,
        missionId,
        page,
        filter: { divisions: ['CM2A'] },
      });

      expect(result).to.deep.equal({
        missionLearners: [
          new MissionLearner({
            ...organizationLearnerWithoutAssessment,
            division: 'CM2A',
            missionStatus: 'not-started',
            result: null,
          }),
          new MissionLearner({
            ...organizationLearnerWithStartedAssessment,
            division: 'CM2A',
            missionStatus: 'started',
            result: null,
          }),
          new MissionLearner({
            ...organizationLearnerWithCompletedAssessment,
            division: 'CM2A',
            missionStatus: 'completed',
            result: { global: 'reached', steps: ['reached'], dare: 'not-reached' },
          }),
        ],
        pagination: {
          page: 1,
          pageCount: 1,
          pageSize: 50,
          rowCount: 3,
        },
      });
    });

    it('should return mission learners paginated', async function () {
      const organization = databaseBuilder.factory.buildOrganization({ type: 'SCO-1D' });

      databaseBuilder.factory.prescription.organizationLearners.buildOndeOrganizationLearner({
        organizationId: organization.id,
      });
      const organizationLearnerWithStartedAssessment =
        databaseBuilder.factory.prescription.organizationLearners.buildOndeOrganizationLearner({
          organizationId: organization.id,
        });
      const organizationLearnerWithCompletedAssessment =
        databaseBuilder.factory.prescription.organizationLearners.buildOndeOrganizationLearner({
          organizationId: organization.id,
        });

      const startedAssessment = databaseBuilder.factory.buildPix1dAssessment({
        state: Assessment.states.STARTED,
      });
      const completedAssessment = databaseBuilder.factory.buildPix1dAssessment({
        state: Assessment.states.COMPLETED,
      });

      const missionId = 1;
      databaseBuilder.factory.buildMissionAssessment({
        missionId,
        organizationLearnerId: organizationLearnerWithStartedAssessment.id,
        assessmentId: startedAssessment.id,
      });
      databaseBuilder.factory.buildMissionAssessment({
        missionId,
        organizationLearnerId: organizationLearnerWithCompletedAssessment.id,
        assessmentId: completedAssessment.id,
        result: { global: 'reached', steps: ['reached'], dare: 'not-reached' },
      });
      await databaseBuilder.commit();

      const page = {
        number: 2,
        size: 1,
      };
      const result = await usecases.findPaginatedMissionLearners({
        organizationId: organization.id,
        missionId,
        page,
        filter: { divisions: ['CM2A'] },
      });

      expect(result).to.deep.equal({
        missionLearners: [
          new MissionLearner({
            ...organizationLearnerWithStartedAssessment,
            division: 'CM2A',
            missionStatus: 'started',
            result: null,
          }),
        ],
        pagination: {
          page: 2,
          pageCount: 3,
          pageSize: 1,
          rowCount: 3,
        },
      });
    });

    it('should filter on global result', async function () {
      const organization = databaseBuilder.factory.buildOrganization({ type: 'SCO-1D' });

      databaseBuilder.factory.prescription.organizationLearners.buildOndeOrganizationLearner({
        organizationId: organization.id,
      });
      const organizationLearnerWithAssessment =
        databaseBuilder.factory.prescription.organizationLearners.buildOndeOrganizationLearner({
          organizationId: organization.id,
        });

      const assessment = databaseBuilder.factory.buildPix1dAssessment({
        state: Assessment.states.COMPLETED,
      });

      const missionId = 1;
      databaseBuilder.factory.buildMissionAssessment({
        missionId,
        organizationLearnerId: organizationLearnerWithAssessment.id,
        assessmentId: assessment.id,
        result: { global: 'reached' },
      });
      await databaseBuilder.commit();

      const page = {
        number: 1,
        size: 10,
      };
      const result = await usecases.findPaginatedMissionLearners({
        organizationId: organization.id,
        missionId,
        page,
        filter: { results: ['reached'] },
      });

      expect(result).to.deep.equal({
        missionLearners: [
          new MissionLearner({
            ...organizationLearnerWithAssessment,
            division: 'CM2A',
            missionStatus: 'completed',
            result: { global: 'reached' },
          }),
        ],
        pagination: {
          page: 1,
          pageCount: 1,
          pageSize: 10,
          rowCount: 1,
        },
      });
    });
  });
});
