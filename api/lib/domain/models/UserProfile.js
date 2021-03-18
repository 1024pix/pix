const _ = require('lodash');

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
}

class UserTube {
  constructor({
    targetedTube,
    userSkills = [],
  }) {
    this.targetedTube = targetedTube;
    this.userSkills = userSkills;
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
}

class UserArea {
  constructor({
    targetedArea,
    userCompetences = [],
  }) {
    this.targetedArea = targetedArea;
    this.userCompetences = userCompetences;
  }
}

module.exports = UserProfile;
