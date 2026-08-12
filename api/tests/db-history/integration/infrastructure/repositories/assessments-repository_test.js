import { expect } from 'chai';

import { getAssessmentIdsByAssessmentTypeAndDateAndState } from '../../../../../src/db-history/infrastructure/repositories/assessments-repository.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | History-db | Infrastructure | Repository | Assessments', function () {
  describe('getAssessmentIdsByAssessmentTypeAndDateAndState', function () {
    it('should get paginated assessment ids for the given date ordered by id', async function () {
      databaseBuilder.factory.buildAssessment({
        id: 1,
        updatedAt: new Date('2020-01-02'),
        state: 'completed',
        type: 'CAMPAIGN',
      });

      databaseBuilder.factory.buildAssessment({
        id: 3,
        updatedAt: new Date('2020-01-02'),
        state: 'completed',
        type: 'CAMPAIGN',
      });

      databaseBuilder.factory.buildAssessment({
        id: 2,
        updatedAt: new Date('2020-01-02'),
        state: 'completed',
        type: 'CAMPAIGN',
      });

      await databaseBuilder.commit();

      const targetTypes = ['PREVIEW', 'CAMPAIGN'];
      const targetDate = '2020-01-02';
      const targetState = 'completed';

      // when
      const firstPageAssessmentIds = await getAssessmentIdsByAssessmentTypeAndDateAndState({
        targetTypes,
        targetDate,
        targetState,
        pageSize: 2,
        fromId: 0,
      });

      // then
      expect(firstPageAssessmentIds).to.have.length(2);
      expect(firstPageAssessmentIds[0]).to.deep.equal({ id: 1 });
      expect(firstPageAssessmentIds[1]).to.deep.equal({ id: 2 });

      // when
      const secondPageAssessmentIds = await getAssessmentIdsByAssessmentTypeAndDateAndState({
        targetTypes,
        targetDate,
        targetState,
        pageSize: 2,
        fromId: 2,
      });

      // then
      expect(secondPageAssessmentIds).to.have.length(1);
      expect(secondPageAssessmentIds[0]).to.deep.equal({ id: 3 });
    });

    describe('when assessment’s updatedAt is not target date', function () {
      it('should get one assessment id from the assessment for the given date', async function () {
        databaseBuilder.factory.buildAssessment({
          id: 1,
          updatedAt: new Date('2020-01-01'),
          state: 'completed',
          type: 'CAMPAIGN',
        });

        databaseBuilder.factory.buildAssessment({
          id: 2,
          updatedAt: new Date('2020-01-02'),
          state: 'completed',
          type: 'PREVIEW',
        });

        await databaseBuilder.commit();

        const targetTypes = ['PREVIEW', 'CAMPAIGN'];
        const targetDate = '2020-01-02';
        const targetState = 'completed';

        // when
        const assessmentIds = await getAssessmentIdsByAssessmentTypeAndDateAndState({
          targetTypes,
          targetDate,
          targetState,
        });

        // then
        expect(assessmentIds).to.have.length(1);
        expect(assessmentIds[0]).to.deep.equal({ id: 2 });
      });
    });
  });

  describe('when assessment’s type is not given target type', function () {
    it('should not return this assessment id', async function () {
      databaseBuilder.factory.buildAssessment({
        id: 1,
        updatedAt: new Date('2020-01-01'),
        state: 'completed',
        type: 'RANDOM',
      });

      databaseBuilder.factory.buildAssessment({
        id: 2,
        updatedAt: new Date('2020-01-02'),
        state: 'completed',
        type: 'CERTIFICATION',
      });

      await databaseBuilder.commit();

      const targetTypes = ['PREVIEW', 'CAMPAIGN'];
      const targetDate = '2020-01-02';
      const targetState = 'completed';

      // when
      const assessmentIds = await getAssessmentIdsByAssessmentTypeAndDateAndState({
        targetTypes,
        targetDate,
        targetState,
      });

      // then
      expect(assessmentIds).to.be.empty;
    });
  });

  describe('when assessment’s type is not completed', function () {
    it('should not return this assessment id', async function () {
      databaseBuilder.factory.buildAssessment({
        id: 1,
        updatedAt: new Date('2020-01-01'),
        state: 'unknown',
        type: 'PREVIEW',
      });

      databaseBuilder.factory.buildAssessment({
        id: 2,
        updatedAt: new Date('2020-01-01'),
        state: 'started',
        type: 'CAMPAIGN',
      });

      await databaseBuilder.commit();

      const targetTypes = ['PREVIEW', 'CAMPAIGN'];
      const targetDate = '2020-01-02';
      const targetState = 'completed';

      // when
      const assessmentIds = await getAssessmentIdsByAssessmentTypeAndDateAndState({
        targetTypes,
        targetDate,
        targetState,
      });

      // then
      expect(assessmentIds).to.be.empty;
    });
  });
});
