const scoringUtils = require('./scoring-utils.js');
const AssessmentScore = require('../../models/AssessmentScore');
const CompetenceMark = require('../../models/CompetenceMark');

module.exports = {

  async calculate({ answerRepository, challengeRepository, competenceRepository, courseRepository, skillRepository }, assessment) {

    // 1. Fetch data

    const course = await courseRepository.get(assessment.courseId);

    const [answers, challenges, competence, competenceSkills] = await Promise.all([
      answerRepository.findByAssessment(assessment.id),
      challengeRepository.findByCompetenceId(course.competences[0]),
      competenceRepository.get(course.competences[0]),
      skillRepository.findByCompetenceId(course.competences[0]),
    ]);
    course.competenceSkills = competenceSkills;
    course.computeTubes(course.competenceSkills);

    // 2. Process data

    const validatedSkills = scoringUtils.getValidatedSkills(answers, challenges, course.tubes);

    const failedSkills = scoringUtils.getFailedSkills(answers, challenges, course.tubes);

    const nbPix = scoringUtils.computeObtainedPixScore(course.competenceSkills, validatedSkills);

    const level = scoringUtils.computeLevel(nbPix);

    const successRate = scoringUtils.computeAnswersSuccessRate(answers);

    const competenceMarks = [new CompetenceMark({
      level: level,
      score: nbPix,
      area_code: competence.area.code,
      competence_code: competence.index
    })];

    // 3. Format response

    return new AssessmentScore({
      level,
      nbPix,
      successRate,
      validatedSkills,
      failedSkills,
      competenceMarks,
    });
  }
};
