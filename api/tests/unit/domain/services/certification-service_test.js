const { describe, it, expect, sinon } = require('../../../test-helper');
const certificationService = require('../../../../lib/domain/services/certification-service');
const Answer = require('../../../../lib/domain/models/data/answer');
const CertificationChallenge = require('../../../../lib/domain/models/CertificationChallenge');

const Competence = require('../../../../lib/domain/models/referential/competence');

const UserService = require('../../../../lib/domain/services/user-service');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const answersRepository = require('../../../../lib/infrastructure/repositories/answer-repository');
const certificationChallengesRepository = require('../../../../lib/infrastructure/repositories/certification-challenge-repository');
const certificationCourseRepository = require('../../../../lib/infrastructure/repositories/certification-course-repository');
const Assessment = require('../../../../lib/domain/models/Assessment');

function _buildAnswer(challengeId, result) {
  return new Answer({ id: 'answer_id', challengeId, result });
}

function _buildCertificationChallenge(challengeId, competenceId) {
  return new CertificationChallenge({ challengeId, competenceId });
}

function _buildCompetence(name, index, courseId, pixScore, estimatedLevel) {
  const competence = new Competence();
  competence.id = courseId;
  competence.pixScore = pixScore;
  competence.estimatedLevel = estimatedLevel;
  competence.name = name;
  competence.index = index;
  competence.challenges = [{}];
  return competence;
}

const challenges = [
  _buildCertificationChallenge('challenge_A_for_competence_1', 'competence_1'),
  _buildCertificationChallenge('challenge_B_for_competence_1', 'competence_1'),
  _buildCertificationChallenge('challenge_C_for_competence_1', 'competence_1'),
  _buildCertificationChallenge('challenge_D_for_competence_2', 'competence_2'),
  _buildCertificationChallenge('challenge_E_for_competence_2', 'competence_2'),
  _buildCertificationChallenge('challenge_F_for_competence_2', 'competence_2'),
  _buildCertificationChallenge('challenge_G_for_competence_3', 'competence_3'),
  _buildCertificationChallenge('challenge_H_for_competence_3', 'competence_3'),
  _buildCertificationChallenge('challenge_I_for_competence_3', 'competence_3'),
  _buildCertificationChallenge('challenge_J_for_competence_4', 'competence_4'),
  _buildCertificationChallenge('challenge_K_for_competence_4', 'competence_4'),
  _buildCertificationChallenge('challenge_L_for_competence_4', 'competence_4'),
];

function _buildCorrectAnswersForAllChallenges() {
  return [
    _buildAnswer('challenge_A_for_competence_1', 'ok'),
    _buildAnswer('challenge_B_for_competence_1', 'ok'),
    _buildAnswer('challenge_C_for_competence_1', 'ok'),
    _buildAnswer('challenge_D_for_competence_2', 'ok'),
    _buildAnswer('challenge_E_for_competence_2', 'ok'),
    _buildAnswer('challenge_F_for_competence_2', 'ok'),
    _buildAnswer('challenge_G_for_competence_3', 'ok'),
    _buildAnswer('challenge_H_for_competence_3', 'ok'),
    _buildAnswer('challenge_I_for_competence_3', 'ok'),
    _buildAnswer('challenge_J_for_competence_4', 'ok'),
    _buildAnswer('challenge_K_for_competence_4', 'ok'),
    _buildAnswer('challenge_L_for_competence_4', 'ok'),
  ];
}

function _buildWrongAnswersForAllChallenges() {
  return [
    _buildAnswer('challenge_A_for_competence_1', 'ko'),
    _buildAnswer('challenge_B_for_competence_1', 'ko'),
    _buildAnswer('challenge_C_for_competence_1', 'ko'),
    _buildAnswer('challenge_D_for_competence_2', 'ko'),
    _buildAnswer('challenge_E_for_competence_2', 'ko'),
    _buildAnswer('challenge_F_for_competence_2', 'ko'),
    _buildAnswer('challenge_G_for_competence_3', 'ko'),
    _buildAnswer('challenge_H_for_competence_3', 'ko'),
    _buildAnswer('challenge_I_for_competence_3', 'ko'),
    _buildAnswer('challenge_J_for_competence_4', 'ko'),
    _buildAnswer('challenge_K_for_competence_4', 'ko'),
    _buildAnswer('challenge_L_for_competence_4', 'ko'),
  ];
}

function _buildAnswersToHaveOnlyTheLastCompetenceFailed() {
  return [
    _buildAnswer('challenge_A_for_competence_1', 'ok'),
    _buildAnswer('challenge_B_for_competence_1', 'ok'),
    _buildAnswer('challenge_C_for_competence_1', 'ok'),
    _buildAnswer('challenge_D_for_competence_2', 'ok'),
    _buildAnswer('challenge_E_for_competence_2', 'ok'),
    _buildAnswer('challenge_F_for_competence_2', 'ok'),
    _buildAnswer('challenge_G_for_competence_3', 'ok'),
    _buildAnswer('challenge_H_for_competence_3', 'ok'),
    _buildAnswer('challenge_I_for_competence_3', 'ok'),
    _buildAnswer('challenge_J_for_competence_4', 'ko'),
    _buildAnswer('challenge_K_for_competence_4', 'ko'),
    _buildAnswer('challenge_L_for_competence_4', 'ko'),
  ];
}

function _buildAnswersToHaveAThirdOfTheCompetencesFailedAndReproductibilityRateLessThan80() {
  return [
    _buildAnswer('challenge_A_for_competence_1', 'ok'),
    _buildAnswer('challenge_B_for_competence_1', 'ko'),
    _buildAnswer('challenge_C_for_competence_1', 'ok'),
    _buildAnswer('challenge_D_for_competence_2', 'ok'),
    _buildAnswer('challenge_E_for_competence_2', 'ok'),
    _buildAnswer('challenge_F_for_competence_2', 'ok'),
    _buildAnswer('challenge_G_for_competence_3', 'ok'),
    _buildAnswer('challenge_H_for_competence_3', 'ko'),
    _buildAnswer('challenge_I_for_competence_3', 'ko'),
    _buildAnswer('challenge_J_for_competence_4', 'ok'),
    _buildAnswer('challenge_K_for_competence_4', 'ko'),
    _buildAnswer('challenge_L_for_competence_4', 'ok'),
  ];
}

const pixForCompetence1 = 10;
const pixForCompetence2 = 20;
const pixForCompetence3 = 30;
const pixForCompetence4 = 40;
const totalPix = pixForCompetence1 + pixForCompetence2 + pixForCompetence3 + pixForCompetence4;

describe('Unit | Service | Certification Service', function() {

  describe('#calculateCertificationResultByCertificationCourseId', () => {

    let sandbox;

    const certificationAssessement = new Assessment({ id: 'assessment_id', userId: 'user_id', courseId: 'course_id', createdAt: '2018-01-01' });
    const certificationCourse = { id: 'course1', status: 'completed' };

    const userProfile = [
      _buildCompetence('Mener une recherche', '1.1', 'competence_1', pixForCompetence1, 1),
      _buildCompetence('Partager', '2.2', 'competence_2', pixForCompetence2, 2),
      _buildCompetence('Adapter', '3.3', 'competence_3', pixForCompetence3, 3),
      _buildCompetence('Résoudre', '4.4', 'competence_4', pixForCompetence4, 4)
    ];

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.stub(assessmentRepository, 'getByCertificationCourseId').resolves(certificationAssessement);
      sandbox.stub(answersRepository, 'findByAssessment').resolves(_buildWrongAnswersForAllChallenges());
      sandbox.stub(certificationChallengesRepository, 'findByCertificationCourseId').resolves(challenges);
      sandbox.stub(UserService, 'getProfileToCertify').resolves(userProfile);
      sandbox.stub(certificationCourseRepository, 'get').resolves(certificationCourse);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should call Assessment Repository to get Assessment by CertificationCourseId', function() {
      // when
      const promise = certificationService.calculateCertificationResultByCertificationCourseId('course_id');

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(assessmentRepository.getByCertificationCourseId);
        sinon.assert.calledWith(assessmentRepository.getByCertificationCourseId, 'course_id');
      });
    });

    it('should call Answers Repository to get Answers of certification', function() {
      // when
      const promise = certificationService.calculateCertificationResultByCertificationCourseId('course_id');

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(answersRepository.findByAssessment);
        sinon.assert.calledWith(answersRepository.findByAssessment, certificationAssessement.id);
      });
    });

    it('should call Certification Challenges Repository to find challenges by certification id', function() {
      // when
      const promise = certificationService.calculateCertificationResultByCertificationCourseId('course_id');

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(certificationChallengesRepository.findByCertificationCourseId);
        sinon.assert.calledWith(certificationChallengesRepository.findByCertificationCourseId, 'course_id');
      });
    });

    it('should call User Service to get ProfileToCertify', function() {
      // when
      const promise = certificationService.calculateCertificationResultByCertificationCourseId('course_id');

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(UserService.getProfileToCertify);
        sinon.assert.calledWith(UserService.getProfileToCertify, certificationAssessement.userId, '2018-01-01');
      });
    });

    context('when reproductibility rate is < 50%', () => {

      it('should return totalScore = 0', () => {
        // given
        const answers = _buildWrongAnswersForAllChallenges();
        answersRepository.findByAssessment.resolves(answers);

        // when
        const promise = certificationService.calculateCertificationResultByCertificationCourseId('course_id');

        // then
        return promise.then((result) => {
          expect(result.totalScore).to.equal(0);
        });
      });

      it('should return list of competences with all certifiedLevel at -1', () => {
        // given
        const answers = _buildWrongAnswersForAllChallenges();
        answersRepository.findByAssessment.resolves(answers);

        const expectedCertifiedCompetences = [{
          index: '1.1',
          id: 'competence_1',
          name: 'Mener une recherche',
          level: -1,
          score: 0
        }, {
          index: '2.2',
          id: 'competence_2',
          name: 'Partager',
          level: -1,
          score: 0
        }, {
          index: '3.3',
          id: 'competence_3',
          name: 'Adapter',
          level: -1,
          score: 0
        }, {
          index: '4.4',
          id: 'competence_4',
          name: 'Résoudre',
          level: -1,
          score: 0
        }];

        // when
        const promise = certificationService.calculateCertificationResultByCertificationCourseId('course_id');

        // then
        return promise.then((result) => {
          expect(result.listCertifiedCompetences).to.deep.equal(expectedCertifiedCompetences);
        });
      });
    });

    context('when reproductibility rate is between 80% and 100%', () => {

      beforeEach(() => {
        const answers = _buildCorrectAnswersForAllChallenges();
        answersRepository.findByAssessment.resolves(answers);
      });

      it('should return totalScore = all pix', () => {
        // when
        const promise = certificationService.calculateCertificationResultByCertificationCourseId('course_id');

        // then
        return promise.then((result) => {
          expect(result.totalScore).to.equal(totalPix);
        });
      });

      it('should return list of competences with all certifiedLevel equal to estimatedLevel', () => {
        // given
        const expectedCertifiedCompetences = [
          {
            index: '1.1',
            id: 'competence_1',
            name: 'Mener une recherche',
            level: 1,
            score: pixForCompetence1
          }, {
            index: '2.2',
            id: 'competence_2',
            name: 'Partager',
            level: 2,
            score: pixForCompetence2
          }, {
            index: '3.3',
            id: 'competence_3',
            name: 'Adapter',
            level: 3,
            score: pixForCompetence3
          }, {
            index: '4.4',
            id: 'competence_4',
            name: 'Résoudre',
            level: 4,
            score: pixForCompetence4
          }
        ];

        // when
        const promise = certificationService.calculateCertificationResultByCertificationCourseId('course_id');

        // then
        return promise.then((result) => {
          expect(result.listCertifiedCompetences).to.deep.equal(expectedCertifiedCompetences);
        });
      });

      it('should return totalScore = (all pix - one competence pix) when one competence is totally false', () => {
        // given
        const answers = _buildAnswersToHaveOnlyTheLastCompetenceFailed();
        answersRepository.findByAssessment.resolves(answers);

        // when
        const promise = certificationService.calculateCertificationResultByCertificationCourseId('course_id');

        // then
        return promise.then((result) => {
          expect(result.totalScore).to.equal(totalPix - pixForCompetence4);
        });
      });

      it('should return list of competences with certifiedLevel = estimatedLevel except for failed competence', () => {
        // given
        const answers = _buildAnswersToHaveOnlyTheLastCompetenceFailed();
        answersRepository.findByAssessment.resolves(answers);
        const expectedCertifiedCompetences = [{
          index: '1.1',
          id: 'competence_1',
          name: 'Mener une recherche',
          level: 1,
          score: pixForCompetence1
        }, {
          index: '2.2',
          id: 'competence_2',
          name: 'Partager',
          level: 2,
          score: pixForCompetence2
        }, {
          index: '3.3',
          id: 'competence_3',
          name: 'Adapter',
          level: 3,
          score: pixForCompetence3
        }, {
          index: '4.4',
          id: 'competence_4',
          name: 'Résoudre',
          level: -1,
          score: 0
        }];

        // when
        const promise = certificationService.calculateCertificationResultByCertificationCourseId('course_id');

        // then
        return promise.then((result) => {
          expect(result.listCertifiedCompetences).to.deep.equal(expectedCertifiedCompetences);
        });
      });
    });

    context('when reproductibility rate is between 50% and 80%', () => {
      beforeEach(() => {
        const answers = _buildAnswersToHaveAThirdOfTheCompetencesFailedAndReproductibilityRateLessThan80();
        answersRepository.findByAssessment.resolves(answers);
      });

      it('should return totalScore = all pix minus 8 for one competence with 1 error and minus all pix for others false competences', () => {
        // given
        const malusForFalseAnswer = 8;
        const expectedScore = totalPix - pixForCompetence3 - 2 * malusForFalseAnswer;

        // when
        const promise = certificationService.calculateCertificationResultByCertificationCourseId('course_id');

        // then
        return promise.then((result) => {
          expect(result.totalScore).to.equal(expectedScore);
        });
      });

      it('should return list of competences with certifiedLevel less or equal to estimatedLevel', () => {
        // given
        const malusForFalseAnswer = 8;
        const expectedCertifiedCompetences = [{
          index: '1.1',
          id: 'competence_1',
          name: 'Mener une recherche',
          level: 0,
          score: pixForCompetence1 - malusForFalseAnswer
        }, {
          index: '2.2',
          id: 'competence_2',
          name: 'Partager',
          level: 2,
          score: pixForCompetence2
        }, {
          index: '3.3',
          id: 'competence_3',
          name: 'Adapter',
          level: -1,
          score: 0
        }, {
          index: '4.4',
          id: 'competence_4',
          name: 'Résoudre',
          level: 3,
          score: pixForCompetence4 - malusForFalseAnswer
        }];

        // when
        const promise = certificationService.calculateCertificationResultByCertificationCourseId('course_id');

        // then
        return promise.then((result) => {
          expect(result.listCertifiedCompetences).to.deep.equal(expectedCertifiedCompetences);
        });
      });
    });
  });

  describe('#calculateCertificationResultByAssessmentId', () => {

    let sandbox;
    const certificationCourse = { id: 'course1', status: 'completed' };

    const certificationAssessement = new Assessment({
      id: 'assessment_id',
      userId: 'user_id',
      createdAt: '2018-01-01',
      courseId: 'course_id'
    });

    const userProfile = [
      _buildCompetence('Mener une recherche', '1.1', 'competence_1', pixForCompetence1, 1),
      _buildCompetence('Partager', '2.2', 'competence_2', pixForCompetence2, 2),
      _buildCompetence('Adapter', '3.3', 'competence_3', pixForCompetence3, 3),
      _buildCompetence('Résoudre', '4.4', 'competence_4', pixForCompetence4, 4)
    ];

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.stub(assessmentRepository, 'get').resolves(certificationAssessement);
      sandbox.stub(answersRepository, 'findByAssessment').resolves(_buildWrongAnswersForAllChallenges());
      sandbox.stub(certificationChallengesRepository, 'findByCertificationCourseId').resolves(challenges);
      sandbox.stub(UserService, 'getProfileToCertify').resolves(userProfile);
      sandbox.stub(certificationCourseRepository, 'get').resolves(certificationCourse);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should call Assessment Repository to get Assessment by CertificationCourseId', function() {
      // when
      const promise = certificationService.calculateCertificationResultByAssessmentId('assessment_id');

      // then
      return promise.then(() => {
        expect(assessmentRepository.get).to.have.been.calledWith('assessment_id');
      });
    });

    it('should call Answers Repository to get Answers of certification', function() {
      // when
      const promise = certificationService.calculateCertificationResultByAssessmentId('assessment_id');

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(answersRepository.findByAssessment);
        sinon.assert.calledWith(answersRepository.findByAssessment, certificationAssessement.id);
      });
    });

    it('should call Certification Challenges Repository to find challenges by certification id', function() {
      // when
      const promise = certificationService.calculateCertificationResultByAssessmentId('assessment_id');

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(certificationChallengesRepository.findByCertificationCourseId);
        sinon.assert.calledWith(certificationChallengesRepository.findByCertificationCourseId, 'course_id');
      });
    });

    it('should call User Service to get ProfileToCertify', function() {
      // when
      const promise = certificationService.calculateCertificationResultByAssessmentId('assessment_id');

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(UserService.getProfileToCertify);
        sinon.assert.calledWith(UserService.getProfileToCertify, certificationAssessement.userId, '2018-01-01');
      });
    });

    context('when reproductibility rate is < 50%', () => {

      it('should return totalScore = 0', () => {
        // given
        const answers = _buildWrongAnswersForAllChallenges();
        answersRepository.findByAssessment.resolves(answers);

        // when
        const promise = certificationService.calculateCertificationResultByAssessmentId('assessment_id');

        // then
        return promise.then((result) => {
          expect(result.totalScore).to.equal(0);
        });
      });

      it('should return list of competences with all certifiedLevel at -1', () => {
        // given
        const answers = _buildWrongAnswersForAllChallenges();
        answersRepository.findByAssessment.resolves(answers);

        const expectedCertifiedCompetences = [{
          index: '1.1',
          id: 'competence_1',
          name: 'Mener une recherche',
          level: -1,
          score: 0
        }, {
          index: '2.2',
          id: 'competence_2',
          name: 'Partager',
          level: -1,
          score: 0
        }, {
          index: '3.3',
          id: 'competence_3',
          name: 'Adapter',
          level: -1,
          score: 0
        }, {
          index: '4.4',
          id: 'competence_4',
          name: 'Résoudre',
          level: -1,
          score: 0
        }];

        // when
        const promise = certificationService.calculateCertificationResultByAssessmentId('assessment_id');

        // then
        return promise.then((result) => {
          expect(result.listCertifiedCompetences).to.deep.equal(expectedCertifiedCompetences);
        });
      });
    });

    context('when reproductibility rate is between 80% and 100%', () => {

      beforeEach(() => {
        const answers = _buildCorrectAnswersForAllChallenges();
        answersRepository.findByAssessment.resolves(answers);
      });

      it('should return totalScore = all pix', () => {
        // when
        const promise = certificationService.calculateCertificationResultByAssessmentId('assessment_id');

        // then
        return promise.then((result) => {
          expect(result.totalScore).to.equal(totalPix);
        });
      });

      it('should return list of competences with all certifiedLevel equal to estimatedLevel', () => {
        // given
        const expectedCertifiedCompetences = [
          {
            index: '1.1',
            id: 'competence_1',
            name: 'Mener une recherche',
            level: 1,
            score: pixForCompetence1
          }, {
            index: '2.2',
            id: 'competence_2',
            name: 'Partager',
            level: 2,
            score: pixForCompetence2
          }, {
            index: '3.3',
            id: 'competence_3',
            name: 'Adapter',
            level: 3,
            score: pixForCompetence3
          }, {
            index: '4.4',
            id: 'competence_4',
            name: 'Résoudre',
            level: 4,
            score: pixForCompetence4
          }
        ];

        // when
        const promise = certificationService.calculateCertificationResultByAssessmentId('assessment_id');

        // then
        return promise.then((result) => {
          expect(result.listCertifiedCompetences).to.deep.equal(expectedCertifiedCompetences);
        });
      });

      it('should return totalScore = (all pix - one competence pix) when one competence is totally false', () => {
        // given
        const answers = _buildAnswersToHaveOnlyTheLastCompetenceFailed();
        answersRepository.findByAssessment.resolves(answers);

        // when
        const promise = certificationService.calculateCertificationResultByAssessmentId('assessment_id');

        // then
        return promise.then((result) => {
          expect(result.totalScore).to.equal(totalPix - pixForCompetence4);
        });
      });

      it('should return list of competences with certifiedLevel = estimatedLevel except for failed competence', () => {
        // given
        const answers = _buildAnswersToHaveOnlyTheLastCompetenceFailed();
        answersRepository.findByAssessment.resolves(answers);
        const expectedCertifiedCompetences = [{
          index: '1.1',
          id: 'competence_1',
          name: 'Mener une recherche',
          level: 1,
          score: pixForCompetence1
        }, {
          index: '2.2',
          id: 'competence_2',
          name: 'Partager',
          level: 2,
          score: pixForCompetence2
        }, {
          index: '3.3',
          id: 'competence_3',
          name: 'Adapter',
          level: 3,
          score: pixForCompetence3
        }, {
          index: '4.4',
          id: 'competence_4',
          name: 'Résoudre',
          level: -1,
          score: 0
        }];

        // when
        const promise = certificationService.calculateCertificationResultByAssessmentId('assessment_id');

        // then
        return promise.then((result) => {
          expect(result.listCertifiedCompetences).to.deep.equal(expectedCertifiedCompetences);
        });
      });
    });

    context('when reproductibility rate is between 50% and 80%', () => {
      beforeEach(() => {
        const answers = _buildAnswersToHaveAThirdOfTheCompetencesFailedAndReproductibilityRateLessThan80();
        answersRepository.findByAssessment.resolves(answers);
      });

      it('should return totalScore = all pix minus 8 for one competence with 1 error and minus all pix for others false competences', () => {
        // given
        const malusForFalseAnswer = 8;
        const expectedScore = totalPix - pixForCompetence3 - 2 * malusForFalseAnswer;

        // when
        const promise = certificationService.calculateCertificationResultByAssessmentId('assessment_id');

        // then
        return promise.then((result) => {
          expect(result.totalScore).to.equal(expectedScore);
        });
      });

      it('should return list of competences with certifiedLevel less or equal to estimatedLevel', () => {
        // given
        const malusForFalseAnswer = 8;
        const expectedCertifiedCompetences = [{
          index: '1.1',
          id: 'competence_1',
          name: 'Mener une recherche',
          level: 0,
          score: pixForCompetence1 - malusForFalseAnswer
        }, {
          index: '2.2',
          id: 'competence_2',
          name: 'Partager',
          level: 2,
          score: pixForCompetence2
        }, {
          index: '3.3',
          id: 'competence_3',
          name: 'Adapter',
          level: -1,
          score: 0
        }, {
          index: '4.4',
          id: 'competence_4',
          name: 'Résoudre',
          level: 3,
          score: pixForCompetence4 - malusForFalseAnswer
        }];

        // when
        const promise = certificationService.calculateCertificationResultByAssessmentId('assessment_id');

        // then
        return promise.then((result) => {
          expect(result.listCertifiedCompetences).to.deep.equal(expectedCertifiedCompetences);
        });
      });
    });
  });

});
