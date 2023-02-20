import { expect, databaseBuilder } from '../../../test-helper';
import complementaryCertificationCourseRepository from '../../../../lib/infrastructure/repositories/complementary-certification-course-repository';
import { PIX_PLUS_DROIT, PIX_PLUS_EDU_1ER_DEGRE } from '../../../../lib/domain/models/ComplementaryCertification';

describe('Integration | Repository | complementary-certification-courses-repository', function () {
  describe('#getComplementaryCertificationCourseId', function () {
    describe('when complementary certification has been started for the certification course', function () {
      it('returns the id', async function () {
        // given
        databaseBuilder.factory.buildComplementaryCertification({
          id: 1,
          label: 'Pix+ Edu 1er degré',
          key: PIX_PLUS_EDU_1ER_DEGRE,
        });
        databaseBuilder.factory.buildComplementaryCertification({
          id: 2,
          label: 'Pix+ Droit',
          key: PIX_PLUS_DROIT,
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
          complementaryCertificationKey: PIX_PLUS_DROIT,
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
          label: 'Pix+ Edu',
          key: PIX_PLUS_EDU_1ER_DEGRE,
        });
        databaseBuilder.factory.buildComplementaryCertification({
          id: 2,
          label: 'Pix+ Droit',
          key: PIX_PLUS_DROIT,
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
          complementaryCertificationKey: PIX_PLUS_DROIT,
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
          label: 'Pix+ Droit',
          key: PIX_PLUS_DROIT,
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
          complementaryCertificationKey: PIX_PLUS_DROIT,
        });

        // then
        expect(hasPixPlusDroit).to.be.undefined;
      });
    });
  });
});
