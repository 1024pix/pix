const { expect, knex } = require('../../../test-helper');

const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const AssessmentResultRepository = require('../../../../lib/infrastructure/repositories/assessment-result-repository');

describe('Integration | Repository | AssessmentResult', function() {

  describe('#save', () => {

    afterEach(() => knex('assessment-results').delete());

    it('should persist the assessment result in db', () => {
      // given
      const result = new AssessmentResult({
        pixScore: 13,
        level: 1,
        status: 'validated',
        emitter: 'SonGoku',
        commentForJury: 'Parce que',
        commentForCandidate: 'Voilà'
      });

      // when
      const promise = AssessmentResultRepository.save(result);

      // then
      return promise.then(() => knex('assessment-results').select())
        .then((result) => {
          expect(result).to.have.lengthOf(1);
        });
    });

    it('should return the saved assessment result', () => {
      // given
      const result = new AssessmentResult({
        pixScore: 13,
        level: 1,
        status: 'validated',
        emitter: 'SonGoku',
        commentForJury: 'Parce que',
        commentForCandidate: 'Voilà'
      });

      // when
      const promise = AssessmentResultRepository.save(result);

      // then
      return promise.then(result => {
        expect(result).to.be.an.instanceOf(AssessmentResult);

        expect(result).to.have.property('id').and.not.to.be.null;
      });
    });
  });

  describe('#get', () => {
    let assessmentResultId;
    const assessmentResult = {
      level: 1,
      pixScore: 10,
      status: 'validated',
      emitter: 'PIX-ALGO',
      commentForJury: 'Parce que',
      commentForCandidate: 'Voilà'
    };

    const competenceMarks1 = {
      score: 13,
      level: 1,
      area_code: '4',
      competence_code: '4.2'
    };
    const competenceMarks2 = {
      score: 8,
      level: 1,
      area_code: '1',
      competence_code: '1.2'
    };

    beforeEach(() =>  {
      return knex('assessment-results')
        .insert([ assessmentResult ])
        .then((rows) => {
          assessmentResultId = rows[0];

          competenceMarks1.assessmentResultId = assessmentResultId;
          competenceMarks2.assessmentResultId = assessmentResultId;

          return knex('competence-marks').insert([competenceMarks1, competenceMarks2]);
        });
    });

    afterEach(() => knex('competence-marks').delete().then(()=> knex('assessment-results').delete()));

    it('should return the assessmentResult', () => {
      // when
      const promise = AssessmentResultRepository.get(assessmentResultId);

      // then
      return promise.then(result => {
        expect(result).to.be.an.instanceOf(AssessmentResult);
        expect(result.level).to.be.deep.equal(assessmentResult.level);
        expect(result.pixScore).to.be.deep.equal(assessmentResult.pixScore);
        expect(result.status).to.be.deep.equal(assessmentResult.status);
        expect(result.commentForJury).to.be.deep.equal(assessmentResult.commentForJury);
        expect(result.commentForCandidate).to.be.deep.equal(assessmentResult.commentForCandidate);
        expect(result.emitter).to.be.deep.equal(assessmentResult.emitter);
      });
    });

    it('should return all marks related to the assessment', () => {
      // when
      const promise = AssessmentResultRepository.get(assessmentResultId);

      // then
      return promise.then(result => {
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
});

