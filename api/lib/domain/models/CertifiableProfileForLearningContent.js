const _ = require('lodash');
const KnowledgeElement = require('./KnowledgeElement');

class CertifiableProfileForLearningContent {
  constructor({
    userId,
    profileDate,
    targetProfileWithLearningContent,
    knowledgeElements,
    answerAndChallengeIdsByAnswerId,
  }) {
    this.userId = userId;
    this.profileDate = profileDate;
    this.targetProfileWithLearningContent = targetProfileWithLearningContent;

    this.skills = [];
    for (const knowledgeElement of knowledgeElements) {
      const targetedSkill = targetProfileWithLearningContent.getSkill(knowledgeElement.skillId);
      if (targetedSkill) {
        this.skills.push(new Skill({
          targetedSkill,
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

    this.tubes = [];
    const skillsGroupedByTubeId = _.groupBy(this.skills, 'targetedSkill.tubeId');
    for (const [tubeId, skills] of Object.entries(skillsGroupedByTubeId)) {
      const targetedTube = targetProfileWithLearningContent.getTube(tubeId);
      this.tubes.push(new Tube({
        targetedTube,
        skills,
      }));
    }

    this.competences = [];
    const tubesGroupedByCompetenceId = _.groupBy(this.tubes, 'targetedTube.competenceId');
    for (const [competenceId, tubes] of Object.entries(tubesGroupedByCompetenceId)) {
      const targetedCompetence = targetProfileWithLearningContent.getCompetence(competenceId);
      this.competences.push(new Competences({
        targetedCompetence,
        tubes,
      }));
    }

    this.areas = [];
    const competencesGroupedByAreaId = _.groupBy(this.competences, 'targetedCompetence.areaId');
    for (const [areaId, competences] of Object.entries(competencesGroupedByAreaId)) {
      const targetedArea = targetProfileWithLearningContent.getArea(areaId);
      this.areas.push(new Area({
        targetedArea,
        competences,
      }));
    }
  }

  getDirectlyValidatedSkillsOrderedByDecreasingDifficultyByAreaId(excludedOrigins = []) {
    const skillIdsByAreaId = {};
    for (const area of this.areas) {
      let directlyValidatedSkillsInArea = [];
      for (const competence of area.competences) {
        if (competence.isNotInOrigins(excludedOrigins)) {
          const directlyValidatedSkillsInCompetence = competence.getDirectlyValidatedSkills();
          directlyValidatedSkillsInArea = [...directlyValidatedSkillsInArea, ...directlyValidatedSkillsInCompetence];
        }
      }

      const directlyValidatedSkillsOrderedByDecreasingDifficultyInArea = _(directlyValidatedSkillsInArea)
        .sortBy('difficulty')
        .reverse()
        .value();
      skillIdsByAreaId[area.id] = _.map(directlyValidatedSkillsOrderedByDecreasingDifficultyInArea, 'id');
    }

    return skillIdsByAreaId;
  }

  getAlreadyDirectlyValidatedAnsweredChallengeIds() {
    return _(this.skills)
      .filter('isDirectlyValidated')
      .map('challengeId')
      .uniq()
      .value();
  }
}

class Skill {
  constructor({
    targetedSkill,
    createdAt,
    source,
    status,
    earnedPix,
    answerId,
    assessmentId,
    challengeId,
  }) {
    this.targetedSkill = targetedSkill;
    this.createdAt = createdAt;
    this.source = source;
    this.status = status;
    this.earnedPix = earnedPix;
    this.answerId = answerId;
    this.assessmentId = assessmentId;
    this.challengeId = challengeId;
  }

  get id() {
    return this.targetedSkill.id;
  }

  get isDirectlyValidated() {
    return this.source === KnowledgeElement.SourceType.DIRECT && this.status === KnowledgeElement.StatusType.VALIDATED;
  }

  get difficulty() {
    return this.targetedSkill.difficulty;
  }
}

class Tube {
  constructor({
    targetedTube,
    skills = [],
  }) {
    this.targetedTube = targetedTube;
    this.skills = skills;
  }

  getDirectlyValidatedSkills() {
    return _.filter(this.skills, 'isDirectlyValidated');
  }
}

class Competences {
  constructor({
    targetedCompetence,
    tubes = [],
  }) {
    this.targetedCompetence = targetedCompetence;
    this.tubes = tubes;
  }

  isNotInOrigins(origins = []) {
    return !(origins.includes(this.targetedCompetence.origin));
  }

  getDirectlyValidatedSkills() {
    let directlyValidatedSkills = [];
    for (const tube of this.tubes) {
      directlyValidatedSkills = [...directlyValidatedSkills, ...tube.getDirectlyValidatedSkills()];
    }

    return directlyValidatedSkills;
  }
}

class Area {
  constructor({
    targetedArea,
    competences = [],
  }) {
    this.targetedArea = targetedArea;
    this.competences = competences;
  }

  get id() {
    return this.targetedArea.id;
  }
}

module.exports = CertifiableProfileForLearningContent;
