import { expect, databaseBuilder, knex, sinon } from '../../../test-helper.js';
import { addLastAssessmentResultCertificationCourse } from '../../../../scripts/certification/fill-last-assessment-result-certification-course-table.js';

const ASSOC_TABLE_NAME = 'certification-courses-last-assessment-results';

const OLD_UPDATED_AT = new Date('2020-01-01');
const NEW_UPDATED_AT = new Date('2022-02-02');

describe('Integration | Scripts | Certification | fill-latest-assessment-result-certification-course-table', function () {
  let clock;

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now: NEW_UPDATED_AT, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  describe('#addLastAssessmentResultCertificationCourse', function () {
    describe('when there is assessment results', function () {
      it('Update last assessment results id for certification courses with no data yet', async function () {
        // given
        _buildCertification(1);
        _buildCertification(2);
        _buildCertification(3);
        _buildAssessmentResults({
          certificationCourseId: 1,
          latestAssessmentResultId: 10,
          lastCreatedAt: new Date('2020-01-01'),
        });
        _buildAssessmentResults({
          certificationCourseId: 1,
          latestAssessmentResultId: 999,
          lastCreatedAt: new Date('2020-01-03'),
        });
        _buildAssessmentResults({ certificationCourseId: 2, latestAssessmentResultId: 20 });
        _buildAssessmentResults({ certificationCourseId: 3, latestAssessmentResultId: 30 });

        await databaseBuilder.commit();
        await knex(ASSOC_TABLE_NAME).insert({
          certificationCourseId: 1,
          lastAssessmentResultId: 10,
        });

        // when
        await addLastAssessmentResultCertificationCourse();

        // then
        const certificationDTOs = await knex(ASSOC_TABLE_NAME).orderBy('certificationCourseId');
        expect(certificationDTOs).to.deep.equal([
          {
            certificationCourseId: 1,
            lastAssessmentResultId: 10,
          },
          { certificationCourseId: 2, lastAssessmentResultId: 20 },
          {
            certificationCourseId: 3,
            lastAssessmentResultId: 30,
          },
        ]);
      });
    });

    describe('when there is no assessment results', function () {
      it('do nothing', async function () {
        // given
        _buildCertification();
        await databaseBuilder.commit();

        // when
        await addLastAssessmentResultCertificationCourse();

        // then
        const certificationDTOs = await knex(ASSOC_TABLE_NAME).orderBy('certificationCourseId');
        expect(certificationDTOs).to.be.empty;
      });
    });
  });
});

function _buildCertification(id) {
  databaseBuilder.factory.buildCertificationCourse({
    id,
    updatedAt: OLD_UPDATED_AT,
  });
}

function _buildAssessmentResults({
  certificationCourseId,
  latestAssessmentResultId,
  lastCreatedAt = new Date('2021-01-01'),
}) {
  const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId }).id;
  // not the latest
  databaseBuilder.factory.buildAssessmentResult({
    assessmentId,
    createdAt: new Date('2020-01-01'),
  });
  // the latest
  databaseBuilder.factory.buildAssessmentResult({
    id: latestAssessmentResultId,
    assessmentId,
    createdAt: lastCreatedAt,
  });
  return assessmentId;
}
