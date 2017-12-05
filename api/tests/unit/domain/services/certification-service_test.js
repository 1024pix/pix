const { describe, it, expect } = require('../../../test-helper');
const certificationService = require('../../../../lib/domain/services/certification-service');
const Answer = require('../../../../lib/domain/models/data/answer');
const CertificationChallenge = require('../../../../lib/domain/models/data/certification-challenge');
const Competence = require('../../../../lib/domain/models/referential/competence');

function _buildAnswer(challengeId, result) {
  return new Answer({ id: 'answer_id', challengeId, result });
}

function _buildCertificationChallenge(challengeId, competenceId) {
  return new CertificationChallenge({ challengeId, competenceId });
}

function _buildCompetence(courseId, pixScore) {
  const competence = new Competence();
  competence.id = courseId;
  competence.pixScore = pixScore;
  return competence;
}

const listChallenges = [
  _buildCertificationChallenge('challenge_1','comp_1'),
  _buildCertificationChallenge('challenge_2','comp_1'),
  _buildCertificationChallenge('challenge_3','comp_1'),
  _buildCertificationChallenge('challenge_4','comp_2'),
  _buildCertificationChallenge('challenge_5','comp_2'),
  _buildCertificationChallenge('challenge_6','comp_2'),
  _buildCertificationChallenge('challenge_7','comp_3'),
  _buildCertificationChallenge('challenge_8','comp_3'),
  _buildCertificationChallenge('challenge_9','comp_3'),
  _buildCertificationChallenge('challenge_10','comp_4'),
  _buildCertificationChallenge('challenge_11','comp_4'),
  _buildCertificationChallenge('challenge_12','comp_4'),
];

function _listAnswersAllCorrectAnswers() {
  return [
    _buildAnswer('challenge_1','ok'),
    _buildAnswer('challenge_2','ok'),
    _buildAnswer('challenge_3','ok'),
    _buildAnswer('challenge_4','ok'),
    _buildAnswer('challenge_5','ok'),
    _buildAnswer('challenge_6','ok'),
    _buildAnswer('challenge_7','ok'),
    _buildAnswer('challenge_8','ok'),
    _buildAnswer('challenge_9','ok'),
    _buildAnswer('challenge_10','ok'),
    _buildAnswer('challenge_11','ok'),
    _buildAnswer('challenge_12','ok'),
  ];
}

function _listAnswersAllFalseAnswers() {
  return [
    _buildAnswer('challenge_1','ko'),
    _buildAnswer('challenge_2','ko'),
    _buildAnswer('challenge_3','ko'),
    _buildAnswer('challenge_4','ko'),
    _buildAnswer('challenge_5','ko'),
    _buildAnswer('challenge_6','ko'),
    _buildAnswer('challenge_7','ko'),
    _buildAnswer('challenge_8','ko'),
    _buildAnswer('challenge_9','ko'),
    _buildAnswer('challenge_10','ko'),
    _buildAnswer('challenge_11','ko'),
    _buildAnswer('challenge_12','ko'),
  ];
}

function _listAnswersLastCompetenceFailed() {
  return [
    _buildAnswer('challenge_1','ok'),
    _buildAnswer('challenge_2','ok'),
    _buildAnswer('challenge_3','ok'),
    _buildAnswer('challenge_4','ok'),
    _buildAnswer('challenge_5','ok'),
    _buildAnswer('challenge_6','ok'),
    _buildAnswer('challenge_7','ok'),
    _buildAnswer('challenge_8','ok'),
    _buildAnswer('challenge_9','ok'),

    _buildAnswer('challenge_10','ko'),
    _buildAnswer('challenge_11','ko'),
    _buildAnswer('challenge_12','ko'),
  ];
}

function _listAnswersThirdCompetenceFailedAndReproductibilityLessThan80() {
  return [
    _buildAnswer('challenge_1','ok'),
    _buildAnswer('challenge_2','ko'),
    _buildAnswer('challenge_3','ok'),
    _buildAnswer('challenge_4','ok'),
    _buildAnswer('challenge_5','ok'),
    _buildAnswer('challenge_6','ok'),
    _buildAnswer('challenge_7','ok'),
    _buildAnswer('challenge_8','ko'),
    _buildAnswer('challenge_9','ko'),
    _buildAnswer('challenge_10','ok'),
    _buildAnswer('challenge_11','ko'),
    _buildAnswer('challenge_12','ok'),
  ];
}
describe('Unit | Service | Certification Service', function() {

  describe('#getScore', () => {

    const pixComp1 = 10;
    const pixComp2 = 30;
    const pixComp3 = 40;
    const pixComp4 = 20;
    const totalPix = pixComp1 + pixComp2 + pixComp3 + pixComp4;

    const listAssessments = [
      _buildCompetence('comp_1', pixComp1),
      _buildCompetence('comp_2', pixComp2),
      _buildCompetence('comp_3', pixComp3),
      _buildCompetence('comp_4', pixComp4),
    ];

    it('should return 0 when reproductibility is < 50%', () => {
      // given
      const listAnswers = _listAnswersAllFalseAnswers();

      // when
      const score = certificationService.getScore(listAnswers, listChallenges, listAssessments);

      // then
      expect(score).to.be.equal(0);
    });

    context('when reproductibility is between 80% and 100%', () => {
      it('should return all pix when reproductibility is at 100%', () => {
        // given
        const listAnswers = _listAnswersAllCorrectAnswers();

        // when
        const score = certificationService.getScore(listAnswers, listChallenges, listAssessments);

        // then
        expect(score).to.be.equal(totalPix);
      });

      it('should return (all pix - one competence pix) when one competence is totally false', () => {
        // given
        const listAnswers = _listAnswersLastCompetenceFailed();

        // when
        const score = certificationService.getScore(listAnswers, listChallenges, listAssessments);

        // then
        expect(score).to.be.equal(totalPix - pixComp4);
      });

    });

    context('when reproductibility is between 50% and 80%', () => {
      it('should return all pix minus 8 for one competence with 1 error and minus all pix for others false competences', () => {
        // given
        const listAnswers = _listAnswersThirdCompetenceFailedAndReproductibilityLessThan80();
        const malusForFalseAnswer = 8;
        const expectedScore = totalPix - pixComp3 - 2*malusForFalseAnswer;

        // when
        const score = certificationService.getScore(listAnswers, listChallenges, listAssessments);

        // then
        expect(score).to.be.equal(expectedScore);
      });

    });
  });
});
