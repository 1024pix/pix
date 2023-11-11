import { databaseBuilder, domainBuilder, expect, knex } from '../../../test-helper.js';
import _ from 'lodash';

import { CompetenceMark } from '../../../../lib/domain/models/CompetenceMark.js';
import * as competenceMarkRepository from '../../../../lib/infrastructure/repositories/competence-mark-repository.js';

describe('Integration | Repository | CompetenceMark', function () {
  describe('#save', function () {
    let assessmentResultId;
    let competenceMark;
    beforeEach(async function () {
      assessmentResultId = await databaseBuilder.factory.buildAssessmentResult().id;
      await databaseBuilder.commit();

      competenceMark = domainBuilder.buildCompetenceMark({
        score: 13,
        level: 1,
        area_code: '4',
        competence_code: '4.2',
        assessmentResultId,
      });
    });

    it('should persist the mark in db', async function () {
      // when
      await competenceMarkRepository.save(competenceMark);

      // then
      const marks = await knex('competence-marks').select();
      expect(marks).to.have.lengthOf(1);
    });

    it('should return the saved mark', async function () {
      // given
      const mark = domainBuilder.buildCompetenceMark({
        score: 13,
        level: 1,
        area_code: '4',
        competence_code: '4.2',
        assessmentResultId,
      });

      // when
      const savedMark = await competenceMarkRepository.save(mark);

      // then
      expect(savedMark).to.be.an.instanceOf(CompetenceMark);
      expect(savedMark).to.have.property('id').and.not.to.be.null;
    });
  });

  describe('#findByCertificationCourseId', function () {
    it('should return an empty array when there are no competence-marks for a certificationCourseId', async function () {
      // given
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
      const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId }).id;
      databaseBuilder.factory.buildAssessmentResult({ assessmentId });
      databaseBuilder.factory.buildCompetenceMark();
      await databaseBuilder.commit();

      // when
      const competenceMarks = await competenceMarkRepository.findByCertificationCourseId(certificationCourseId);

      // then
      expect(competenceMarks).to.be.empty;
    });

    it('should return all competence-marks for a certificationCourseId', async function () {
      // given
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
      const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId }).id;
      const assessmentResultId = databaseBuilder.factory.buildAssessmentResult({ assessmentId }).id;
      const anotherAssessmentResultId = databaseBuilder.factory.buildAssessmentResult().id;
      _.map(
        [
          {
            id: 1,
            score: 13,
            level: 2,
            area_code: '4',
            competence_code: '4.2',
            competenceId: 'recABC',
            assessmentResultId,
          },
          {
            id: 2,
            score: 10,
            level: 1,
            area_code: '3',
            competence_code: '3.1',
            competenceId: 'recDEF',
            assessmentResultId: anotherAssessmentResultId,
          },
          {
            id: 3,
            score: 24,
            level: 3,
            area_code: '3',
            competence_code: '3.1',
            competenceId: 'recGHI',
            assessmentResultId,
          },
        ],
        (mark) => {
          return databaseBuilder.factory.buildCompetenceMark(mark).id;
        },
      );
      const expectedCompetenceMarks = [
        domainBuilder.buildCompetenceMark({
          id: 1,
          score: 13,
          level: 2,
          area_code: '4',
          competence_code: '4.2',
          competenceId: 'recABC',
          assessmentResultId,
        }),
        domainBuilder.buildCompetenceMark({
          id: 3,
          score: 24,
          level: 3,
          area_code: '3',
          competence_code: '3.1',
          competenceId: 'recGHI',
          assessmentResultId,
        }),
      ];
      await databaseBuilder.commit();

      // when
      const competenceMarks = await competenceMarkRepository.findByCertificationCourseId(certificationCourseId);

      // then
      expect(competenceMarks[0]).to.be.instanceOf(CompetenceMark);
      expect(competenceMarks).to.deep.equal(expectedCompetenceMarks);
    });

    it('should only take into account competence-marks of the latest assessment-results if there are more than one', async function () {
      // given
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({}).id;
      const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId }).id;
      const olderAssessmentResultId = databaseBuilder.factory.buildAssessmentResult({
        assessmentId,
        createdAt: new Date('2020-01-01'),
      }).id;
      const latestAssessmentResult = databaseBuilder.factory.buildAssessmentResult({
        assessmentId,
        createdAt: new Date('2021-01-01'),
      }).id;
      _.map(
        [
          {
            id: 1,
            score: 13,
            level: 2,
            area_code: '4',
            competence_code: '4.2',
            competenceId: 'recXYZ',
            assessmentResultId: olderAssessmentResultId,
          },
        ],
        (mark) => {
          return databaseBuilder.factory.buildCompetenceMark(mark).id;
        },
      );
      const expectedCompetenceMarks = _.map(
        [
          {
            id: 4,
            score: 13,
            level: 2,
            area_code: '4',
            competence_code: '4.2',
            competenceId: 'recABC',
            assessmentResultId: latestAssessmentResult,
          },
          {
            id: 5,
            score: 10,
            level: 1,
            area_code: '3',
            competence_code: '3.1',
            competenceId: 'recDEF',
            assessmentResultId: latestAssessmentResult,
          },
          {
            id: 6,
            score: 24,
            level: 3,
            area_code: '3',
            competence_code: '3.1',
            competenceId: 'recGHI',
            assessmentResultId: latestAssessmentResult,
          },
        ],
        (mark) => {
          databaseBuilder.factory.buildCompetenceMark(mark);
          return domainBuilder.buildCompetenceMark(mark);
        },
      );
      await databaseBuilder.commit();

      // when
      const competenceMarks = await competenceMarkRepository.findByCertificationCourseId(certificationCourseId);

      // then
      expect(competenceMarks).to.deep.equal(expectedCompetenceMarks);
    });
  });
});
