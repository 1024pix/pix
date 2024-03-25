import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

const GET_NEXT_CHALLENGE_API_ROUTE = '/api/admin/smart-random-simulator/get-next-challenge';

const ANSWER_STATUSES = { OK: 'ok', KO: 'ko' };
const KNOWLEDGE_ELEMENTS_STATUSES = { VALIDATED: 'validated', INVALIDATED: 'invalidated' };
const KNOWLEDGE_ELEMENTS_SOURCES = { DIRECT: 'direct', INFERRED: 'inferred' };
const MAX_TUBE_LEVEL = 8;

const SKILLS_STATUSES = {
  PRESENT: 'present',
  MISSING: 'missing',
  DIRECT_VALIDATED: 'direct_validated',
  DIRECT_INVALIDATED: 'direct_invalidated',
  INDIRECT_VALIDATED: 'direct_validated',
  INDIRECT_INVALIDATED: 'direct_validated',
};

export default class SmartRandomSimulator extends Controller {
  @service session;
  @service notifications;

  // Simulator parameters
  @tracked skills = [];
  @tracked answers = [];
  @tracked challenges = [];
  @tracked knowledgeElements = [];

  @tracked locale = 'fr-fr';
  @tracked assessmentId = '';

  // Simulator response
  @tracked returnedChallenges = [];

  @tracked assessmentComplete = false;

  @action
  async updateParametersValue(key, value) {
    this[key] = value;
  }

  @action
  async startAssessment() {
    return await this.requestNextChallenge();
  }

  @action
  async succeedCurrentChallenge() {
    return await this.answerCurrentChallenge(ANSWER_STATUSES.OK);
  }

  @action
  async failCurrentChallenge() {
    return await this.answerCurrentChallenge(ANSWER_STATUSES.KO);
  }

  @action
  async reset() {
    this.answers = [];
    this.knowledgeElements = [];
    this.returnedChallenges = [];
    this.assessmentComplete = false;
    return await this.requestNextChallenge();
  }

  get previousChallenges() {
    return this.assessmentComplete ? this.returnedChallenges : this.returnedChallenges.slice(0, -1);
  }

  get currentChallenge() {
    return this.assessmentComplete ? null : this.returnedChallenges[this.returnedChallenges.length - 1];
  }

  get skillsByTube() {
    return this.skills.reduce((accumulator, skill) => {
      const tubeName = this.getTubeNameFromSkillName(skill.name);
      const accumulatorIndex = accumulator.findIndex((tube) => tube.name === tubeName);

      if (accumulatorIndex === -1) {
        const skills = Array.from({ length: MAX_TUBE_LEVEL }, (_, index) => index + 1).map((difficulty) => ({
          difficulty,
          status: difficulty === skill.difficulty ? SKILLS_STATUSES.PRESENT : SKILLS_STATUSES.MISSING,
        }));

        accumulator.push({ name: tubeName, skills });

        return accumulator;
      }

      accumulator[accumulatorIndex].skills[skill.difficulty - 1].status = SKILLS_STATUSES.PRESENT;
      return accumulator;
    }, []);
  }

  async requestNextChallenge() {
    const apiResponse = await window.fetch(GET_NEXT_CHALLENGE_API_ROUTE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.session.data.authenticated.access_token}`,
      },
      body: JSON.stringify({
        data: {
          attributes: {
            knowledgeElements: this.knowledgeElements,
            answers: this.answers,
            skills: this.skills,
            challenges: this.challenges,
            locale: this.locale,
            assessmentId: this.assessmentId,
          },
        },
      }),
    });

    switch (apiResponse.status) {
      case 204: {
        this.assessmentComplete = true;
        break;
      }
      case 200: {
        this.returnedChallenges = [...this.returnedChallenges, await apiResponse.json()];
        break;
      }
      default: {
        const response = await apiResponse.json();
        return response.errors.map(({ detail }) => {
          this.notifications.error(detail);
        });
      }
    }
  }

  async answerCurrentChallenge(answerStatus = ANSWER_STATUSES.OK) {
    this.returnedChallenges[this.returnedChallenges.length - 1].result = answerStatus;
    const newAnswer = this.addNewAnswer(answerStatus);
    this.addNewKnowledgeElements(newAnswer);
    return await this.requestNextChallenge();
  }

  addNewAnswer(result = ANSWER_STATUSES.OK) {
    const newAnswer = {
      id: Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000,
      result,
      challengeId: this.currentChallenge.id,
    };
    this.answers = [...this.answers, newAnswer];
    return newAnswer;
  }

  addNewKnowledgeElements(newAnswer) {
    const directNewKnowledgeElement = {
      source: KNOWLEDGE_ELEMENTS_SOURCES.DIRECT,
      status:
        newAnswer.result === ANSWER_STATUSES.OK
          ? KNOWLEDGE_ELEMENTS_STATUSES.VALIDATED
          : KNOWLEDGE_ELEMENTS_STATUSES.INVALIDATED,
      answerId: newAnswer.id,
      skillId: this.currentChallenge.skill.id,
    };

    const currentSkillTested = this.currentChallenge.skill;
    const currentSkillTubeName = this.getTubeNameFromSkillName(currentSkillTested.name);
    const currentChallengeSkillDifficulty = this.currentChallenge.skill.difficulty;
    const inferredSkills =
      newAnswer.result === ANSWER_STATUSES.OK
        ? this.getLowerLevelSkillsFromSameTube(currentSkillTubeName, currentChallengeSkillDifficulty)
        : this.getHigherLevelSkillsFromSameTube(currentSkillTubeName, currentChallengeSkillDifficulty);

    const inferredNewKnowledgeElements = inferredSkills.map((skill) => ({
      source: KNOWLEDGE_ELEMENTS_SOURCES.INFERRED,
      status:
        newAnswer.result === ANSWER_STATUSES.OK
          ? KNOWLEDGE_ELEMENTS_STATUSES.VALIDATED
          : KNOWLEDGE_ELEMENTS_STATUSES.INVALIDATED,
      answerId: newAnswer.id,
      skillId: skill.id,
    }));

    this.knowledgeElements = [...this.knowledgeElements, directNewKnowledgeElement, ...inferredNewKnowledgeElements];
  }

  getLowerLevelSkillsFromSameTube(currentSkillTubeName, currentChallengeSkillDifficulty) {
    return this.skills.filter(
      (skill) =>
        this.getTubeNameFromSkillName(skill.name) === currentSkillTubeName &&
        skill.difficulty < currentChallengeSkillDifficulty,
    );
  }
  getHigherLevelSkillsFromSameTube(currentSkillTubeName, currentChallengeSkillDifficulty) {
    return this.skills.filter(
      (skill) =>
        this.getTubeNameFromSkillName(skill.name) === currentSkillTubeName &&
        skill.difficulty > currentChallengeSkillDifficulty,
    );
  }

  getTubeNameFromSkillName(skillName) {
    return skillName.slice(0, -1);
  }
}
