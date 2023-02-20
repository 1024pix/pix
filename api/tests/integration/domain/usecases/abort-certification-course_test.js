import { expect, databaseBuilder, knex } from '../../../test-helper';
import abortCertificationCourse from '../../../../lib/domain/usecases/abort-certification-course';
import certificationCourseRepository from '../../../../lib/infrastructure/repositories/certification-course-repository';

describe('Integration | UseCase | abort-certification-course', function () {
  context('when abort reason is valid', function () {
    it('should update the certificationCourse with a reason', async function () {
      // given
      const certificationCourse = databaseBuilder.factory.buildCertificationCourse();
      await databaseBuilder.commit();

      const abortReason = 'technical';
      // when
      await abortCertificationCourse({
        certificationCourseRepository,
        certificationCourseId: certificationCourse.id,
        abortReason,
      });

      // then
      const [abortReasonFound] = await knex('certification-courses')
        .select('abortReason')
        .where({ id: certificationCourse.id });

      expect(abortReasonFound).to.deep.equal({ abortReason });
    });
  });
});
