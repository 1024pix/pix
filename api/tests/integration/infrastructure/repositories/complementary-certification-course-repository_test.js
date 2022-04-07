const { expect, databaseBuilder } = require('../../../test-helper');
const complementaryCertificationCourseRepository = require('../../../../lib/infrastructure/repositories/complementary-certification-course-repository');

describe('Integration | Repository | complementary-certification-courses-repository', function () {
  describe('#getComplementaryCertificationCourseId', function () {
    describe('when complementary certification has been started for the certification course', function () {
      it('returns the id', async function () {
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
          id: 999,
          certificationCourseId: 99,
          complementaryCertificationId: 2,
        });

        await databaseBuilder.commit();

        // when
        const hasPixPlusDroit = await complementaryCertificationCourseRepository.getComplementaryCertificationCourseId({
          certificationCourseId: 99,
          complementaryCertificationName: 'Pix+Droit',
        });

        // then
        expect(hasPixPlusDroit).to.equal(999);
      });
    });

    describe('when another complementary certification has been started for the certification course', function () {
      it('returns undefined', async function () {
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
        const hasPixPlusDroit = await complementaryCertificationCourseRepository.getComplementaryCertificationCourseId({
          certificationCourseId: 99,
          complementaryCertificationName: 'Pix+Droit',
        });

        // then
        expect(hasPixPlusDroit).to.be.undefined;
      });
    });

    describe('when complementary certification has been started for another certification course', function () {
      it('returns undefined', async function () {
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
        const hasPixPlusDroit = await complementaryCertificationCourseRepository.getComplementaryCertificationCourseId({
          certificationCourseId: 99,
          complementaryCertificationName: 'Pix+Droit',
        });

        // then
        expect(hasPixPlusDroit).to.be.undefined;
      });
    });
  });
});
