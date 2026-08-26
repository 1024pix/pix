import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { skillStatusInKnowledgeState, tubeIdOfSkill } from 'pix-admin/utils/knowledge-state';

const GET_NEXT_CHALLENGE_API_ROUTE = '/api/admin/smart-random-simulator/get-next-challenge';
const GET_CAMPAIGN_PARAMS_API_ROUTE = '/api/admin/smart-random-simulator/campaign-parameters';

const ANSWER_STATUSES = { OK: 'ok', KO: 'ko' };

export default class SmartRandomSimulator extends Controller {
  @service session;
  @service pixToast;

  // Simulator parameters
  @tracked skills = [];
  @tracked answers = [];
  @tracked challenges = [];
  @tracked knowledgeState = [];
  @tracked locale = 'fr-fr';
  @tracked assessmentId = '1';

  // Simulator response
  @tracked returnedChallenges = [];
  @tracked assessmentComplete = false;
  @tracked smartRandomLog = null;
  @tracked displayedStepIndex = 0;
  @tracked pixScore = 0;

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
    this.knowledgeState = [];
    this.returnedChallenges = [];
    this.assessmentComplete = false;
    this.pixScore = 0;
    return await this.requestNextChallenge();
  }

  @action
  selectDisplayedStepIndex(value) {
    this.displayedStepIndex = value;
  }

  @action
  async loadCampaignParams(campaignId) {
    const apiResponse = await window.fetch(`${GET_CAMPAIGN_PARAMS_API_ROUTE}/${this.locale}/${campaignId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.session.data.authenticated.access_token}`,
      },
    });

    if (apiResponse.status === 200) {
      const responseBody = await apiResponse.json();
      this.skills = responseBody.skills;
      this.challenges = responseBody.challenges;
      this.pixToast.sendSuccessNotification({
        message: `Données chargées: ${this.skills.length} compétences et ${this.challenges.length} challenges`,
      });
      return;
    }

    const response = await apiResponse.json();
    response.errors.map(({ detail }) => {
      this.pixToast.sendErrorNotification({ message: detail });
    });
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
        accumulator.push({
          name: tubeName,
          skills: [skill],
        });
        return accumulator;
      }

      accumulator[accumulatorIndex].skills.push(skill);
      return accumulator;
    }, []);
  }

  get numberOfSkillsStillAvailable() {
    return this.skills.filter((skill) => skillStatusInKnowledgeState(this.knowledgeState, skill) === null).length;
  }

  get totalNumberOfSkills() {
    return this.skills.length;
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
            knowledgeState: this.knowledgeState,
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
      case 200: {
        const responseBody = await apiResponse.json();
        this.smartRandomLog = responseBody.smartRandomLog;
        this.pixScore = responseBody.pixScore;
        this.displayedStepIndex = this.smartRandomLog.steps.length - 1;
        if (!responseBody.challenge) {
          this.assessmentComplete = true;
          break;
        }
        this.returnedChallenges = [...this.returnedChallenges, responseBody.challenge];
        break;
      }
      default: {
        const response = await apiResponse.json();
        return response.errors.map(({ detail }) => {
          this.pixToast.sendErrorNotification({ message: detail });
        });
      }
    }
  }

  async answerCurrentChallenge(answerStatus = ANSWER_STATUSES.OK) {
    this.returnedChallenges[this.returnedChallenges.length - 1].result = answerStatus;
    this.addNewAnswer(answerStatus);
    this.applyAnswerToKnowledgeState(answerStatus === ANSWER_STATUSES.OK);
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

  // Mêmes règles que KnowledgeState.withAnswer côté API : le plancher monte
  // sur une bonne réponse, le plafond descend sur une mauvaise, et un plafond
  // contredit par le plancher s'efface
  applyAnswerToKnowledgeState(isOk) {
    const skill = this.currentChallenge.skill;
    const tubeId = tubeIdOfSkill(skill);
    const previousBounds = this.knowledgeState.find((bounds) => bounds.tubeId === tubeId) ?? {
      tubeId,
      floor: 0,
      ceiling: null,
      directLevels: [],
    };

    const bounds = { ...previousBounds, directLevels: [...new Set([...previousBounds.directLevels, skill.difficulty])] };
    if (isOk) {
      bounds.floor = Math.max(bounds.floor, skill.difficulty);
    } else {
      bounds.ceiling = bounds.ceiling === null ? skill.difficulty : Math.min(bounds.ceiling, skill.difficulty);
    }
    if (bounds.ceiling !== null && bounds.ceiling <= bounds.floor) {
      bounds.ceiling = null;
    }

    this.knowledgeState = [...this.knowledgeState.filter((otherBounds) => otherBounds.tubeId !== tubeId), bounds];
  }

  getTubeNameFromSkillName(skillName) {
    return skillName.slice(0, -1);
  }
}
