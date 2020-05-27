const { expect, knex, databaseBuilder, domainBuilder } = require('../../../test-helper');

const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const assessmentResultRepository = require('../../../../lib/infrastructure/repositories/assessment-result-repository');

const _ = require('lodash');

describe('Integration | Repository | AssessmentResult', function() {

  describe('#save', () => {
    let assessmentResultToSave;
    let assessmentResult;

    afterEach(() => {
      return knex('assessment-results').where('id', assessmentResult.id).delete();
    });

    beforeEach(async () => {
      const juryId = databaseBuilder.factory.buildUser().id;
      const assessmentId = databaseBuilder.factory.buildAssessment().id;
      assessmentResultToSave = domainBuilder.buildAssessmentResult({ juryId, assessmentId });
      assessmentResultToSave.id = undefined;
      await databaseBuilder.commit();
    });

    it('should persist the assessment result in db', async () => {
      // when
      assessmentResult = await assessmentResultRepository.save(assessmentResultToSave);

      // then
      const result = await knex('assessment-results').where('id', assessmentResult.id);

      expect(result).to.have.lengthOf(1);
    });

    it('should return the saved assessment result', async () => {
      // when
      assessmentResult = await assessmentResultRepository.save(assessmentResultToSave);

      // then
      expect(assessmentResult).to.be.an.instanceOf(AssessmentResult);

      expect(assessmentResult).to.have.property('id').and.not.to.be.null;
    });
  });

  describe('#get', () => {

    let assessmentResult;
    let competenceMarks1;
    let competenceMarks2;

    beforeEach(async () => {
      const juryId = databaseBuilder.factory.buildUser().id;
      const assessmentId = databaseBuilder.factory.buildAssessment().id;
      assessmentResult = databaseBuilder.factory.buildAssessmentResult({ juryId, assessmentId });
      competenceMarks1 = databaseBuilder.factory.buildCompetenceMark({ id: 1, assessmentResultId: assessmentResult.id });
      competenceMarks2 = databaseBuilder.factory.buildCompetenceMark({ id: 2, assessmentResultId: assessmentResult.id });

      await databaseBuilder.commit();
    });

    it('should return the assessmentResult', async () => {
      // when
      const result = await assessmentResultRepository.get(assessmentResult.id);

      // then
      expect(result).to.be.an.instanceOf(AssessmentResult);
      _.each(
        [ 'level', 'pixScore', 'status', 'commentForJury', 'commentForOrganization', 'commentForCandidate', 'emitter'],
        (field) => {
          expect(result[field]).to.equal(assessmentResult[field]);
        });
    });

    it('should return all marks related to the assessment', async () => {
      // when
      const result = await assessmentResultRepository.get(assessmentResult.id);

      // then
      expect(result.competenceMarks).to.be.instanceOf(Array).and.to.have.lengthOf(2);
      const sortedCompetenceMarks = _.sortBy(result.competenceMarks, 'id');
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
