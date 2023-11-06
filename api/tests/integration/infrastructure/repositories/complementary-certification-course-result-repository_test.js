import { expect, databaseBuilder, domainBuilder } from '../../../test-helper.js';
import { knex } from '../../../../lib/infrastructure/bookshelf.js';
import _ from 'lodash';
import * as complementaryCertificationCourseResultRepository from '../../../../lib/infrastructure/repositories/complementary-certification-course-result-repository.js';
import { ComplementaryCertificationCourseResult } from '../../../../lib/domain/models/ComplementaryCertificationCourseResult.js';

describe('Integration | Repository | complementary-certification-courses-result-repository', function () {
  describe('#getPixSourceResultByComplementaryCertificationCourseId', function () {
    context(
      'when there is a Pix source ComplementaryCertificationCourseResult for the complementary certification course',
      function () {
        it('returns the ComplementaryCertificationCourseResult', async function () {
          // given
          databaseBuilder.factory.buildComplementaryCertification({
            id: 1,
            name: 'Pix+ Test',
          });
          databaseBuilder.factory.buildCertificationCourse({ id: 99 });
          databaseBuilder.factory.buildComplementaryCertificationCourse({
            id: 999,
            certificationCourseId: 99,
            complementaryCertificationId: 1,
          });
          databaseBuilder.factory.buildBadge({ id: 51, key: 'PIX_TEST_1' });
          databaseBuilder.factory.buildComplementaryCertificationBadge({
            id: 42,
            badgeId: 51,
            complementaryCertificationId: 1,
          });
          databaseBuilder.factory.buildComplementaryCertificationCourseResult({
            complementaryCertificationCourseId: 999,
            complementaryCertificationBadgeId: 42,
            partnerKey: 'PIX_TEST_1',
            source: ComplementaryCertificationCourseResult.sources.PIX,
            acquired: true,
          });
          await databaseBuilder.commit();

          // when
          const result =
            await complementaryCertificationCourseResultRepository.getPixSourceResultByComplementaryCertificationCourseId(
              {
                complementaryCertificationCourseId: 999,
              },
            );

          // then
          expect(result).to.deepEqualInstance(
            domainBuilder.buildComplementaryCertificationCourseResult({
              acquired: true,
              complementaryCertificationCourseId: 999,
              complementaryCertificationBadgeId: 42,
              partnerKey: 'PIX_TEST_1',
              source: ComplementaryCertificationCourseResult.sources.PIX,
            }),
          );
        });
      },
    );

    context(
      'when there is no Pix source ComplementaryCertificationCourseResult for the complementary certification course',
      function () {
        it('returns null', async function () {
          // given
          databaseBuilder.factory.buildComplementaryCertification({
            id: 1,
            name: 'Pix+ Test',
          });
          databaseBuilder.factory.buildCertificationCourse({ id: 99 });
          databaseBuilder.factory.buildComplementaryCertificationCourse({
            id: 999,
            certificationCourseId: 99,
            complementaryCertificationId: 1,
          });
          databaseBuilder.factory.buildBadge({ key: 'PIX_TEST_1' });
          databaseBuilder.factory.buildComplementaryCertificationCourseResult({
            complementaryCertificationCourseId: 999,
            partnerKey: 'PIX_TEST_1',
            source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
            acquired: true,
          });
          await databaseBuilder.commit();
          // when
          const result =
            await complementaryCertificationCourseResultRepository.getPixSourceResultByComplementaryCertificationCourseId(
              {
                complementaryCertificationCourseId: 99,
              },
            );

          // then
          expect(result).to.be.null;
        });
      },
    );
  });

  describe('#getAllowedJuryLevelByBadgeKey', function () {
    it('should return the allowed jury level for a partner key', async function () {
      // given
      databaseBuilder.factory.buildTargetProfile({ id: 123 });
      databaseBuilder.factory.buildBadge({ id: 1212, key: 'KEY_1', targetProfileId: 123 });

      databaseBuilder.factory.buildTargetProfile({ id: 456 });
      databaseBuilder.factory.buildBadge({ id: 1213, key: 'KEY_2', targetProfileId: 456 });
      databaseBuilder.factory.buildBadge({ id: 1214, key: 'KEY_3', targetProfileId: 456 });

      await databaseBuilder.commit();

      // when
      const allowedBadgeKeys = await complementaryCertificationCourseResultRepository.getAllowedJuryLevelByBadgeKey({
        key: 'KEY_2',
      });

      // then
      expect(allowedBadgeKeys).to.deep.equal(['KEY_2', 'KEY_3']);
    });
  });

  describe('#save', function () {
    afterEach(function () {
      return knex('complementary-certification-course-results').delete();
    });

    describe('when the ComplementaryCertificationCourseResult does not exist', function () {
      it('saves the ComplementaryCertificationCourseResult', async function () {
        // given
        databaseBuilder.factory.buildComplementaryCertification({
          id: 1,
          name: 'Pix+ Test',
        });
        databaseBuilder.factory.buildCertificationCourse({ id: 99 });
        databaseBuilder.factory.buildComplementaryCertificationCourse({
          id: 999,
          certificationCourseId: 99,
          complementaryCertificationId: 1,
        });

        databaseBuilder.factory.buildBadge({
          id: 10,
          key: 'PIX_TEST_1',
        });
        databaseBuilder.factory.buildComplementaryCertificationBadge({
          id: 60,
          badgeId: 10,
          complementaryCertificationId: 1,
        });

        await databaseBuilder.commit();

        const complementaryCertificationCourseResult = domainBuilder.buildComplementaryCertificationCourseResult({
          acquired: true,
          complementaryCertificationCourseId: 999,
          complementaryCertificationBadgeId: 60,
          partnerKey: 'PIX_TEST_1',
          source: ComplementaryCertificationCourseResult.sources.PIX,
        });

        // when
        await complementaryCertificationCourseResultRepository.save(complementaryCertificationCourseResult);

        // then
        const savedComplementaryCertificationCourseResult = await knex(
          'complementary-certification-course-results',
        ).first();

        expect(_.omit(savedComplementaryCertificationCourseResult, 'id')).to.deep.equal({
          acquired: true,
          complementaryCertificationCourseId: 999,
          complementaryCertificationBadgeId: 60,
          partnerKey: 'PIX_TEST_1',
          source: ComplementaryCertificationCourseResult.sources.PIX,
        });
      });
    });

    describe('when the ComplementaryCertificationCourseResult already exists', function () {
      it('updates the ComplementaryCertificationCourseResult', async function () {
        // given
        databaseBuilder.factory.buildComplementaryCertification({
          id: 1,
          name: 'Pix+ Test',
        });
        databaseBuilder.factory.buildCertificationCourse({ id: 99 });
        databaseBuilder.factory.buildComplementaryCertificationCourse({
          id: 999,
          certificationCourseId: 99,
          complementaryCertificationId: 1,
        });

        databaseBuilder.factory.buildBadge({ id: 10, key: 'PIX_TEST_1' });
        databaseBuilder.factory.buildBadge({ id: 11, key: 'PIX_TEST_2' });
        databaseBuilder.factory.buildComplementaryCertificationBadge({
          id: 60,
          badgeId: 10,
          complementaryCertificationId: 1,
        });
        databaseBuilder.factory.buildComplementaryCertificationBadge({
          id: 61,
          badgeId: 11,
          complementaryCertificationId: 1,
        });

        databaseBuilder.factory.buildComplementaryCertificationCourseResult({
          acquired: true,
          complementaryCertificationCourseId: 999,
          complementaryCertificationBadgeId: 61,
          partnerKey: 'PIX_TEST_1',
          source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
        });

        await databaseBuilder.commit();

        const complementaryCertificationCourseResult = domainBuilder.buildComplementaryCertificationCourseResult({
          acquired: true,
          complementaryCertificationCourseId: 999,
          complementaryCertificationBadgeId: 61,
          partnerKey: 'PIX_TEST_2',
          source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
        });

        // when
        await complementaryCertificationCourseResultRepository.save(complementaryCertificationCourseResult);

        // then
        const results = await knex('complementary-certification-course-results').where({
          acquired: true,
          complementaryCertificationCourseId: 999,
          source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
        });

        expect(results).to.have.lengthOf(1);
        expect(_.omit(results[0], 'id')).to.deep.equal({
          acquired: true,
          complementaryCertificationCourseId: 999,
          complementaryCertificationBadgeId: 61,
          partnerKey: 'PIX_TEST_2',
          source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
        });
      });
    });
  });

  describe('#removeExternalJuryResult', function () {
    describe('when the matching external ComplementaryCertificationCourseResult does not exist', function () {
      it('should do nothing', async function () {
        // given
        databaseBuilder.factory.buildComplementaryCertification({
          id: 1,
          name: 'Pix+ Test',
        });
        databaseBuilder.factory.buildCertificationCourse({ id: 99 });
        databaseBuilder.factory.buildComplementaryCertificationCourse({
          id: 999,
          certificationCourseId: 99,
          complementaryCertificationId: 1,
        });

        databaseBuilder.factory.buildBadge({
          key: 'PIX_TEST_1',
        });
        databaseBuilder.factory.buildBadge({
          key: 'PIX_EDU_1',
        });

        databaseBuilder.factory.buildComplementaryCertificationCourseResult({
          id: 10,
          acquired: true,
          complementaryCertificationCourseId: 999,
          partnerKey: 'PIX_TEST_1',
          source: ComplementaryCertificationCourseResult.sources.PIX,
        });

        await databaseBuilder.commit();

        // when
        await complementaryCertificationCourseResultRepository.removeExternalJuryResult({
          complementaryCertificationCourseId: 999,
        });

        // then
        const courseResults = await knex('complementary-certification-course-results');

        expect(courseResults).to.deep.equal([
          {
            id: 10,
            acquired: true,
            complementaryCertificationCourseId: 999,
            partnerKey: 'PIX_TEST_1',
            source: ComplementaryCertificationCourseResult.sources.PIX,
          },
        ]);
      });
    });

    describe('when the matching external ComplementaryCertificationCourseResult exists', function () {
      it('should delete the ComplementaryCertificationCourseResult', async function () {
        // given
        databaseBuilder.factory.buildComplementaryCertification({
          id: 1,
          name: 'Pix+ Test',
        });
        databaseBuilder.factory.buildCertificationCourse({ id: 99 });
        databaseBuilder.factory.buildComplementaryCertificationCourse({
          id: 999,
          certificationCourseId: 99,
          complementaryCertificationId: 1,
        });

        databaseBuilder.factory.buildBadge({
          key: 'PIX_TEST_1',
        });
        databaseBuilder.factory.buildBadge({
          key: 'PIX_EDU_1',
        });

        databaseBuilder.factory.buildComplementaryCertificationCourseResult({
          id: 10,
          acquired: true,
          complementaryCertificationCourseId: 999,
          partnerKey: 'PIX_TEST_1',
          source: ComplementaryCertificationCourseResult.sources.PIX,
        });

        databaseBuilder.factory.buildComplementaryCertificationCourseResult({
          acquired: true,
          complementaryCertificationCourseId: 999,
          partnerKey: 'PIX_EDU_1',
          source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
        });

        await databaseBuilder.commit();

        // when
        await complementaryCertificationCourseResultRepository.removeExternalJuryResult({
          complementaryCertificationCourseId: 999,
        });

        // then
        const courseResult = await knex('complementary-certification-course-results').where({
          complementaryCertificationCourseId: 999,
        });

        expect(courseResult).to.have.lengthOf(1);
        expect(courseResult[0]).to.deep.equal({
          id: 10,
          acquired: true,
          complementaryCertificationCourseId: 999,
          partnerKey: 'PIX_TEST_1',
          source: ComplementaryCertificationCourseResult.sources.PIX,
        });
      });
    });
  });
});
