const courseRepository = require('../../infrastructure/repositories/course-repository');
const certificationCourseRepository = require('../../infrastructure/repositories/certification-course-repository');
const answerRepository = require('../../infrastructure/repositories/answer-repository');
const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');
const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const skillRepository = require('../../infrastructure/repositories/skill-repository');
const competenceRepository = require('../../infrastructure/repositories/competence-repository');
const competenceMarkRepository = require('../../infrastructure/repositories/competence-mark-repository');
const assessmentAdapter = require('../../infrastructure/adapters/assessment-adapter');
const answerService = require('../services/answer-service');
const certificationService = require('../services/certification-service');
const assessmentUtils = require('./assessment-service-utils');
const CompetenceMark = require('../../domain/models/CompetenceMark');

const _ = require('../../infrastructure/utils/lodash-utils');

const Course = require('../models/Course');

const { NotFoundError, AssessmentEndedError } = require('../../domain/errors');

function _selectNextInAdaptiveMode(assessment, course) {

  // FIXME: Extraire dans une méthode dédiée aux tests adaptatifs
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

function _selectNextChallengeId(course, assessment) {
  return Promise.resolve(_selectNextInAdaptiveMode(assessment, course));
}

function getAssessmentNextChallengeId(assessment) {

  const courseId = assessment.courseId;

  return courseRepository.get(courseId)
    .then(course => _selectNextChallengeId(course, assessment))
    .then((nextChallenge) => {
      if (nextChallenge) {
        return nextChallenge;
      }

      throw new AssessmentEndedError();
    });
}

// FIXME: Devrait plutot 1) splitter entre les calculs des acquis 2) calcul du result
/**
 * @deprecated since getSkills and getCompetenceMarks
 */
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

async function getSkills(assessment) {
  if (assessment === null) {
    return Promise.reject(new NotFoundError('Unable to getSkills without assessment'));
  }
  let skillsReport = {
    validatedSkills: [],
    failedSkills: []
  };

  if (_isNonScoredAssessment(assessment)) {
    return Promise.resolve(skillsReport);
  }

  const assessmentId = assessment.id;
  const [answers] = await Promise.all([
    answerRepository.findByAssessment(assessmentId)
  ]);

  return courseRepository.get(assessment.courseId)
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
    let competenceOfMark;
    return courseRepository.get(assessment.courseId)
      .then((course) => {
        return competenceRepository.get(course.competences[0]);
      }).then(competence => {
        competenceOfMark = competence;
        return this.getScoreAndLevel(assessment.id);
      }).then(({ estimatedLevel, pixScore }) =>{
        return [
          new CompetenceMark({
            level: estimatedLevel,
            score: pixScore,
            area_code: competenceOfMark.area.code,
            competence_code: competenceOfMark.index
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

function computeMarks(assessmentId, assessmentResultId) {

  return Promise
    .all([competenceRepository.list(), certificationService.calculateCertificationResultByAssessmentId(assessmentId)])
    .then(([competences, { competencesWithMark }]) => {
      const savedMarks = competencesWithMark.map((certifiedCompetence) => {

        const area_code = _(competences).find((competence) => {
          return competence.index === certifiedCompetence.index;
        }).area.code;

        const mark = new CompetenceMark({
          level: certifiedCompetence.obtainedLevel,
          score: certifiedCompetence.obtainedScore,
          area_code,
          competence_code: certifiedCompetence.index,
          assessmentResultId: assessmentResultId
        });

        return competenceMarkRepository.save(mark);
      });

      return Promise.all(savedMarks);
    });
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

// TODO Move the below functions into Assessment
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

module.exports = {
  getAssessmentNextChallengeId,
  fetchAssessment,
  findByFilters,
  isPreviewAssessment,
  isPlacementAssessment,
  isDemoAssessment,
  isCertificationAssessment,
  getScoreAndLevel,
  getSkills,
  getCompetenceMarks,
  computeMarks
};
