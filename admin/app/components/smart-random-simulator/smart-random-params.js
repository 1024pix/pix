import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import Joi from 'joi';

export default class SmartRandomParams extends Component {
  @tracked errors = {};
  @tracked campaignId = 1;

  acceptedLocales = [
    { value: 'en', label: 'en' },
    { value: 'fr', label: 'fr' },
    { value: 'fr-fr', label: 'fr-fr' },
    { value: 'nl', label: 'nl' },
  ];
  skillsExample = [{ id: 'skillId', name: '@requete2', difficulty: 3 }];
  challengesExample = [
    {
      id: 'rec1xAgCoZux1Lxq8',
      skill: { name: '@requete2', difficulty: 2, id: 'skillId' },
      locales: ['fr-fr'],
    },
  ];
  knowledgeElementsExample = [
    {
      id: 'rec1xAgCoZux1Lxq8',
      source: 'direct',
      status: 'validated',
      skillId: 'skill123',
      answerId: '12345',
    },
  ];
  answersExample = [
    { id: '12345', result: 'ok', assessmentId: 123456, challengeId: 'rec1234567', value: 'User answer' },
  ];

  validationSchema = {
    skills: Joi.array()
      .items({
        id: Joi.string().required(),
        difficulty: Joi.number().integer().min(1).max(8).required(),
        name: Joi.string().required(),
      })
      .min(1)
      .required(),
    challenges: Joi.array()
      .items({
        id: Joi.string().required(),
        timer: Joi.number(),
        skill: {
          id: Joi.string().required(),
          name: Joi.string().required(),
        },
        locales: Joi.array()
          .items(Joi.string().valid(...this.acceptedLocales.map((locale) => locale.value)))
          .required(),
      })
      .min(1)
      .required(),
    knowledgeElements: Joi.array()
      .items({
        source: Joi.string().valid('direct', 'inferred').required(),
        status: Joi.string().valid('validated', 'invalidated', 'reset').required(),
        answerId: Joi.number().required(),
        skillId: Joi.string().required(),
      })
      .required(),
    answers: Joi.array()
      .items({
        id: Joi.number().required(),
        result: Joi.string().valid('ok', 'ko', 'aband', 'timedout', 'focusedOut').required(),
        challengeId: Joi.string().required(),
      })
      .required(),
  };

  stringify(value) {
    return JSON.stringify(value);
  }

  @action
  loadParamsFromCampaignIdSearchQuery() {
    const urlParams = new URLSearchParams(window.location.search);
    const campaignIdSearchQuery = urlParams.get('campaignId');
    if (campaignIdSearchQuery) {
      this.campaignId = campaignIdSearchQuery;
      this.loadCampaignParams();
    }
  }

  @action
  updateJsonFieldValue(key, event) {
    const value = event.target.value;
    delete this.errors[key];
    // necessary to trigger a reactivity update
    this.errors = { ...this.errors };
    try {
      const parsedValue = JSON.parse(value);
      Joi.assert(parsedValue, this.validationSchema[key], { allowUnknown: true });
      this.args.updateParametersValue(key, parsedValue);
    } catch (error) {
      switch (error.constructor) {
        case SyntaxError:
          this.errors[key] = 'Invalid JSON';
          break;
        default:
          this.errors[key] = error.message;
      }
    }
  }

  @action
  updateFormFieldValue(key, event) {
    this.args.updateParametersValue(key, event.target.value);
  }

  @action
  updateCampaignIdValue(event) {
    this.campaignId = event.target.value;
  }

  @action updateLocaleValue(value) {
    this.args.updateParametersValue('locale', value);
  }

  @action loadCampaignParams() {
    this.args.loadCampaignParams(this.campaignId);
  }
}
