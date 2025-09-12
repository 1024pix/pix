import { ComplementaryCertificationCourse } from '../../../../../../src/certification/evaluation/domain/models/ComplementaryCertificationCourse.js';
import * as complementaryCertificationCourseRepository from '../../../../../../src/certification/evaluation/infrastructure/repositories/complementary-certification-course-repository.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';

describe('Integration | Certification | Evaluation | Repository | Complementary-certification Course', function () {
  describe('#findByCertificationCourseId', function () {
    describe('when a complementary certification course exists', function () {
      it('should return a complementary certification course entity', async function () {
        // given
        const complementaryCertification = await databaseBuilder.factory.buildComplementaryCertification.droit({});

        const certificationCourse = await databaseBuilder.factory.buildCertificationCourse();

        await databaseBuilder.factory.buildComplementaryCertificationCourse({
          certificationCourseId: certificationCourse.id,
          complementaryCertificationId: complementaryCertification.id,
        });

        await databaseBuilder.commit();

        // when
        const result = await complementaryCertificationCourseRepository.findByCertificationCourseId({
          certificationCourseId: certificationCourse.id,
        });

        // then
        expect(result).to.be.instanceOf(ComplementaryCertificationCourse);
        expect(result.complementaryCertificationKey).to.equal(complementaryCertification.key);
      });
    });

    describe('when there is no complementary certification course for this course ID', function () {
      it('should return null', async function () {
        // given
        const certificationCourse = await databaseBuilder.factory.buildCertificationCourse();
        await databaseBuilder.commit();

        // when
        const result = await complementaryCertificationCourseRepository.findByCertificationCourseId({
          certificationCourseId: certificationCourse.id,
        });

        // then
        expect(result).to.be.null;
      });
    });
  });
});
