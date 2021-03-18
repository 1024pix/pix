const _ = require('lodash');

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
}

class Tube {
  constructor({
    targetedTube,
    skills = [],
  }) {
    this.targetedTube = targetedTube;
    this.skills = skills;
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
}

class Area {
  constructor({
    targetedArea,
    competences = [],
  }) {
    this.targetedArea = targetedArea;
    this.competences = competences;
  }
}

module.exports = CertifiableProfileForLearningContent;
