const _ = require('lodash');
const KnowledgeElement = require('./KnowledgeElement');

class CertifiableProfileForLearningContent {
  constructor({
    targetProfileWithLearningContent,
    knowledgeElements,
    answerAndChallengeIdsByAnswerId,
  }) {
    this.skillResults = [];
    for (const knowledgeElement of knowledgeElements) {
      const targetedSkill = targetProfileWithLearningContent.getSkill(knowledgeElement.skillId);
      if (targetedSkill) {
        this.skillResults.push(new SkillResult({
          skillId: targetedSkill.id,
          tubeId: targetedSkill.tubeId,
          difficulty: targetedSkill.difficulty,
          createdAt: knowledgeElement.createdAt,
          source: knowledgeElement.source,
          status: knowledgeElement.status,
          earnedPix: knowledgeElement.earnedPix,
          answerId: knowledgeElement.answerId,
          assessmentId: knowledgeElement.assessmentId,
          challengeId: answerAndChallengeIdsByAnswerId[knowledgeElement.answerId].challengeId,
        }));
      }
    }

    const skillResultsByCompetenceId = {};
    const skillResultsGroupedByTubeId = _.groupBy(this.skillResults, 'tubeId');
    for (const [tubeId, skillResults] of Object.entries(skillResultsGroupedByTubeId)) {
      const targetedTube = targetProfileWithLearningContent.getTube(tubeId);
      if (!skillResultsByCompetenceId[targetedTube.competenceId]) skillResultsByCompetenceId[targetedTube.competenceId] = [];
      skillResultsByCompetenceId[targetedTube.competenceId] = [...skillResultsByCompetenceId[targetedTube.competenceId], ...skillResults];
    }

    this.resultsByCompetence = [];
    for (const [competenceId, skillResults] of Object.entries(skillResultsByCompetenceId)) {
      const targetedCompetence = targetProfileWithLearningContent.getCompetence(competenceId);
      this.resultsByCompetence.push(new ResultByCompetence({
        competenceId: targetedCompetence.id,
        areaId: targetedCompetence.areaId,
        origin: targetedCompetence.origin,
        skillResults,
      }));
    }

    this.resultsByArea = [];
    const resultsByCompetenceGroupedByAreaId = _.groupBy(this.resultsByCompetence, 'areaId');
    for (const [areaId, resultsByCompetence] of Object.entries(resultsByCompetenceGroupedByAreaId)) {
      const targetedArea = targetProfileWithLearningContent.getArea(areaId);
      this.resultsByArea.push(new ResultByArea({
        areaId: targetedArea.id,
        resultsByCompetence,
      }));
    }
  }

  getDirectlyValidatedSkillsOrderedByDecreasingDifficultyByAreaId(excludedOrigins = []) {
    const skillIdsByAreaId = {};
    for (const resultByArea of this.resultsByArea) {
      const directlyValidatedSkillsInArea = _.flatMap(resultByArea.resultsByCompetence, (resultByCompetence) => {
        if (resultByCompetence.isNotInOrigins(excludedOrigins)) {
          return resultByCompetence.getDirectlyValidatedSkills();
        }
        return [];
      });

      const directlyValidatedSkillsOrderedByDecreasingDifficultyInArea = _(directlyValidatedSkillsInArea)
        .sortBy('difficulty')
        .reverse()
        .value();
      skillIdsByAreaId[resultByArea.areaId] = _.map(directlyValidatedSkillsOrderedByDecreasingDifficultyInArea, 'skillId');
    }

    return skillIdsByAreaId;
  }

  getAlreadyDirectlyValidatedAnsweredChallengeIds() {
    return _(this.skillResults)
      .filter('isDirectlyValidated')
      .map('challengeId')
      .uniq()
      .value();
  }
}

class SkillResult {
  constructor({
    skillId,
    tubeId,
    difficulty,
    createdAt,
    source,
    status,
    earnedPix,
    answerId,
    assessmentId,
    challengeId,
  }) {
    this.skillId = skillId;
    this.tubeId = tubeId;
    this.difficulty = difficulty;
    this.createdAt = createdAt;
    this.source = source;
    this.status = status;
    this.earnedPix = earnedPix;
    this.answerId = answerId;
    this.assessmentId = assessmentId;
    this.challengeId = challengeId;
  }

  get isDirectlyValidated() {
    return this.source === KnowledgeElement.SourceType.DIRECT && this.status === KnowledgeElement.StatusType.VALIDATED;
  }
}

class ResultByCompetence {
  constructor({
    competenceId,
    areaId,
    origin,
    skillResults = [],
  }) {
    this.competenceId = competenceId;
    this.areaId = areaId;
    this.origin = origin;
    this.skillResults = skillResults;
  }

  isNotInOrigins(origins = []) {
    return !(origins.includes(this.origin));
  }

  getDirectlyValidatedSkills() {
    return _.filter(this.skillResults, 'isDirectlyValidated');
  }
}

class ResultByArea {
  constructor({
    areaId,
    resultsByCompetence = [],
  }) {
    this.areaId = areaId;
    this.resultsByCompetence = resultsByCompetence;
  }
}

module.exports = CertifiableProfileForLearningContent;
