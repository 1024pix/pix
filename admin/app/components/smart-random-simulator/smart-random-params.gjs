import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import PixTextarea from '@1024pix/pix-ui/components/pix-textarea';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { modifier } from 'ember-modifier';
import Joi from 'joi';

import Card from '../card';

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

  onMount = modifier(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const campaignIdSearchQuery = urlParams.get('campaignId');
    if (campaignIdSearchQuery) {
      this.campaignId = campaignIdSearchQuery;
      this.loadCampaignParams();
    }
  });

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
    return this.args.loadCampaignParams(this.campaignId);
  }

  <template>
    <Card class="admin-form__card" @title="Évaluation (campagne ou positionnement)" {{this.onMount}}>

      <div class="load-campaign-params">

        <p>
          Charger les paramètres depuis un identifiant de campagne&nbsp;:
        </p>

        <PixInput
          @id="campaignId"
          @placeholder="12345"
          @value={{this.campaignId}}
          {{on "change" this.updateCampaignIdValue}}
          type="number"
        />

        <PixButton @triggerAction={{this.loadCampaignParams}} @size="small">
          Charger
        </PixButton>

      </div>

      <PixTextarea
        @id="skills"
        @value={{fn this.stringify @skills}}
        spellcheck="false"
        class="form-field"
        placeholder={{this.stringify this.skillsExample}}
        @subLabel={{fn this.stringify this.skillsExample}}
        {{on "change" (fn this.updateJsonFieldValue "skills")}}
        @errorMessage={{this.errors.skills}}
      >
        <:label>Acquis ({{@skills.length}}) :</:label>
      </PixTextarea>

      <PixTextarea
        @id="challenges"
        @value={{fn this.stringify @challenges}}
        spellcheck="false"
        class="form-field"
        placeholder={{this.stringify this.challengesExample}}
        @subLabel={{fn this.stringify this.challengesExample}}
        {{on "change" (fn this.updateJsonFieldValue "challenges")}}
        @errorMessage={{this.errors.challenges}}
      >
        <:label>Épreuves ({{@challenges.length}}) :</:label>
      </PixTextarea>

    </Card>

    <Card class="admin-form__card" @title="Infos de l'utilisateur">
      <PixTextarea
        @id="knowledge-elements"
        class="form-field"
        placeholder={{this.stringify this.knowledgeElementsExample}}
        @subLabel={{fn this.stringify this.knowledgeElementsExample}}
        spellcheck="false"
        @value={{fn this.stringify @knowledgeElements}}
        {{on "change" (fn this.updateJsonFieldValue "knowledgeElements")}}
        @errorMessage={{this.errors.knowledgeElements}}
      >
        <:label>Knowledge elements de l'utilisateur ({{@knowledgeElements.length}}) :</:label>
      </PixTextarea>
      <PixTextarea
        @id="answers"
        @value={{fn this.stringify @answers}}
        spellcheck="false"
        class="form-field"
        placeholder={{this.stringify this.answersExample}}
        @subLabel={{fn this.stringify this.answersExample}}
        {{on "change" (fn this.updateJsonFieldValue "answers")}}
        @errorMessage={{this.errors.answers}}
      >
        <:label>Réponses de l'utilisateur ({{@answers.length}}) :</:label>
      </PixTextarea>
      <PixInput
        @id="assessment-id"
        @value={{@assessmentId}}
        placeholder="12345"
        type="text"
        {{on "change" (fn this.updateFormFieldValue "assessmentId")}}
      >
        <:label>ID de l'assessment</:label>
      </PixInput>
      <PixSelect @options={{this.acceptedLocales}} @onChange={{this.updateLocaleValue}} @value={{@locale}}>
        <:label>Langue de l'utilisateur</:label>
      </PixSelect>
    </Card>
  </template>
}
