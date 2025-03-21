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

import SafeMarkdownToHtml from '../safe-markdown-to-html';
import CampaignCriterion from './campaign-criterion';
import CappedTubesCriterion from './capped-tubes-criterion';

export default class Badge extends Component {
  @service pixToast;
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
      this.pixToast.sendSuccessNotification({ message: 'Le badge a été mis à jour.' });
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
        this.pixToast.sendErrorNotification({ message: errorMessage });
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
      <div>
        <p>
          <LinkTo
            @route="authenticated.target-profiles.target-profile.insights"
          >{{@targetProfile.internalName}}</LinkTo>
          <span class="wire">&nbsp;>&nbsp;</span>
          <h1>Badge {{@badge.id}}</h1>
        </p>
      </div>
    </header>

    <main class="page-body">
      <section class="page-section">

        {{#if this.editMode}}
          <form class="form" {{on "submit" this.updateBadge}}>
            <div class="badge-edit-form__field">
              <PixInput
                class="form-control"
                @value={{this.form.title}}
                @requiredLabel={{true}}
                {{on "input" (pick "target.value" (set this "form.title"))}}
              ><:label>Titre</:label></PixInput>
            </div>
            <div class="badge-edit-form__field">
              <PixInput
                class="form-control"
                @value={{this.form.key}}
                @requiredLabel={{true}}
                {{on "input" (pick "target.value" (set this "form.key"))}}
              ><:label>Clé</:label></PixInput>
            </div>
            <div class="badge-edit-form__field">
              <PixTextarea
                class="form-control"
                @value={{this.form.message}}
                rows="4"
                {{on "input" (pick "target.value" (set this "form.message"))}}
              ><:label>Message</:label></PixTextarea>
            </div>
            <div class="badge-edit-form__field">
              <PixInput
                class="form-control"
                @value={{this.form.imageName}}
                @requiredLabel={{t "common.forms.mandatory"}}
                {{on "input" (pick "target.value" (set this "form.imageName"))}}
              ><:label>Nom de l'image (svg)</:label></PixInput>
            </div>
            <div class="badge-edit-form__field">
              <PixInput
                class="form-control"
                @value={{this.form.altMessage}}
                @requiredLabel={{t "common.forms.mandatory"}}
                {{on "input" (pick "target.value" (set this "form.altMessage"))}}
              ><:label>Message Alternatif</:label></PixInput>
            </div>
            <div class="badge-edit-form__checkboxes">
              <div>
                <PixCheckbox
                  @checked={{this.form.isCertifiable}}
                  @variant="tile"
                  {{on "change" (toggle "form.isCertifiable" this)}}
                ><:label>Certifiable</:label></PixCheckbox>
              </div>
              <div>
                <PixCheckbox
                  @type="checkbox"
                  @checked={{this.form.isAlwaysVisible}}
                  @variant="tile"
                  {{on "change" (toggle "form.isAlwaysVisible" this)}}
                ><:label>Lacunes</:label></PixCheckbox>
              </div>
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
        {{else}}
          <div class="page-section__details badge-details">
            <div class="badge-details__image">
              <img src={{@badge.imageUrl}} alt="" width="90px" />
              {{#if @badge.isCertifiable}}
                <PixTag @color="success" class="badge-details__tag">
                  {{this.isCertifiableText}}
                </PixTag>
              {{/if}}
              {{#if @badge.isAlwaysVisible}}
                <PixTag @color="tertiary" class="badge-details__tag">
                  {{this.isAlwaysVisibleText}}
                </PixTag>
              {{/if}}
            </div>
            <div class="badge-details__content">
              <dl class="page-details">
                <dt class="page-details__label">ID&nbsp;:&nbsp;</dt>
                <dd class="page-details__value">{{@badge.id}}</dd>
                <dt class="page-details__label">Clé&nbsp;:&nbsp;</dt>
                <dd class="page-details__value">{{@badge.key}}</dd>
                <dt class="page-details__label">Nom du badge&nbsp;:&nbsp;</dt>
                <dd class="page-details__value">{{@badge.title}}</dd>
                <dt class="page-details__label">Image&nbsp;:&nbsp;</dt>
                <dd class="page-details__value">{{this.imageName}}</dd>
                <dt class="page-details__label">Message&nbsp;:&nbsp;</dt>
                <dd class="page-details__value">
                  <blockquote>
                    <SafeMarkdownToHtml @markdown={{@badge.message}} />
                  </blockquote>
                </dd>
                <dt class="page-details__label">Message alternatif&nbsp;:&nbsp;</dt>
                <dd class="page-details__value">{{@badge.altMessage}}</dd>
              </dl>
              <PixButton
                @variant="secondary"
                class="badge-details__action"
                @size="small"
                @triggerAction={{this.toggleEditMode}}
              >
                Modifier les informations
              </PixButton>
            </div>
          </div>
        {{/if}}
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
