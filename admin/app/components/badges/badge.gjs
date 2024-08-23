import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import PixTextarea from '@1024pix/pix-ui/components/pix-textarea';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import pick from 'ember-composable-helpers/helpers/pick';
import toggle from 'ember-composable-helpers/helpers/toggle';
import { t } from 'ember-intl';
import set from 'ember-set-helper/helpers/set';
import { not } from 'ember-truth-helpers';

import CampaignCriterion from './campaign-criterion';
import CappedTubesCriterion from './capped-tubes-criterion';

export default class Badge extends Component {
  @service notifications;
  @service store;
  @service intl;

  @tracked editMode = false;
  @tracked form = {};
  @tracked criteria = [];

  constructor() {
    super(...arguments);
    Promise.resolve(this.args.badge.criteria).then((criteria) => {
      this.criteria = criteria;
    });
  }

  IMAGE_BASE_URL = 'https://images.pix.fr/badges/';

  get isCertifiableColor() {
    return this.args.badge.isCertifiable ? 'tertiary' : null;
  }

  get isAlwaysVisibleColor() {
    return this.args.badge.isAlwaysVisible ? 'tertiary' : null;
  }

  get isCertifiableText() {
    return this.args.badge.isCertifiable ? 'Certifiable' : 'Non certifiable';
  }

  get isAlwaysVisibleText() {
    return this.args.badge.isAlwaysVisible ? 'Lacunes' : null;
  }

  get imageName() {
    return this.args.badge.imageUrl.slice(this.IMAGE_BASE_URL.length);
  }

  get campaignScopeCriterion() {
    return this.criteria.find((criterion) => criterion.isCampaignScope) || null;
  }

  get cappedTubesCriteria() {
    return this.criteria.filter((criterion) => criterion.isCappedTubesScope);
  }

  @action
  async updateBadge(event) {
    event.preventDefault();

    try {
      const badgeDTO = {
        title: this.form.title,
        key: this.form.key,
        message: this.form.message,
        altMessage: this.form.altMessage,
        isCertifiable: this.form.isCertifiable,
        isAlwaysVisible: this.form.isAlwaysVisible,
        imageUrl: this.IMAGE_BASE_URL + this.form.imageName,
      };
      await this.args.onUpdateBadge(badgeDTO);
      this.notifications.success('Le résultat thématique a été mis à jour.');
      this.editMode = false;
    } catch (err) {
      let errorMessage;
      err.errors.forEach((error) => {
        if (error?.code === 'BADGE_KEY_UNIQUE_CONSTRAINT_VIOLATED') {
          errorMessage = this.intl.t('components.badges.api-error-messages.key-already-exists', {
            badgeKey: error.meta,
          });
        } else {
          errorMessage = error.detail;
        }
        this.notifications.error(errorMessage);
      });
    }
  }

  @action
  cancel() {
    this.toggleEditMode();
  }

  @action
  toggleEditMode() {
    this.editMode = !this.editMode;
    if (this.editMode) {
      this._initForm();
    }
  }

  _initForm() {
    this.form.title = this.args.badge.title;
    this.form.key = this.args.badge.key;
    this.form.message = this.args.badge.message;
    this.form.altMessage = this.args.badge.altMessage;
    this.form.isCertifiable = this.args.badge.isCertifiable;
    this.form.isAlwaysVisible = this.args.badge.isAlwaysVisible;
    this.form.imageName = this.imageName;
  }

  <template>
    <header class="page-header">
      <div class="page-title">
        <p>
          <LinkTo @route="authenticated.target-profiles.target-profile.insights">{{@targetProfile.name}}</LinkTo>
          <span class="wire">&nbsp;>&nbsp;</span>
          <h1>Résultat thématique
            {{@badge.id}}
          </h1>
        </p>
      </div>
    </header>

    <main class="page-body">
      <section class="page-section">
        <div class="page-section__header">
          <h2 class="page-section__title">{{@badge.name}}</h2>
        </div>
        <div class="page-section__details badge-data">
          <div class="badge-data__image">
            <img src={{@badge.imageUrl}} alt="" width="90px" /><br />
          </div>
          {{#if this.editMode}}
            <div class="badge-edit-form">
              <form class="form" {{on "submit" this.updateBadge}}>
                <div class="badge-edit-form__field">
                  <PixInput
                    class="form-control"
                    @value={{this.form.title}}
                    @requiredLabel={{true}}
                    {{on "input" (pick "target.value" (set this "form.title"))}}
                  ><:label>Titre : </:label></PixInput>
                </div>
                <div class="badge-edit-form__field">
                  <PixInput
                    class="form-control"
                    @value={{this.form.key}}
                    @requiredLabel={{true}}
                    {{on "input" (pick "target.value" (set this "form.key"))}}
                  ><:label>Clé : </:label></PixInput>
                </div>
                <div class="badge-edit-form__field">
                  <PixTextarea
                    class="form-control"
                    @value={{this.form.message}}
                    rows="4"
                    {{on "input" (pick "target.value" (set this "form.message"))}}
                  ><:label>Message : </:label></PixTextarea>
                </div>
                <div class="badge-edit-form__field">
                  <PixInput
                    class="form-control"
                    @value={{this.form.imageName}}
                    @requiredLabel={{true}}
                    {{on "input" (pick "target.value" (set this "form.imageName"))}}
                  ><:label>Nom de l'image (svg) : </:label></PixInput>
                </div>
                <div class="badge-edit-form__field">
                  <PixInput
                    class="form-control"
                    @value={{this.form.altMessage}}
                    @requiredLabel={{true}}
                    {{on "input" (pick "target.value" (set this "form.altMessage"))}}
                  ><:label>Message Alternatif : </:label></PixInput>
                </div>
                <div class="badge-edit-form__field">
                  <PixCheckbox
                    class="badge-form-check-field__control"
                    @checked={{this.form.isCertifiable}}
                    {{on "change" (toggle "form.isCertifiable" this)}}
                  ><:label>Certifiable</:label></PixCheckbox>
                </div>
                <div class="badge-edit-form__field">
                  <PixCheckbox
                    class="badge-form-check-field__control"
                    @type="checkbox"
                    @checked={{this.form.isAlwaysVisible}}
                    {{on "change" (toggle "form.isAlwaysVisible" this)}}
                  ><:label>Lacunes</:label></PixCheckbox>
                </div>
                <div class="badge-edit-form__actions">
                  <PixButton @size="small" @variant="secondary" @triggerAction={{this.cancel}}>
                    {{t "common.actions.cancel"}}
                  </PixButton>
                  <PixButton @type="submit" @size="small" @variant="success" data-testid="save-badge-edit">
                    {{t "common.actions.save"}}
                  </PixButton>
                </div>
              </form>
            </div>
          {{else}}
            <div>
              <ul class="badge-data__list">
                <li>ID : {{@badge.id}}</li>
                <li>Nom du résultat thématique : {{@badge.title}}</li>
                <li>Nom de l'image : {{this.imageName}}</li>
                <li>Clé : {{@badge.key}}</li>
                <li>Message : {{@badge.message}}</li>
                <li>Message alternatif : {{@badge.altMessage}}</li>
              </ul>
              {{#if @badge.isCertifiable}}
                <PixTag
                  @color={{this.isCertifiableColor}}
                  class="badge-data__tags"
                >{{this.isCertifiableText}}</PixTag><br />
              {{/if}}
              {{#if @badge.isAlwaysVisible}}
                <PixTag @color={{this.isAlwaysVisibleColor}} class="badge-data__tags">
                  {{this.isAlwaysVisibleText}}</PixTag><br />
              {{/if}}
              <PixButton
                @variant="secondary"
                class="badge-data__action"
                @size="small"
                @triggerAction={{this.toggleEditMode}}
              >
                {{t "common.actions.edit"}}
              </PixButton>
            </div>
          {{/if}}
        </div>
      </section>

      <section class="badge__criteria main-admin-form">
        <div class="admin-form__content">
          {{#if this.campaignScopeCriterion}}
            <CampaignCriterion
              @criterion={{this.campaignScopeCriterion}}
              @isEditable={{not @targetProfile.hasLinkedCampaign}}
            />
          {{/if}}
          {{#if this.cappedTubesCriteria.length}}
            <h2 class="badge-criterion__title">
              Liste des critères d'obtention basés sur une sélection de sujets du profil cible&nbsp;:
            </h2>
            {{#each this.cappedTubesCriteria as |criterion|}}
              <div class="card">
                <CappedTubesCriterion @criterion={{criterion}} @targetProfile={{@targetProfile}} />
              </div>
            {{/each}}
          {{/if}}
        </div>
      </section>
    </main>
  </template>
}
