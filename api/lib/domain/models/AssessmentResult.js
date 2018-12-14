const AnswerStatus = require('./AnswerStatus');

const NB_PIX_BY_LEVEL = 8;
const MAX_REACHABLE_LEVEL = 5;

class AssessmentResult {
  // FIXME: assessmentId && juryId to replace by assessment && jury domain objects
  constructor({
    id,
    // attributes
    commentForCandidate,
    commentForJury,
    commentForOrganization,
    createdAt,
    emitter,
    level,
    pixScore,
    status,
    // includes
    competenceMarks = [],
    // references
    assessmentId,
    juryId,
  } = {}) {
    this.id = id;
    // attributes
    this.commentForCandidate = commentForCandidate;
    this.commentForJury = commentForJury;
    this.commentForOrganization = commentForOrganization;
    this.createdAt = createdAt;
    this.emitter = emitter;
    this.level = level;
    this.pixScore = pixScore;
    this.status = status;
    // includes
    this.competenceMarks = competenceMarks;
    // references
    this.assessmentId = assessmentId;
    this.juryId = juryId;
  }

  static BuildAlgoErrorResult(error, assessmentId) {
    return new AssessmentResult({
      emitter: 'PIX-ALGO',
      commentForJury: error.message,
      level: 0,
      pixScore: 0,
      status: 'error',
      assessmentId,
    });
  }

  static BuildStandardAssessmentResult(level, pixScore, status, assessmentId) {
    return new AssessmentResult({
      emitter: 'PIX-ALGO',
      commentForJury: 'Computed',
      level: level,
      pixScore: pixScore,
      status,
      assessmentId,
    });
  }

  static ComputePixScore(competenceSkills, challenges, answers, tubes) {
    const pixScoreBySkill = [];

    competenceSkills.forEach((skill) => pixScoreBySkill[skill.name] = skill.computePixScore(competenceSkills));

    const realScore = AssessmentResult.GetValidatedSkills(answers, challenges, tubes)
      .map((skill) => pixScoreBySkill[skill.name] || 0)
      .reduce((a, b) => a + b, 0);

    return Math.floor(realScore);
  }

  static ComputeLevel(pixScore) {
    return Math.floor(pixScore / NB_PIX_BY_LEVEL);
  }

  static ComputeCeilingLevel(level) {
    return (level >= MAX_REACHABLE_LEVEL) ? MAX_REACHABLE_LEVEL : level;
  }

  static GetValidatedSkills(answers, challenges, tubes) {
    return answers
      .filter((answer) => AnswerStatus.isOK(answer.result))
      .reduce((validatedSkills, answer) => {
        challenges
          .filter((challenge) => challenge.id === answer.challengeId)
          .filter((challenge) => challenge.skills)
          .map((challenge) => {
            challenge.skills.forEach((skill) => {
              const tube = tubes.find((t) => t.name === skill.tubeName);
              tube.getEasierThan(skill).forEach((easierSkill) => {
                if (!validatedSkills.includes(easierSkill))
                  validatedSkills.push(easierSkill);
              });
            });
          });
        return validatedSkills;
      }, []);
  }

  static GetFailedSkills(answers, challenges, tubes) {
    // FIXME refactor !
    // XXX we take the current failed skill and all the harder skills in
    // its tube and mark them all as failed
    return answers
      .filter((answer) => AnswerStatus.isFailed(answer.result))
      .reduce((validatedSkills, answer) => {
        challenges
          .filter((challenge) => challenge.id === answer.challengeId)
          .filter((challenge) => challenge.skills)
          .map((challenge) => {
            challenge.skills.forEach((skill) => {
              const tube = tubes.find((tube) => tube.name === skill.tubeName);
              tube.getHarderThan(skill).forEach((easierSkill) => {
                if (!validatedSkills.includes(easierSkill))
                  validatedSkills.push(easierSkill);
              });
            });
          });
        return validatedSkills;
      }, []);
  }
}

AssessmentResult.NB_PIX_BY_LEVEL = NB_PIX_BY_LEVEL;
AssessmentResult.MAX_REACHABLE_LEVEL = MAX_REACHABLE_LEVEL;

module.exports = AssessmentResult;
