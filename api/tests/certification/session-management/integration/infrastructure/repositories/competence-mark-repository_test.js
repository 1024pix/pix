import _ from 'lodash';

import * as competenceMarkRepository from '../../../../../../src/certification/session-management/infrastructure/repositories/competence-mark-repository.js';
import { CompetenceMark } from '../../../../../../src/certification/shared/domain/models/CompetenceMark.js';
import { databaseBuilder, domainBuilder, expect } from '../../../../../test-helper.js';

describe('Certification | Session-management | Integration | Infrastructure | Repositories | competence-mark-repository', function () {
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
