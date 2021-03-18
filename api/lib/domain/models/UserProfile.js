const _ = require('lodash');
const KnowledgeElement = require('./KnowledgeElement');

class UserProfile {
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

    this.userSkills = [];
    for (const knowledgeElement of knowledgeElements) {
      const targetedSkill = targetProfileWithLearningContent.getSkill(knowledgeElement.skillId);
      if (targetedSkill) {
        this.userSkills.push(new UserSkill({
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

    this.userTubes = [];
    const skillsGroupedByTubeId = _.groupBy(this.userSkills, 'targetedSkill.tubeId');
    for (const [tubeId, userSkills] of Object.entries(skillsGroupedByTubeId)) {
      const targetedTube = targetProfileWithLearningContent.getTube(tubeId);
      this.userTubes.push(new UserTube({
        targetedTube,
        userSkills,
      }));
    }

    this.userCompetences = [];
    const tubesGroupedByCompetenceId = _.groupBy(this.userTubes, 'targetedTube.competenceId');
    for (const [competenceId, userTubes] of Object.entries(tubesGroupedByCompetenceId)) {
      const targetedCompetence = targetProfileWithLearningContent.getCompetence(competenceId);
      this.userCompetences.push(new UserCompetence({
        targetedCompetence,
        userTubes,
      }));
    }

    this.userAreas = [];
    const competencesGroupedByAreaId = _.groupBy(this.userCompetences, 'targetedCompetence.areaId');
    for (const [areaId, userCompetences] of Object.entries(competencesGroupedByAreaId)) {
      const targetedArea = targetProfileWithLearningContent.getArea(areaId);
      this.userAreas.push(new UserArea({
        targetedArea,
        userCompetences,
      }));
    }
  }

  getDirectlyValidatedSkillsOrderedByDecreasingDifficultyByAreaId({ origin = null } = {}) {
    const skillIdsByAreaId = {};
    for (const userArea of this.userAreas) {
      let directlyValidatedSkillsInArea = [];
      for (const userCompetence of userArea.userCompetences) {
        if (userCompetence.isOfOrigin(origin)) {
          const directlyValidatedSkillsInCompetence = userCompetence.getDirectlyValidatedSkills();
          directlyValidatedSkillsInArea = [...directlyValidatedSkillsInArea, ...directlyValidatedSkillsInCompetence];
        }
      }

      const directlyValidatedSkillsOrderedByDecreasingDifficultyInArea = _(directlyValidatedSkillsInArea)
        .sortBy('difficulty')
        .reverse()
        .value();
      skillIdsByAreaId[userArea.id] = _.map(directlyValidatedSkillsOrderedByDecreasingDifficultyInArea, 'id');
    }

    return skillIdsByAreaId;
  }
}

class UserSkill {
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

class UserTube {
  constructor({
    targetedTube,
    userSkills = [],
  }) {
    this.targetedTube = targetedTube;
    this.userSkills = userSkills;
  }

  getDirectlyValidatedSkills() {
    return _.filter(this.userSkills, 'isDirectlyValidated');
  }
}

class UserCompetence {
  constructor({
    targetedCompetence,
    userTubes = [],
  }) {
    this.targetedCompetence = targetedCompetence;
    this.userTubes = userTubes;
  }

  isOfOrigin(origin) {
    if (!origin) return true;
    return this.targetedCompetence.origin === origin;
  }

  getDirectlyValidatedSkills() {
    let directlyValidatedSkills = [];
    for (const userTube of this.userTubes) {
      directlyValidatedSkills = [...directlyValidatedSkills, ...userTube.getDirectlyValidatedSkills()];
    }

    return directlyValidatedSkills;
  }
}

class UserArea {
  constructor({
    targetedArea,
    userCompetences = [],
  }) {
    this.targetedArea = targetedArea;
    this.userCompetences = userCompetences;
  }

  get id() {
    return this.targetedArea.id;
  }
}

module.exports = UserProfile;
