const { expect, knex, domainBuilder, databaseBuilder } = require('../../../test-helper');
const _ = require('lodash');

const CompetenceMark = require('../../../../lib/domain/models/CompetenceMark');
const competenceMarkRepository = require('../../../../lib/infrastructure/repositories/competence-mark-repository');

describe('Integration | Repository | CompetenceMark', () => {

  describe('#save', () => {
    let competenceMark;
    beforeEach(async () => {
      // given
      competenceMark = domainBuilder.buildCompetenceMark({
        score: 13,
        level: 1,
        area_code: '4',
        competence_code: '4.2',
      });
    });

    afterEach(async () => {
      await knex('competence-marks').delete();
    });

    it('should persist the mark in db', () => {
      // when
      const promise = competenceMarkRepository.save(competenceMark);

      // then
      return promise.then(() => knex('competence-marks').select())
        .then((marks) => {
          expect(marks).to.have.lengthOf(1);
        });
    });

    it('should return the saved mark', () => {
      // given
      const mark = domainBuilder.buildCompetenceMark({
        score: 13,
        level: 1,
        area_code: '4',
        competence_code: '4.2',
      });

      // when
      const promise = competenceMarkRepository.save(mark);

      // then
      return promise.then((mark) => {
        expect(mark).to.be.an.instanceOf(CompetenceMark);

        expect(mark).to.have.property('id').and.not.to.be.null;
      });
    });

    context('when competenceMark is not validated', () => {
      it('should return an error', () => {
        // given
        const expectedValidationErrorMessage = 'ValidationError: "level" must be less than or equal to 8';
        const markWithLevelGreaterThanEight = domainBuilder.buildCompetenceMark({
          score: 13,
          level: 10,
        });

        // when
        const promise = competenceMarkRepository.save(markWithLevelGreaterThanEight);

        // then
        return promise.catch((error) => {
          expect(error.message).to.be.equal(expectedValidationErrorMessage);
        });
      });

      it('should not saved the competenceMark', () => {
        // given
        const markWithLevelGreaterThanEight = domainBuilder.buildCompetenceMark({
          score: 13,
          level: 10,
        });

        // when
        const promise = competenceMarkRepository.save(markWithLevelGreaterThanEight);

        // then
        return promise.catch(() => knex('competence-marks').select())
          .then((marks) => {
            expect(marks).to.have.lengthOf(0);
          });
      });
    });
  });

  describe('#findByAssessmentResultId', () => {

    let assessmentResultId, competenceMarkIds;
    beforeEach(async () => {
      assessmentResultId = databaseBuilder.factory.buildAssessmentResult({}).id;
      const anotherAssessmentResultId = databaseBuilder.factory.buildAssessmentResult({}).id;
      competenceMarkIds = _.map([
        { score: 13, level: 2, area_code: '4', competence_code: '4.2', assessmentResultId },
        { score: 10, level: 1, area_code: '3', competence_code: '3.1', assessmentResultId: anotherAssessmentResultId },
        { score: 24, level: 3, area_code: '3', competence_code: '3.1', assessmentResultId },
      ], (mark) => {
        return databaseBuilder.factory.buildCompetenceMark(mark).id;
      });

      await databaseBuilder.commit();
    });

    it('should return all competence-marks for one assessmentResult', () => {
      // when
      const promise = competenceMarkRepository.findByAssessmentResultId(assessmentResultId);

      // then
      return promise.then((competenceMarks) => {
        const sortedCompetenceMarks = _.sortBy(competenceMarks, [(mark) => { return mark.id; }]);
        expect(sortedCompetenceMarks[0].id).to.equal(competenceMarkIds[0]);
        expect(sortedCompetenceMarks[1].id).to.equal(competenceMarkIds[2]);
        expect(sortedCompetenceMarks.length).to.equal(2);
      });
    });
  });

  describe('#getLatestByCertificationCourseId', () => {

    let certificationCourseId;
    let competenceMarks1;
    let competenceMarks2;

    beforeEach(async () => {
      const juryId = databaseBuilder.factory.buildUser().id;
      certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
      const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId }).id;
      const assessmentResultId = databaseBuilder.factory.buildAssessmentResult({ juryId, assessmentId, createdAt: new Date('2019-02-01T00:00:00Z') }).id;
      databaseBuilder.factory.buildAssessmentResult({ juryId, assessmentId, createdAt: new Date('2019-01-01T00:00:00Z') });
      competenceMarks1 = databaseBuilder.factory.buildCompetenceMark({ id: 1, assessmentResultId });
      competenceMarks2 = databaseBuilder.factory.buildCompetenceMark({ id: 2, assessmentResultId });

      await databaseBuilder.commit();
    });

    it('should return the most recent competenceMarks', async () => {
      // when
      const mostRecentCompetenceMarks = await competenceMarkRepository.getLatestByCertificationCourseId({ certificationCourseId });

      // then
      const sortedCompetenceMarks = _.sortBy(mostRecentCompetenceMarks, 'id');
      expect(sortedCompetenceMarks[0].score).to.be.deep.equal(competenceMarks1.score);
      expect(sortedCompetenceMarks[0].level).to.be.deep.equal(competenceMarks1.level);
      expect(sortedCompetenceMarks[0].area_code).to.be.deep.equal(competenceMarks1.area_code);
      expect(sortedCompetenceMarks[0].competence_code).to.be.deep.equal(competenceMarks1.competence_code);

      expect(sortedCompetenceMarks[1].score).to.be.deep.equal(competenceMarks2.score);
      expect(sortedCompetenceMarks[1].level).to.be.deep.equal(competenceMarks2.level);
      expect(sortedCompetenceMarks[1].area_code).to.be.deep.equal(competenceMarks2.area_code);
      expect(sortedCompetenceMarks[1].competence_code).to.be.deep.equal(competenceMarks2.competence_code);
    });
  });
});
