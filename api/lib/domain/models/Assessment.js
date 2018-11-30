const _ = require('lodash');
const moment = require('moment');

const AnswerStatus = require('./AnswerStatus');
const { ObjectValidationError } = require('../errors');

const TYPES_OF_ASSESSMENT_NEEDING_USER = ['PLACEMENT', 'CERTIFICATION'];

const MINIMUM_DELAY_IN_DAYS_BETWEEN_TWO_PLACEMENTS = 7;

const states = {
  COMPLETED: 'completed',
  STARTED: 'started',
};

const type = {
  PLACEMENT: 'PLACEMENT',
  SMARTPLACEMENT: 'SMART_PLACEMENT',
  CERTIFICATION: 'CERTIFICATION',
  DEMO: 'DEMO',
  PREVIEW: 'PREVIEW',
};

/*
 * Traduction : Évaluation
 */
class Assessment {

  /*
   * TODO: changer the Object.assign en quelque chose de plus expressif
   * Complétez la liste des attributs de la classe Assessment
   *
   * id: String,
   * course : associatedCourse (Class Course)
   * createdAt: Date
   * user: ? (class User ?)
   * successRate: 24, ?? Je ne sais pas ce que c'est
   * type: 'charade', String ?
   * state: String
   */
  constructor({
    id,
    // attributes
    createdAt,
    state,
    type,
    // includes
    answers = [],
    assessmentResults = [],
    campaignParticipation,
    course,
    targetProfile,
    // references
    courseId,
    userId,
  } = {}) {
    this.id = id;
    // attributes
    this.createdAt = createdAt;
    this.state = state;
    this.type = type;
    // includes
    this.answers = answers;
    this.assessmentResults = assessmentResults;
    this.campaignParticipation = campaignParticipation;
    this.course = course;
    this.targetProfile = targetProfile;
    // references
    this.courseId = courseId;
    this.userId = userId;
  }

  /**
   * @deprecated
   */
  static fromAttributes(attributes) {
    const assessment = new Assessment();
    return Object.assign(assessment, attributes);
  }

  isCompleted() {
    return this.state === Assessment.states.COMPLETED;
  }

  getLastAssessmentResult() {
    if (this.assessmentResults && this.assessmentResults.length > 0) {
      return _(this.assessmentResults).sortBy(['createdAt']).last();
    }
    return null;
  }

  getPixScore() {
    if (this.getLastAssessmentResult()) {
      return this.getLastAssessmentResult().pixScore;
    }
    return null;
  }

  getLevel() {
    if (this.getLastAssessmentResult()) {
      return this.getLastAssessmentResult().level;
    }
    return null;
  }

  setCompleted() {
    this.state = Assessment.states.COMPLETED;
  }

  start() {
    this.state = Assessment.states.STARTED;
  }

  validate() {
    if (TYPES_OF_ASSESSMENT_NEEDING_USER.includes(this.type) && !this.userId) {
      return Promise.reject(new ObjectValidationError(`Assessment ${this.type} needs an User Id`));
    }
    return Promise.resolve();
  }

  isSmartPlacementAssessment() {
    return this.type === type.SMARTPLACEMENT;
  }

  isCertificationAssessment() {
    return this.type === type.CERTIFICATION;
  }

  isPlacementAssessment() {
    return this.type === type.PLACEMENT;
  }

  addAnswersWithTheirChallenge(answers, challenges) {
    this.answers = answers;
    this.answers.forEach((answer) => {
      answer.challenge = challenges.find((challenge) => challenge.id === answer.challengeId);
    });
  }

  getValidatedSkills() {
    return this.answers
      .filter((answer) => AnswerStatus.isOK(answer.result))
      .filter((answer) => answer.challenge)
      .reduce((validatedSkills, answer) => {
        answer.challenge.skills.forEach((skill) => {
          const tube = this.course.findTube(skill.tubeName);
          tube.getEasierThan(skill).forEach((easierSkill) => {
            if (!validatedSkills.includes(easierSkill))
              validatedSkills.push(easierSkill);
          });
        });
        return validatedSkills;
      }, []);
  }

  getFailedSkills() {
    return this.answers
      .filter((answer) => AnswerStatus.isFailed(answer.result))
      .filter((answer) => answer.challenge)
      .reduce((failedSkills, answer) => {
        // FIXME refactor !
        // XXX we take the current failed skill and all the harder skills in
        // its tube and mark them all as failed
        answer.challenge.skills.forEach((skill) => {
          const tube = this.course.findTube(skill.tubeName);
          tube.getHarderThan(skill).forEach((harderSkill) => {
            if (!failedSkills.includes(harderSkill))
              failedSkills.push(harderSkill);
          });
        });
        return failedSkills;
      }, []);
  }

  getAssessedSkills() {
    return _.union(this.getValidatedSkills(), this.getFailedSkills());
  }

  computePixScore() {
    const skillsEvaluated = this.course.competenceSkills;
    const pixScoreBySkill = [];

    skillsEvaluated.forEach((skill) => pixScoreBySkill[skill.name] = skill.computePixScore(skillsEvaluated));
    return this.getValidatedSkills()
      .map((skill) => pixScoreBySkill[skill.name] || 0)
      .reduce((a, b) => a + b, 0);
  }

  isCertifiable() {
    return this.getLastAssessmentResult().level >= 1;
  }

  canStartNewAttemptOnCourse() {
    if(!this.isPlacementAssessment()) throw new Error('Only available for a placement assessment');

    return this.isCompleted() && this.getRemainingDaysBeforeNewAttempt() <= 0;
  }

  getRemainingDaysBeforeNewAttempt() {
    const lastResult = this.getLastAssessmentResult();
    const daysSinceLastCompletedAssessment = moment().diff(lastResult.createdAt, 'days', true);

    const remainingDaysToWait = Math.ceil(MINIMUM_DELAY_IN_DAYS_BETWEEN_TWO_PLACEMENTS - daysSinceLastCompletedAssessment);

    return remainingDaysToWait > 0 ? remainingDaysToWait : 0;
  }

}

Assessment.states = states;
Assessment.types = type;
Assessment.MINIMUM_DELAY_IN_DAYS_BETWEEN_TWO_PLACEMENTS = MINIMUM_DELAY_IN_DAYS_BETWEEN_TWO_PLACEMENTS;

module.exports = Assessment;
