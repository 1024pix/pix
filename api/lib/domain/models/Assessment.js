const _ = require('lodash');
const AnswerStatus = require('./AnswerStatus');
const { ObjectValidationError } = require('../errors');

const TYPES_OF_ASSESSMENT_NEEDING_USER = ['PLACEMENT', 'CERTIFICATION'];

const states = {
  COMPLETED: 'completed',
  STARTED: 'started'
};

const type = {
  PLACEMENT: 'PLACEMENT',
  SMARTPLACEMENT: 'SMART_PLACEMENT',
  CERTIFICATION: 'CERTIFICATION',
  DEMO: 'DEMO',
  PREVIEW: 'PREVIEW',
};

class Assessment {

/*
 * TODO: changer the Object.assign en quelque chose de plus expressif
 * Complétez la liste des attributs de la classe Assessment
 *
 * id: String,
 * course : associatedCourse (Class Course)
 * createdAt: Date
 * updatedAt: Date
 * user: ? (class User ?)
 * successRate: 24, ?? Je ne sais pas ce que c'est
 * type: 'charade', String ?
 * state: String
 */
  constructor(attributes) {
    Object.assign(this, attributes);
  }

  isCompleted() {
    return this.state === Assessment.states.COMPLETED;
  }

  getLastAssessmentResult() {
    if (this.assessmentResults) {
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

  validate() {
    if (TYPES_OF_ASSESSMENT_NEEDING_USER.includes(this.type) && !this.userId) {
      return Promise.reject(new ObjectValidationError(`Assessment ${this.type} needs an User Id`));
    }
    return Promise.resolve();
  }

  isSmartPlacementAssessment() {
    return this.type === type.SMARTPLACEMENT;
  }

  addAnswersWithTheirChallenge(answers, challenges) {
    this.answers = answers;
    this.answers.forEach(answer => {
      answer.challenge = challenges.filter(challenge => challenge.id === answer.challengeId)[0];
    });
  }

  getValidatedSkills() {
    return this.answers
      .filter(answer => AnswerStatus.isOK(answer.result))
      .reduce((skills, answer) => {
        answer.challenge.skills.forEach(skill => {
          skill.getEasierWithin(this.course.tubes).forEach(validatedSkill => {
            if (!skills.includes(validatedSkill))
              skills.push(validatedSkill);
          });
        });
        return skills;
      }, []);
  }

  getFailedSkills() {
    return this.answers
      .filter(answer => AnswerStatus.isFailed(answer.result))
      .reduce((failedSkills, answer) => {
        // FIXME refactor !
        // XXX we take the current failed skill and all the harder skills in
        // its tube and mark them all as failed
        answer.challenge.skills.forEach(skill => {
          skill.getHarderWithin(this.course.tubes).forEach(failedSkill => {
            if (!failedSkills.includes(failedSkill))
              failedSkills.push(failedSkill);
          });
        });
        return failedSkills;
      }, []);
  }

  computePixScore() {
    const skillsEvaluated = this.course.competenceSkills;
    const pixScoreBySkill = [];

    skillsEvaluated.forEach(skill => pixScoreBySkill[skill.name] = skill.computePixScore(skillsEvaluated));
    return this.getValidatedSkills()
      .map(skill => pixScoreBySkill[skill.name] || 0)
      .reduce((a, b) => a + b, 0);
  }

}

Assessment.states = states;

module.exports = Assessment;
