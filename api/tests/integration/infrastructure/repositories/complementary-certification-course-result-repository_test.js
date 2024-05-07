import _ from 'lodash';

import { ComplementaryCertificationCourseResult } from '../../../../lib/domain/models/ComplementaryCertificationCourseResult.js';
import { knex } from '../../../../lib/infrastructure/bookshelf.js';
import * as complementaryCertificationCourseResultRepository from '../../../../lib/infrastructure/repositories/complementary-certification-course-result-repository.js';
import { databaseBuilder, domainBuilder, expect } from '../../../test-helper.js';

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
            key: 'A',
          });
          databaseBuilder.factory.buildCertificationCourse({ id: 99 });
          databaseBuilder.factory.buildBadge({ id: 1, key: 'PIX_TEST_1' });
          databaseBuilder.factory.buildComplementaryCertificationBadge({
            id: 99,
            badgeId: 1,
            complementaryCertificationId: 1,
          });
          databaseBuilder.factory.buildComplementaryCertificationCourse({
            id: 999,
            certificationCourseId: 99,
            complementaryCertificationId: 1,
            complementaryCertificationBadgeId: 99,
          });
          databaseBuilder.factory.buildComplementaryCertificationCourseResult({
            complementaryCertificationCourseId: 999,
            complementaryCertificationBadgeId: 99,
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

  describe('#getAllowedJuryLevelIdsByComplementaryCertificationBadgeId', function () {
    context('when there is one target profile for a complementary certification', function () {
      it('should return the allowed jury level for that complementary certification', async function () {
        // given
        databaseBuilder.factory.buildTargetProfile({ id: 123 });
        databaseBuilder.factory.buildComplementaryCertification({ id: 1, key: 'A' });
        databaseBuilder.factory.buildBadge({
          id: 1212,
          targetProfileId: 123,
        });
        databaseBuilder.factory.buildComplementaryCertificationBadge({
          id: 97,
          badgeId: 1212,
          complementaryCertificationId: 1,
        });

        databaseBuilder.factory.buildTargetProfile({ id: 456 });
        databaseBuilder.factory.buildComplementaryCertification({ id: 2, key: 'B' });
        databaseBuilder.factory.buildBadge({ id: 1213, targetProfileId: 456 });
        databaseBuilder.factory.buildComplementaryCertificationBadge({
          id: 98,
          badgeId: 1213,
          complementaryCertificationId: 2,
        });

        await databaseBuilder.commit();

        // when
        const allowedBadgeKeys =
          await complementaryCertificationCourseResultRepository.getAllowedJuryLevelIdsByComplementaryCertificationBadgeId(
            97,
          );

        // then
        expect(allowedBadgeKeys).to.deep.equal([97]);
      });
    });

    context('when there are two target profiles for a complementary certification', function () {
      it('should return the allowed jury level for that target profile', async function () {
        // given
        databaseBuilder.factory.buildTargetProfile({ id: 123 });
        databaseBuilder.factory.buildComplementaryCertification({ id: 1 });
        databaseBuilder.factory.buildBadge({
          id: 1212,
          key: 'KEY_1',
          targetProfileId: 123,
        });
        databaseBuilder.factory.buildComplementaryCertificationBadge({
          id: 97,
          badgeId: 1212,
          complementaryCertificationId: 1,
        });

        databaseBuilder.factory.buildTargetProfile({ id: 456 });
        databaseBuilder.factory.buildBadge({ id: 1213, key: 'KEY_2', targetProfileId: 456 });
        databaseBuilder.factory.buildComplementaryCertificationBadge({
          id: 98,
          badgeId: 1213,
          complementaryCertificationId: 1,
        });
        databaseBuilder.factory.buildBadge({ id: 1214, key: 'KEY_3', targetProfileId: 456 });
        databaseBuilder.factory.buildComplementaryCertificationBadge({
          id: 99,
          badgeId: 1214,
          complementaryCertificationId: 1,
        });

        await databaseBuilder.commit();

        // when
        const allowedBadgeKeys =
          await complementaryCertificationCourseResultRepository.getAllowedJuryLevelIdsByComplementaryCertificationBadgeId(
            98,
          );

        // then
        expect(allowedBadgeKeys).to.deep.equal([98, 99]);
      });
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
          source: ComplementaryCertificationCourseResult.sources.PIX,
        });

        // when
        await complementaryCertificationCourseResultRepository.save(complementaryCertificationCourseResult);

        // then
        const savedComplementaryCertificationCourseResult = await knex('complementary-certification-course-results')
          .select('id', 'acquired', 'complementaryCertificationBadgeId', 'complementaryCertificationCourseId', 'source')
          .first();

        expect(_.omit(savedComplementaryCertificationCourseResult, 'id')).to.deep.equal({
          acquired: true,
          complementaryCertificationCourseId: 999,
          complementaryCertificationBadgeId: 60,
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
          source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
        });

        await databaseBuilder.commit();

        const complementaryCertificationCourseResult = domainBuilder.buildComplementaryCertificationCourseResult({
          acquired: true,
          complementaryCertificationCourseId: 999,
          complementaryCertificationBadgeId: 61,
          source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
        });

        // when
        await complementaryCertificationCourseResultRepository.save(complementaryCertificationCourseResult);

        // then
        const results = await knex('complementary-certification-course-results')
          .select('id', 'acquired', 'complementaryCertificationBadgeId', 'complementaryCertificationCourseId', 'source')
          .where({
            acquired: true,
            complementaryCertificationCourseId: 999,
            source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
          });

        expect(results).to.have.lengthOf(1);
        expect(_.omit(results[0], 'id')).to.deep.equal({
          acquired: true,
          complementaryCertificationCourseId: 999,
          complementaryCertificationBadgeId: 61,
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
          id: 11,
          key: 'PIX_TEST_1',
        });

        databaseBuilder.factory.buildComplementaryCertificationBadge({
          id: 301,
          complementaryCertificationId: 1,
          badgeId: 11,
        });

        databaseBuilder.factory.buildComplementaryCertificationCourseResult({
          id: 10,
          acquired: true,
          complementaryCertificationBadgeId: 301,
          complementaryCertificationCourseId: 999,
          source: ComplementaryCertificationCourseResult.sources.PIX,
        });

        await databaseBuilder.commit();

        // when
        await complementaryCertificationCourseResultRepository.removeExternalJuryResult({
          complementaryCertificationCourseId: 999,
        });

        // then
        const courseResults = await knex('complementary-certification-course-results').select(
          'id',
          'acquired',
          'complementaryCertificationBadgeId',
          'complementaryCertificationCourseId',
          'source',
        );

        expect(courseResults).to.deep.equal([
          {
            id: 10,
            acquired: true,
            complementaryCertificationBadgeId: 301,
            complementaryCertificationCourseId: 999,
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
          id: 11,
          key: 'PIX_TEST_1',
        });
        databaseBuilder.factory.buildBadge({
          id: 12,
          key: 'PIX_EDU_1',
        });
        databaseBuilder.factory.buildComplementaryCertificationBadge({
          id: 301,
          complementaryCertificationId: 1,
          badgeId: 12,
        });
        databaseBuilder.factory.buildComplementaryCertificationBadge({
          id: 302,
          complementaryCertificationId: 1,
          badgeId: 12,
        });

        const pixResult = databaseBuilder.factory.buildComplementaryCertificationCourseResult({
          id: 10,
          acquired: true,
          complementaryCertificationBadgeId: 301,
          complementaryCertificationCourseId: 999,
          source: ComplementaryCertificationCourseResult.sources.PIX,
        });

        databaseBuilder.factory.buildComplementaryCertificationCourseResult({
          acquired: true,
          complementaryCertificationBadgeId: 302,
          complementaryCertificationCourseId: 999,
          source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
        });

        await databaseBuilder.commit();

        // when
        await complementaryCertificationCourseResultRepository.removeExternalJuryResult({
          complementaryCertificationCourseId: 999,
        });

        // then
        const courseResult = await knex('complementary-certification-course-results')
          .select('id', 'acquired', 'complementaryCertificationBadgeId', 'complementaryCertificationCourseId', 'source')
          .where({
            complementaryCertificationCourseId: 999,
          });

        expect(courseResult).to.have.lengthOf(1);
        expect(courseResult[0]).to.deep.equal(pixResult);
      });
    });
  });
});
