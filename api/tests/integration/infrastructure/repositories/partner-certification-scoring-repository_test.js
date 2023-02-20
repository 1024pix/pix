import { expect, databaseBuilder, domainBuilder, knex, sinon } from '../../../test-helper';
import omit from 'lodash/omit';
import partnerCertificationScoringRepository from '../../../../lib/infrastructure/repositories/partner-certification-scoring-repository';
import ComplementaryCertificationCourseResult from '../../../../lib/domain/models/ComplementaryCertificationCourseResult';

describe('Integration | Repository | Partner Certification Scoring', function () {
  const COMPLEMENTARY_CERTIFICATION_COURSE_RESULTS_TABLE_NAME = 'complementary-certification-course-results';
  const COMPLEMENTARY_CERTIFICATION_COURSES_TABLE_NAME = 'complementary-certification-courses';

  describe('#save', function () {
    afterEach(async function () {
      await knex(COMPLEMENTARY_CERTIFICATION_COURSE_RESULTS_TABLE_NAME).delete();
      await knex(COMPLEMENTARY_CERTIFICATION_COURSES_TABLE_NAME).delete();
      await knex('certification-courses').delete();
      await knex('complementary-certification-badges').delete();
      await knex('badges').delete();
    });

    it('should insert the complementary certification course results in db if it does not already exists by partnerKey', async function () {
      // given
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
      const badgeId = databaseBuilder.factory.buildBadge({ key: 'PIX+_TEST' }).id;
      const complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification().id;
      const complementaryCertificationBadgeId = databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 123,
        complementaryCertificationId,
        badgeId,
      }).id;
      const complementaryCertificationCourseId = databaseBuilder.factory.buildComplementaryCertificationCourse({
        certificationCourseId,
        complementaryCertificationId,
        complementaryCertificationBadgeId,
      }).id;
      const partnerCertificationScoring =
        domainBuilder.buildComplementaryCertificationScoringWithComplementaryReferential({
          complementaryCertificationCourseId,
          complementaryCertificationBadgeKey: 'PIX+_TEST',
        });
      await databaseBuilder.commit();
      sinon.stub(partnerCertificationScoring, 'isAcquired').returns(true);

      // when
      await partnerCertificationScoringRepository.save({ partnerCertificationScoring });

      // then
      const complementaryCertificationCourseResultSaved = await knex(
        COMPLEMENTARY_CERTIFICATION_COURSE_RESULTS_TABLE_NAME
      ).select();
      expect(complementaryCertificationCourseResultSaved).to.have.length(1);
      const complementaryCertificationCourseResultSavedWithoutId = omit(
        complementaryCertificationCourseResultSaved[0],
        'id'
      );
      expect(complementaryCertificationCourseResultSavedWithoutId).to.deep.equal({
        complementaryCertificationCourseId,
        partnerKey: partnerCertificationScoring.partnerKey,
        acquired: true,
        source: ComplementaryCertificationCourseResult.sources.PIX,
      });
    });

    it('should update the existing complementary certification course results if it exists', async function () {
      // given
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
      const complementaryCertificationCourseId = databaseBuilder.factory.buildComplementaryCertificationCourse({
        id: 998,
        certificationCourseId,
      }).id;
      const partnerCertificationScoring =
        domainBuilder.buildComplementaryCertificationScoringWithoutComplementaryReferential({
          complementaryCertificationCourseId,
          certificationCourseId,
        });
      databaseBuilder.factory.buildBadge({ key: partnerCertificationScoring.partnerKey });

      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId,
        partnerKey: partnerCertificationScoring.partnerKey,
        source: ComplementaryCertificationCourseResult.sources.PIX,
      });
      await databaseBuilder.commit();
      sinon.stub(partnerCertificationScoring, 'isAcquired').returns(false);

      // when
      await partnerCertificationScoringRepository.save({ partnerCertificationScoring });

      // then
      const complementaryCertificationCourseResultSaved = await knex(
        COMPLEMENTARY_CERTIFICATION_COURSE_RESULTS_TABLE_NAME
      )
        .select()
        .first();

      const complementaryCertificationCourseResultSavedWithoutId = omit(
        complementaryCertificationCourseResultSaved,
        'id'
      );
      expect(complementaryCertificationCourseResultSavedWithoutId).to.deep.equal({
        complementaryCertificationCourseId,
        partnerKey: partnerCertificationScoring.partnerKey,
        acquired: false,
        source: ComplementaryCertificationCourseResult.sources.PIX,
      });
    });

    context('when there is multiple source results', function () {
      it('should update the PIX source complementary certification course result', async function () {
        // given
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
        const complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification().id;
        const badge = databaseBuilder.factory.buildBadge();
        const complementaryCertificationBadgeId = databaseBuilder.factory.buildComplementaryCertificationBadge({
          complementaryCertificationId,
          badgeId: badge.id,
        }).id;
        const complementaryCertificationCourseId = databaseBuilder.factory.buildComplementaryCertificationCourse({
          certificationCourseId,
          complementaryCertificationId,
          complementaryCertificationBadgeId,
        }).id;

        databaseBuilder.factory.buildComplementaryCertificationCourseResult({
          complementaryCertificationCourseId,
          partnerKey: badge.key,
          source: ComplementaryCertificationCourseResult.sources.PIX,
          acquired: true,
        });
        databaseBuilder.factory.buildComplementaryCertificationCourseResult({
          complementaryCertificationCourseId,
          partnerKey: badge.key,
          source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
          acquired: false,
        });
        await databaseBuilder.commit();

        const partnerCertificationScoring =
          domainBuilder.buildComplementaryCertificationScoringWithComplementaryReferential({
            complementaryCertificationCourseId,
            complementaryCertificationBadgeKey: badge.key,
            hasAcquiredPixCertification: false,
          });

        // when
        await partnerCertificationScoringRepository.save({ partnerCertificationScoring });

        // then
        const sourcePixComplementaryCertificationCourseResult = await knex('complementary-certification-course-results')
          .where({
            complementaryCertificationCourseId,
            source: ComplementaryCertificationCourseResult.sources.PIX,
          })
          .first();
        expect(sourcePixComplementaryCertificationCourseResult.acquired).to.be.false;
      });
    });
  });
});
