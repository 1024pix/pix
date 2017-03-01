const { describe, it, expect, sinon } = require('../../../test-helper');

const service = require('../../../../lib/domain/services/assessment-service');
const courseRepository = require('../../../../lib/infrastructure/repositories/course-repository');
const Assessment = require('../../../../lib/domain/models/data/assessment');

function _buildAssessment(assessmentObject) {
  const answer = new Assessment({id: 'assessment_id'});
  answer.attributes = assessmentObject;
  return answer;
}

describe('Unit | Service | AssessmentService', function () {


  it('Should exist', function () {
    expect(service).to.exist;
  });

  it('#getAssessmentNextChallengeId should exist', function () {
    expect(service.getAssessmentNextChallengeId).to.exist;
  });

  describe('#getAssessmentNextChallengeId |', function () {

    it ('Should return the first challenge if no currentChallengeId is given', function (done) {

      sinon.stub(courseRepository, 'get').resolves({challenges:['the_first_challenge']});

      service.getAssessmentNextChallengeId(_buildAssessment({courseId:'22'}), null).then(function(result) {
        expect(result).to.equal('the_first_challenge');
        courseRepository.get.restore();
        done();
      });

    });


    it ('Should return the next challenge if currentChallengeId is given', function (done) {

      sinon.stub(courseRepository, 'get').resolves({challenges:['1st_challenge', '2nd_challenge']});

      service.getAssessmentNextChallengeId(_buildAssessment({courseId:'22'}), '1st_challenge').then(function(result) {
        expect(result).to.equal('2nd_challenge');
        courseRepository.get.restore();
        done();
      });

    });


    it ('Should resolves to "null" if no assessment is given', function (done) {

      service.getAssessmentNextChallengeId().then(function(result) {
        expect(result).to.equal(null);
        done();
      });

    });


    it ('Should resolves to "null" if no courseId is given', function (done) {

      sinon.stub(courseRepository, 'get').resolves({challenges:['1st_challenge', '2nd_challenge']});

      service.getAssessmentNextChallengeId(_buildAssessment({}), '1st_challenge').then(function(result) {
        expect(result).to.equal(null);
        courseRepository.get.restore();
        done();
      });

    });

    it ('Should resolves to "null" if courseId starts with "null"', function (done) {

      sinon.stub(courseRepository, 'get').resolves({challenges:['1st_challenge', '2nd_challenge']});

      service.getAssessmentNextChallengeId(_buildAssessment({courseId:'null22'}), '1st_challenge').then(function(result) {
        expect(result).to.equal(null);
        courseRepository.get.restore();
        done();
      });

    });

  });

});
