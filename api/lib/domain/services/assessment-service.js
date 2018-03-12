const courseRepository = require('../../infrastructure/repositories/course-repository');
const certificationCourseRepository = require('../../infrastructure/repositories/certification-course-repository');
const answerRepository = require('../../infrastructure/repositories/answer-repository');
const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');
const certificationChallengeRepository = require('../../infrastructure/repositories/certification-challenge-repository');
const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const skillRepository = require('../../infrastructure/repositories/skill-repository');
const competenceRepository = require('../../infrastructure/repositories/competence-repository');
const assessmentAdapter = require('../../infrastructure/adapters/assessment-adapter');
const answerService = require('../services/answer-service');
const certificationService = require('../services/certification-service');
const assessmentUtils = require('./assessment-service-utils');
const CompetenceMark = require('../../domain/models/CompetenceMark');

const _ = require('../../infrastructure/utils/lodash-utils');

const Course = require('../models/Course');

const { NotFoundError, AssessmentEndedError } = require('../../domain/errors');

function _selectNextInAdaptiveMode(assessment, course) {

  let answers, challenges, competence;

  return answerRepository.findByAssessment(assessment.id)
    .then(fetchedAnswers => (answers = fetchedAnswers))
    .then(() => competenceRepository.get(course.competences[0]))
    .then((fetchedCompetence) => (competence = fetchedCompetence))
    .then(() => challengeRepository.findByCompetence(competence))
    .then(fetchedChallenges => (challenges = fetchedChallenges))
    .then(() => skillRepository.findByCompetence(competence))
    .then(skills => assessmentUtils.getNextChallengeInAdaptiveCourse(answers, challenges, skills));
}

function _selectNextInNormalMode(currentChallengeId, challenges) {

  /*
   * example : - if challenges is ["1st_challenge", "2nd_challenge", "3rd_challenge", "4th_challenge"]
   *           - and currentChallengeId is "2nd_challenge"
   *
   *           nextChallengeId will be "3rd_challenge"
   */
  const nextChallengeId = _(challenges).elementAfter(currentChallengeId).value();
  return _.defaultTo(nextChallengeId, null); // result MUST be null if not found

}

function _selectNextChallengeId(course, currentChallengeId, assessment) {

  const challenges = course.challenges;

  if (course.isAdaptive) {
    return Promise.resolve(_selectNextInAdaptiveMode(assessment, course));
  }

  if (!currentChallengeId) { // no currentChallengeId means the test has not yet started
    return Promise.resolve(challenges[0]);
  }

  return Promise.resolve(_selectNextInNormalMode(currentChallengeId, challenges));
}

function getAssessmentNextChallengeId(assessment, currentChallengeId) {

  if (isPreviewAssessment(assessment)) {
    return Promise.reject(new AssessmentEndedError());
  }

  const courseId = assessment.courseId;

  return courseRepository.get(courseId)
    .then(course => _selectNextChallengeId(course, currentChallengeId, assessment))
    .then((nextChallenge) => {
      if (nextChallenge) {
        return nextChallenge;
      }

      throw new AssessmentEndedError();
    });
}

// FIXME: Devrait plutot 1) splitter entre les calculs des acquis 2) calcul du result
async function fetchAssessment(assessmentId) {

  const [assessmentPix, answers] = await Promise.all([
    assessmentRepository.get(assessmentId),
    answerRepository.findByAssessment(assessmentId)
  ]);

  if (assessmentPix === null) {
    return Promise.reject(new NotFoundError(`Unable to find assessment with ID ${assessmentId}`));
  }

  assessmentPix.estimatedLevel = 0;
  assessmentPix.pixScore = 0;
  assessmentPix.successRate = answerService.getAnswersSuccessRate(answers);

  if (_isNonScoredAssessment(assessmentPix)) {
    return Promise.resolve({ assessmentPix });
  }

  return courseRepository.get(assessmentPix.courseId)
    .then((course) => {

      if (course.isAdaptive) {
        return competenceRepository
          .get(course.competences[0])
          .then(competencePix => Promise.all([
            skillRepository.findByCompetence(competencePix),
            challengeRepository.findByCompetence(competencePix)
          ]));
      }

      return null;
    })
    .then((skillsAndChallenges) => {

      let skillsReport;

      if (skillsAndChallenges) {
        const [skills, challengesPix] = skillsAndChallenges;
        const catAssessment = assessmentAdapter.getAdaptedAssessment(answers, challengesPix, skills);

        skillsReport = {
          assessmentId,
          validatedSkills: catAssessment.validatedSkills,
          failedSkills: catAssessment.failedSkills
        };

        assessmentPix.estimatedLevel = catAssessment.obtainedLevel;
        assessmentPix.pixScore = catAssessment.displayedPixScore;
      }

      return Promise.resolve({ assessmentPix, skills: skillsReport });
    });
}

async function getSkills(assessmentId) {

  const [assessmentPix, answers] = await Promise.all([
    assessmentRepository.get(assessmentId),
    answerRepository.findByAssessment(assessmentId)
  ]);

  if (assessmentPix === null) {
    return Promise.reject(new NotFoundError(`Unable to find assessment with ID ${assessmentId}`));
  }

  if (_isNonScoredAssessment(assessmentPix)) {
    return Promise.resolve({
      validatedSkills: [],
      failedSkills: []
    });
  }

  return courseRepository.get(assessmentPix.courseId)
    .then((course) => {

      if (course.isAdaptive) {
        return competenceRepository
          .get(course.competences[0])
          .then(competencePix => Promise.all([
            skillRepository.findByCompetence(competencePix),
            challengeRepository.findByCompetence(competencePix)
          ]));
      }
      return null;
    })
    .then((skillsAndChallenges) => {

      let skillsReport = {
        validatedSkills: [],
        failedSkills: []
      };
      if (skillsAndChallenges) {
        const [skills, challengesPix] = skillsAndChallenges;
        const catAssessment = assessmentAdapter.getAdaptedAssessment(answers, challengesPix, skills);

        skillsReport = {
          validatedSkills: catAssessment.validatedSkills,
          failedSkills: catAssessment.failedSkills
        };

      }
      return Promise.resolve(skillsReport);
    });
}

function getScoreAndLevel(assessmentId) {
  let estimatedLevel = 0;
  let pixScore =0;

  return Promise.all([
    assessmentRepository.get(assessmentId),
    answerRepository.findByAssessment(assessmentId)
  ]).then(([assessmentPix, answers]) => {
    return courseRepository.get(assessmentPix.courseId)
      .then((course) => {

        if (course.isAdaptive) {
          return competenceRepository
            .get(course.competences[0])
            .then(competencePix => Promise.all([
              skillRepository.findByCompetence(competencePix),
              challengeRepository.findByCompetence(competencePix)
            ]));
        }

        return null;
      })
      .then((skillsAndChallenges) => {
        if (skillsAndChallenges) {
          const [skills, challengesPix] = skillsAndChallenges;
          const catAssessment = assessmentAdapter.getAdaptedAssessment(answers, challengesPix, skills);

          estimatedLevel = catAssessment.obtainedLevel;
          pixScore = catAssessment.displayedPixScore;
        }

        return Promise.resolve({ estimatedLevel, pixScore });
      });
  });
}
function getCompetenceMarks(assessment) {

  if(this.isPlacementAssessment(assessment)) {
    let result = {};
    return this.getScoreAndLevel(assessment.id)
      .then((resultCompute) =>{
        result = resultCompute;
        return courseRepository.get(assessment.courseId);
      }).then((course) => {
        return competenceRepository.get(course.competences[0]);
      }).then(competence => {
        return [
          new CompetenceMark({
            level: result.estimatedLevel,
            score: result.pixScore,
            area_code: competence.area.code,
            competence_code: competence.index
          })
        ];
      });
  }

  if(this.isCertificationAssessment(assessment)) {
    return Promise
      .all([competenceRepository.list(), certificationService.calculateCertificationResultByAssessmentId(assessment.id)])
      .then(([competences, { competencesWithMark }]) => {
        return competencesWithMark.map((certifiedCompetence) => {

          const area_code = _(competences).find((competence) => {
            return competence.index === certifiedCompetence.index;
          }).area.code;

          return new CompetenceMark({
            level: certifiedCompetence.obtainedLevel,
            score: certifiedCompetence.obtainedScore,
            area_code,
            competence_code: certifiedCompetence.index,
          });

        });
      });
  }

  return [];
}

function findByFilters(filters) {
  return assessmentRepository.findByFilters(filters)
    .then((assessments) => {
      const assessmentsWithAssociatedCourse = assessments.map((assessment) => {
        // TODO REFACTO DE LA MAGIC STRING
        if (assessment.type === 'CERTIFICATION') {
          return certificationCourseRepository.get(assessment.courseId)
            .then((certificationCourse) => {
              assessment.course = new Course(certificationCourse);
              return assessment;
            });
        } else {
          return Promise.resolve(assessment);
        }
      });
      return Promise.all(assessmentsWithAssociatedCourse);
    });
}

function _isNonScoredAssessment(assessment) {
  return isPreviewAssessment(assessment) || isCertificationAssessment(assessment);
}

function isPreviewAssessment(assessment) {
  return _.startsWith(assessment.courseId, 'null');
}

function isDemoAssessment(assessment) {
  return assessment.type === 'DEMO';
}

function isCertificationAssessment(assessment) {
  return assessment.type === 'CERTIFICATION';
}

function isPlacementAssessment(assessment) {
  return assessment.type === 'PLACEMENT';
}

function isAssessmentCompleted(assessment) {
  return assessment.state === 'completed';
}

function getNextChallengeForCertificationCourse(assessment) {
  return certificationChallengeRepository.getNonAnsweredChallengeByCourseId(
    assessment.id, assessment.courseId
  );
}

module.exports = {
  getAssessmentNextChallengeId,
  getNextChallengeForCertificationCourse,
  fetchAssessment,
  isAssessmentCompleted,
  findByFilters,
  isPreviewAssessment,
  isPlacementAssessment,
  isDemoAssessment,
  isCertificationAssessment,
  getScoreAndLevel,
  getSkills,
  getCompetenceMarks
};
