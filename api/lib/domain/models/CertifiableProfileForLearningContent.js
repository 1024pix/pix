import _ from 'lodash';
import KnowledgeElement from './KnowledgeElement';

class CertifiableProfileForLearningContent {
  constructor({ learningContent, knowledgeElements, answerAndChallengeIdsByAnswerId }) {
    this.skillResults = [];
    for (const knowledgeElement of knowledgeElements) {
      const skill = learningContent.findSkill(knowledgeElement.skillId);
      if (skill) {
        this.skillResults.push(
          new SkillResult({
            skillId: skill.id,
            tubeId: skill.tubeId,
            difficulty: skill.difficulty,
            createdAt: knowledgeElement.createdAt,
            source: knowledgeElement.source,
            status: knowledgeElement.status,
            earnedPix: knowledgeElement.earnedPix,
            answerId: knowledgeElement.answerId,
            assessmentId: knowledgeElement.assessmentId,
            challengeId: answerAndChallengeIdsByAnswerId[knowledgeElement.answerId].challengeId,
          })
        );
      }
    }

    const skillResultsByCompetenceId = {};
    const skillResultsGroupedByTubeId = _.groupBy(this.skillResults, 'tubeId');
    for (const [tubeId, skillResults] of Object.entries(skillResultsGroupedByTubeId)) {
      const tube = learningContent.findTube(tubeId);
      if (!skillResultsByCompetenceId[tube.competenceId]) skillResultsByCompetenceId[tube.competenceId] = [];
      skillResultsByCompetenceId[tube.competenceId] = [
        ...skillResultsByCompetenceId[tube.competenceId],
        ...skillResults,
      ];
    }

    this.resultsByCompetence = [];
    for (const [competenceId, skillResults] of Object.entries(skillResultsByCompetenceId)) {
      const competence = learningContent.findCompetence(competenceId);
      this.resultsByCompetence.push(
        new ResultByCompetence({
          competenceId: competence.id,
          areaId: competence.areaId,
          origin: competence.origin,
          skillResults,
        })
      );
    }

    this.resultsByArea = [];
    const resultsByCompetenceGroupedByAreaId = _.groupBy(this.resultsByCompetence, 'areaId');
    for (const [areaId, resultsByCompetence] of Object.entries(resultsByCompetenceGroupedByAreaId)) {
      const area = learningContent.findArea(areaId);
      this.resultsByArea.push(
        new ResultByArea({
          areaId: area.id,
          resultsByCompetence,
        })
      );
    }
  }

  getOrderedCertifiableSkillsByDecreasingDifficultyGroupedByAreaId(excludedOrigins = []) {
    const skillIdsByAreaId = {};
    for (const resultByArea of this.resultsByArea) {
      const certifiableSkillsForArea = this._getCertifiableSkillsForArea(resultByArea, excludedOrigins);
      const certifiableOrderedSkillsInArea = this._orderSkillsByDecreasingDifficulty(certifiableSkillsForArea);
      skillIdsByAreaId[resultByArea.areaId] = _.map(certifiableOrderedSkillsInArea, 'skillId');
    }

    return skillIdsByAreaId;
  }

  _getCertifiableSkillsForArea(resultByArea, excludedOrigins) {
    return _.flatMap(resultByArea.resultsByCompetence, (resultByCompetence) => {
      if (resultByCompetence.isNotInOrigins(excludedOrigins)) {
        return resultByCompetence.getDirectlyValidatedSkills();
      }
      return [];
    });
  }

  _orderSkillsByDecreasingDifficulty(skills) {
    return _(skills).sortBy('difficulty').reverse().value();
  }

  getAlreadyAnsweredChallengeIds() {
    return _(this.skillResults).filter('isDirectlyValidated').map('challengeId').uniq().value();
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
  constructor({ competenceId, areaId, origin, skillResults = [] }) {
    this.competenceId = competenceId;
    this.areaId = areaId;
    this.origin = origin;
    this.skillResults = skillResults;
  }

  isNotInOrigins(origins = []) {
    return !origins.includes(this.origin);
  }

  getDirectlyValidatedSkills() {
    return _.filter(this.skillResults, 'isDirectlyValidated');
  }
}

class ResultByArea {
  constructor({ areaId, resultsByCompetence = [] }) {
    this.areaId = areaId;
    this.resultsByCompetence = resultsByCompetence;
  }
}

export default CertifiableProfileForLearningContent;
