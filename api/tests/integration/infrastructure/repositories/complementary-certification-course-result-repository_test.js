import _ from 'lodash';

import * as complementaryCertificationCourseResultRepository from '../../../../lib/infrastructure/repositories/complementary-certification-course-result-repository.js';
import { ComplementaryCertificationCourseResult } from '../../../../src/certification/shared/domain/models/ComplementaryCertificationCourseResult.js';
import { knex } from '../../../../src/shared/infrastructure/bookshelf.js';
import { databaseBuilder, domainBuilder, expect } from '../../../test-helper.js';

describe('Integration | Repository | complementary-certification-courses-result-repository', function () {
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
});
