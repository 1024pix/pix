import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { pageTitle } from 'ember-page-title';

import formatDate from '../../helpers/format-date';
import ConfirmPopup from '../confirm-popup';
import SafeMarkdownToHtml from '../safe-markdown-to-html';
import Category from './category';
import Copy from './modal/copy';
import PdfParametersModal from './pdf-parameters-modal';

export default class TargetProfile extends Component {
  @service notifications;
  @service router;
  @service store;
  @service intl;

  @service fileSaver;
  @service session;

  @tracked showCopyModal = false;
  @tracked displayConfirm = false;
  @tracked displaySimplifiedAccessPopupConfirm = false;
  @tracked displayPdfParametersModal = false;

  get isPublic() {
    return this.args.model.isPublic;
  }

  get isOutdated() {
    return this.args.model.outdated;
  }

  get isSimplifiedAccess() {
    return this.args.model.isSimplifiedAccess;
  }

  get areKnowledgeElementsResettable() {
    return this.args.model.areKnowledgeElementsResettable;
  }

  get hasLinkedCampaign() {
    return Boolean(this.args.model.hasLinkedCampaign);
  }

  get hasLinkedAutonomousCourse() {
    return Boolean(this.args.model.hasLinkedAutonomousCourse);
  }

  displayBooleanState = (bool) => {
    const yes = this.intl.t('common.words.yes');
    const no = this.intl.t('common.words.no');
    return bool ? yes : no;
  };

  @action
  toggleDisplayConfirm() {
    this.displayConfirm = !this.displayConfirm;
  }

  @action
  toggleDisplaySimplifiedAccessPopupConfirm() {
    this.displaySimplifiedAccessPopupConfirm = !this.displaySimplifiedAccessPopupConfirm;
  }

  @action
  toggleDisplayPdfParametersModal() {
    this.displayPdfParametersModal = !this.displayPdfParametersModal;
  }

  @action
  async outdate() {
    const adapter = this.store.adapterFor('target-profile');
    this.toggleDisplayConfirm();
    try {
      await adapter.outdate(this.args.model.id);
      this.args.model.reload();
      return this.notifications.success('Profil cible marqué comme obsolète.');
    } catch (responseError) {
      this._handleResponseError(responseError);
    }
  }

  @action
  async markTargetProfileAsSimplifiedAccess() {
    this.toggleDisplaySimplifiedAccessPopupConfirm();
    try {
      this.args.model.isSimplifiedAccess = true;
      await this.args.model.save({ adapterOptions: { markTargetProfileAsSimplifiedAccess: true } });

      this.notifications.success('Ce profil cible a bien été marqué comme accès simplifié.');
    } catch (responseError) {
      const genericErrorMessage = this.intl.t('common.notifications.generic-error');
      this.notifications.error(genericErrorMessage);
    }
  }

  _handleResponseError({ errors }) {
    if (!errors) {
      return this.notifications.error('Une erreur est survenue.');
    }
    errors.forEach((error) => {
      if (['404', '412'].includes(error.status)) {
        this.notifications.error(error.detail);
      }
      if (error.status === '400') {
        this.notifications.error('Une erreur est survenue.');
      }
    });
  }

  @action
  async downloadPDF(language) {
    try {
      this.toggleDisplayPdfParametersModal();
      const targetProfileId = this.args.model.id;
      const url = `/api/admin/target-profiles/${targetProfileId}/learning-content-pdf?language=${language}`;
      const fileName = 'whatever.pdf';
      const token = this.session.data.authenticated.access_token;
      await this.fileSaver.save({ url, fileName, token });
    } catch (error) {
      this.notifications.error(error.message, { autoClear: false });
    }
  }

  @action
  async downloadJSON() {
    try {
      const targetProfileId = this.args.model.id;
      const url = `/api/admin/target-profiles/${targetProfileId}/content-json`;
      const fileName = 'whatever.json';
      const token = this.session.data.authenticated.access_token;
      await this.fileSaver.save({ url, fileName, token });
    } catch (error) {
      this.notifications.error(error.message, { autoClear: false });
    }
  }

  @action
  async copyTargetProfile() {
    try {
      const adapter = this.store.adapterFor('target-profile');
      const newTargetProfileId = await adapter.copy(this.args.model.id);
      this.router.transitionTo('authenticated.target-profiles.target-profile', newTargetProfileId);
      this.notifications.success(this.intl.t('pages.target-profiles.copy.notifications.success'));
      this.showCopyModal = false;
    } catch (error) {
      error.errors.forEach((apiError) => {
        this.notifications.error(apiError.detail);
      });
    }
  }

  @action
  closeCopyModal() {
    this.showCopyModal = false;
  }

  @action
  openCopyModal() {
    this.showCopyModal = true;
  }
  <template>
    {{pageTitle "Profil " @model.id " | Pix Admin" replace=true}}
    <header class="page-header">
      <div class="page-title">
        <LinkTo @route="authenticated.target-profiles.list">Tous les profils cibles</LinkTo>
        <span class="wire">&nbsp;>&nbsp;</span>
        <h1>{{@model.name}}</h1>
      </div>
    </header>

    <main class="page-body">
      <section class="page-section target-profile-section">
        <div class="page-section__header">
          <h2 class="page-section__title target-profile__title">{{@model.name}}</h2>
          <Category @category={{@model.category}} />
        </div>
        <div class="target-profile-section__container">
          <ul>
            <li><span class="bold">ID&#x20;:&#x20;</span>{{@model.id}}</li>
            <li><span class="bold">Organisation de référence&#x20;:&#x20;</span><LinkTo
                @route="authenticated.organizations.get"
                @model={{@model.ownerOrganizationId}}
              >{{@model.ownerOrganizationId}}</LinkTo>
            </li>
            <li><span class="bold">Date de création&#x20;:&#x20;</span>{{formatDate @model.createdAt}}</li>
            <li><span class="bold">Public&#x20;:&#x20;</span>{{this.displayBooleanState this.isPublic}}</li>
            <li><span class="bold">Obsolète&#x20;:&#x20;</span>{{this.displayBooleanState this.isOutdated}}</li>
            <li>
              <span class="bold">Parcours Accès Simplifié&#x20;:&#x20;</span>{{this.displayBooleanState
                this.isSimplifiedAccess
              }}
            </li>
            {{#if this.hasLinkedCampaign}}
              <li><span class="bold">Est associé à une campagne&#x20;:&#x20;</span>Oui</li>
              {{#if this.hasLinkedAutonomousCourse}}
                <li><span class="bold">Est associé à un parcours autonome&#x20;:&#x20;</span>Oui</li>
              {{/if}}
            {{else}}
              <li><span class="bold">Associé à une campagne ou un parcours autonome&#x20;:&#x20;</span>Non</li>
            {{/if}}
            <li>
              <span class="bold">{{t
                  "pages.target-profiles.resettable-checkbox.label"
                }}&#x20;:&#x20;</span>{{this.displayBooleanState this.areKnowledgeElementsResettable}}
            </li>
            {{#if @model.description}}
              <li>
                <span class="bold">Description&#x20;:&#x20;</span>
                <SafeMarkdownToHtml @markdown={{@model.description}} />
              </li>
            {{/if}}
            {{#if @model.comment}}
              <li>
                <span class="bold">Commentaire (usage interne)&#x20;:&#x20;</span>
                <SafeMarkdownToHtml @markdown={{@model.comment}} />
              </li>
            {{/if}}
          </ul>

          {{! template-lint-disable no-redundant-role }}
          <img src={{@model.imageUrl}} role="img" alt="Profil cible" />
        </div>
        <div class="target-profile__actions">
          <PixButtonLink
            @route="authenticated.target-profiles.edit"
            @model={{@model.id}}
            @size="small"
            @variant="secondary"
          >
            {{t "common.actions.edit"}}
          </PixButtonLink>
          <div class="target-profile__actions-separator"></div>

          {{#unless @model.isSimplifiedAccess}}
            <PixButton
              @size="small"
              @variant="secondary"
              @triggerAction={{this.toggleDisplaySimplifiedAccessPopupConfirm}}
            >
              Marquer comme accès simplifié
            </PixButton>
          {{/unless}}

          <PixButton @triggerAction={{this.downloadJSON}} @size="small" @variant="success">
            Télécharger le profil cible (JSON)
          </PixButton>

          <PixButton @triggerAction={{this.toggleDisplayPdfParametersModal}} @size="small" @variant="success">
            Télécharger le profil cible (PDF)
          </PixButton>

          <PixButton @size="small" @triggerAction={{this.openCopyModal}}>{{t
              "pages.target-profiles.copy.button.label"
            }}</PixButton>

          <Copy @isOpen={{this.showCopyModal}} @onClose={{this.closeCopyModal}} @onSubmit={{this.copyTargetProfile}} />

          {{#unless @model.outdated}}
            <div class="target-profile__actions-spacer"></div>
            <PixButton @size="small" @variant="error" @triggerAction={{this.toggleDisplayConfirm}}>
              Marquer comme obsolète
            </PixButton>
          {{/unless}}
        </div>
      </section>

      <nav class="navbar">
        <LinkTo @route="authenticated.target-profiles.target-profile.details" @model={{@model}} class="navbar-item">
          Détails
        </LinkTo>
        <LinkTo
          @route="authenticated.target-profiles.target-profile.organizations"
          @model={{@model}}
          class="navbar-item"
          aria-label="Organisations du profil cible"
        >
          Organisations
        </LinkTo>
        <LinkTo @route="authenticated.target-profiles.target-profile.insights" @model={{@model}} class="navbar-item">
          Clés de lecture
        </LinkTo>
        <LinkTo
          @route="authenticated.target-profiles.target-profile.training-summaries"
          @model={{@model}}
          class="navbar-item"
          aria-label="Contenus formatifs du profil cible"
        >
          Contenus formatifs
        </LinkTo>
      </nav>

      {{yield}}

      <ConfirmPopup
        @message="Marquer comme obsolète ce profil cible entraînera l'impossibilité de l'utiliser dans toutes les organisations qui lui sont rattachées."
        @title="Etes-vous sûr de vouloir marquer comme obsolète le profil cible {{@model.name}} ?"
        @submitTitle="Oui, marquer comme obsolète"
        @closeTitle="Non, annuler"
        @size="lg"
        @confirm={{this.outdate}}
        @cancel={{this.toggleDisplayConfirm}}
        @show={{this.displayConfirm}}
      />

      <PixModal
        @title="Êtes-vous sûr de vouloir marquer ce profil cible comme accès simplifié ?"
        @onCloseButtonClick={{this.toggleDisplaySimplifiedAccessPopupConfirm}}
        @showModal={{this.displaySimplifiedAccessPopupConfirm}}
      >
        <:content>
          <p>
            Pour tous les utilisateurs qui accéderont à des campagnes avec ce profil cible, l’accès se fera sans
            inscription et donc sans création de compte. Ils accéderont à ces campagnes de manière anonyme.
          </p>
          <p>
            <strong>
              Cette action est irréversible.
            </strong>
          </p>
        </:content>
        <:footer>
          <PixButton
            @size="small"
            @variant="secondary"
            @triggerAction={{this.toggleDisplaySimplifiedAccessPopupConfirm}}
          >
            Non, annuler
          </PixButton>
          <PixButton @type="submit" @size="small" {{on "click" this.markTargetProfileAsSimplifiedAccess}}>
            Oui, marquer comme accès simplifié
          </PixButton>
        </:footer>
      </PixModal>

      <PdfParametersModal
        @onDownloadButtonClicked={{this.downloadPDF}}
        @onCloseButtonClicked={{this.toggleDisplayPdfParametersModal}}
        @displayModal={{this.displayPdfParametersModal}}
      />
    </main>
  </template>
}
