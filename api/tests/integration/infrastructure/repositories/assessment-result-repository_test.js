const { expect, knex, databaseBuilder } = require('../../../test-helper');

const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const AssessmentResultRepository = require('../../../../lib/infrastructure/repositories/assessment-result-repository');

describe('Integration | Repository | AssessmentResult', function() {

  describe('#save', () => {

    const assessmentResultToSave = new AssessmentResult({
      pixScore: 13,
      level: 1,
      status: 'validated',
      emitter: 'SonGoku',
      commentForJury: 'Parce que',
      commentForCandidate: 'Voilà',
      commentForOrganization: 'Commentaire pour l\'orga'
    });

    let assessmentResult;

    afterEach(async () => {
      await knex('assessment-results').where('id', assessmentResult.id).delete();
    });

    it('should persist the assessment result in db', async () => {
      // when
      assessmentResult = await AssessmentResultRepository.save(assessmentResultToSave);

      // then
      const result = await knex('assessment-results').where('id', assessmentResult.id);

      expect(result).to.have.lengthOf(1);
    });

    it('should return the saved assessment result', async () => {
      // when
      assessmentResult = await AssessmentResultRepository.save(assessmentResultToSave);

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
      assessmentResult = databaseBuilder.factory.buildAssessmentResult({
        level: 1,
        pixScore: 10,
        status: 'validated',
        emitter: 'PIX-ALGO',
        commentForJury: 'Parce que',
        commentForCandidate: 'Voilà',
        commentForOrganization: 'Commentaire pour l\'orga'
      });

      competenceMarks1 = databaseBuilder.factory.buildCompetenceMark({
        assessmentResultId: assessmentResult.id,
        score: 13,
        level: 1,
        area_code: '4',
        competence_code: '4.2'
      });

      competenceMarks2 = databaseBuilder.factory.buildCompetenceMark({
        assessmentResultId: assessmentResult.id,
        score: 8,
        level: 1,
        area_code: '1',
        competence_code: '1.2'
      });

      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return the assessmentResult', async () => {
      // when
      const result = await AssessmentResultRepository.get(assessmentResult.id);

      // then
      expect(result).to.be.an.instanceOf(AssessmentResult);
      expect(result.level).to.be.deep.equal(assessmentResult.level);
      expect(result.pixScore).to.be.deep.equal(assessmentResult.pixScore);
      expect(result.status).to.be.deep.equal(assessmentResult.status);
      expect(result.commentForJury).to.be.deep.equal(assessmentResult.commentForJury);
      expect(result.commentForOrganization).to.be.deep.equal(assessmentResult.commentForOrganization);
      expect(result.commentForCandidate).to.be.deep.equal(assessmentResult.commentForCandidate);
      expect(result.emitter).to.be.deep.equal(assessmentResult.emitter);
    });

    it('should return all marks related to the assessment', async () => {
      // when
      const result = await AssessmentResultRepository.get(assessmentResult.id);

      // then
      expect(result.competenceMarks).to.be.instanceOf(Array).and.to.have.lengthOf(2);
      expect(result.competenceMarks[0].score).to.be.deep.equal(competenceMarks1.score);
      expect(result.competenceMarks[0].level).to.be.deep.equal(competenceMarks1.level);
      expect(result.competenceMarks[0].area_code).to.be.deep.equal(competenceMarks1.area_code);
      expect(result.competenceMarks[0].competence_code).to.be.deep.equal(competenceMarks1.competence_code);

      expect(result.competenceMarks[1].score).to.be.deep.equal(competenceMarks2.score);
      expect(result.competenceMarks[1].level).to.be.deep.equal(competenceMarks2.level);
      expect(result.competenceMarks[1].area_code).to.be.deep.equal(competenceMarks2.area_code);
      expect(result.competenceMarks[1].competence_code).to.be.deep.equal(competenceMarks2.competence_code);
    });
  });
});
