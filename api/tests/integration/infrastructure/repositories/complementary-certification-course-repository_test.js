const { expect, databaseBuilder } = require('../../../test-helper');
const complementaryCertificationCourseRepository = require('../../../../lib/infrastructure/repositories/complementary-certification-course-repository');

describe('Integration | Repository | complementary-certification-courses-repository', function () {
  describe('#hasComplementaryCertification', function () {
    describe('when complementary certification has been started for the certification course', function () {
      it('returns true', async function () {
        // given
        databaseBuilder.factory.buildComplementaryCertification({
          id: 1,
          name: 'Pix+Edu',
        });
        databaseBuilder.factory.buildComplementaryCertification({
          id: 2,
          name: 'Pix+Droit',
        });
        databaseBuilder.factory.buildCertificationCourse({ id: 99 });
        databaseBuilder.factory.buildComplementaryCertificationCourse({
          certificationCourseId: 99,
          complementaryCertificationId: 2,
        });

        await databaseBuilder.commit();

        // when
        const hasPixPlusDroit = await complementaryCertificationCourseRepository.hasComplementaryCertification({
          certificationCourseId: 99,
          complementaryCertificationName: 'Pix+Droit',
        });

        // then
        expect(hasPixPlusDroit).to.be.true;
      });
    });

    describe('when another complementary certification has been started for the certification course', function () {
      it('returns false', async function () {
        // given
        databaseBuilder.factory.buildComplementaryCertification({
          id: 1,
          name: 'Pix+Edu',
        });
        databaseBuilder.factory.buildComplementaryCertification({
          id: 2,
          name: 'Pix+Droit',
        });
        databaseBuilder.factory.buildCertificationCourse({ id: 99 });
        databaseBuilder.factory.buildComplementaryCertificationCourse({
          certificationCourseId: 99,
          complementaryCertificationId: 1,
        });

        await databaseBuilder.commit();

        // when
        const hasPixPlusDroit = await complementaryCertificationCourseRepository.hasComplementaryCertification({
          certificationCourseId: 99,
          complementaryCertificationName: 'Pix+Droit',
        });

        // then
        expect(hasPixPlusDroit).to.be.false;
      });
    });

    describe('when complementary certification has been started for another certification course', function () {
      it('returns false', async function () {
        // given
        databaseBuilder.factory.buildComplementaryCertification({
          id: 2,
          name: 'Pix+Droit',
        });
        databaseBuilder.factory.buildCertificationCourse({ id: 99 });
        databaseBuilder.factory.buildCertificationCourse({ id: 98 });
        databaseBuilder.factory.buildComplementaryCertificationCourse({
          certificationCourseId: 98,
          complementaryCertificationId: 2,
        });

        await databaseBuilder.commit();

        // when
        const hasPixPlusDroit = await complementaryCertificationCourseRepository.hasComplementaryCertification({
          certificationCourseId: 99,
          complementaryCertificationName: 'Pix+Droit',
        });

        // then
        expect(hasPixPlusDroit).to.be.false;
      });
    });
  });
});
