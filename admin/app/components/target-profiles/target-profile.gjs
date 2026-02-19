import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import PixTabs from '@1024pix/pix-ui/components/pix-tabs';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import formatDate from 'ember-intl/helpers/format-date';
import { pageTitle } from 'ember-page-title';
import { DescriptionList } from 'pix-admin/components/ui/description-list';
import ENV from 'pix-admin/config/environment';

import ConfirmPopup from '../confirm-popup';
import SafeMarkdownToHtml from '../safe-markdown-to-html';
import Breadcrumb from './breadcrumb';
import Category from './category';
import Copy from './modal/copy';
import PdfParametersModal from './pdf-parameters-modal';

export default class TargetProfile extends Component {
  @service pixToast;
  @service router;
  @service store;
  @service intl;

  @service fileSaver;
  @service session;

  @tracked showCopyModal = false;
  @tracked displayConfirm = false;
  @tracked displaySimplifiedAccessPopupConfirm = false;
  @tracked displayPdfParametersModal = false;

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

  get externalURL() {
    const urlDashboardPrefix = ENV.APP.TARGET_PROFILE_DASHBOARD_URL;
    return urlDashboardPrefix && `${urlDashboardPrefix}?id=${this.args.model.id}`;
  }

  get estimatedTimeLabel() {
    const estimatedTime = this.args.model.estimatedTime;

    if (!estimatedTime) return this.intl.t('pages.target-profiles.estimated-range.unavailable');
    const ranges = [
      { max: 900, key: 'fifteen' },
      { max: 1800, key: 'thirty' },
      { max: 2700, key: 'fortyfive' },
      { max: 3600, key: 'sixty' },
      { max: 5400, key: 'ninety' },
      { max: 7200, key: 'one-hundred-twenty' },
      { max: 10800, key: 'one-hundred-eighty' },
    ];
    const found = ranges.find((range) => estimatedTime <= range.max);
    return this.intl.t(`pages.target-profiles.estimated-range.${found?.key ?? 'one-hundred-eighty-one'}`);
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
      return this.pixToast.sendSuccessNotification({ message: 'Profil cible marqué comme obsolète.' });
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

      this.pixToast.sendSuccessNotification({ message: 'Ce profil cible a bien été marqué comme accès simplifié.' });
    } catch {
      const genericErrorMessage = this.intl.t('common.notifications.generic-error');
      this.pixToast.sendErrorNotification({ message: genericErrorMessage });
    }
  }

  _handleResponseError({ errors }) {
    if (!errors) {
      return this.pixToast.sendErrorNotification({ message: 'Une erreur est survenue.' });
    }
    errors.forEach((error) => {
      if (['404', '412'].includes(error.status)) {
        this.pixToast.sendErrorNotification({ message: error.detail });
      }
      if (error.status === '400') {
        this.pixToast.sendErrorNotification({ message: 'Une erreur est survenue.' });
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
      this.pixToast.sendErrorNotification({ message: error.message });
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
      this.pixToast.sendErrorNotification({ message: error.message });
    }
  }

  @action
  async copyTargetProfile() {
    try {
      const adapter = this.store.adapterFor('target-profile');
      const newTargetProfileId = await adapter.copy(this.args.model.id);
      this.router.transitionTo('authenticated.target-profiles.target-profile', newTargetProfileId);
      this.pixToast.sendSuccessNotification({
        message: this.intl.t('pages.target-profiles.copy.notifications.success'),
      });
      this.showCopyModal = false;
    } catch (error) {
      error.errors.forEach((apiError) => {
        this.pixToast.sendErrorNotification({ message: apiError.detail });
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
      <Breadcrumb @currentPageLabel={{@model.internalName}} />
    </header>

    <main class="page-body">
      <section class="page-section target-profile-section">
        <h1 class="page-section__title">{{@model.internalName}}</h1>
        <Category @category={{@model.category}} />
        <div class="target-profile-section__container">

          <DescriptionList>

            <DescriptionList.Divider />

            <DescriptionList.Item @label={{t "pages.target-profiles.label.id"}}>
              {{@model.id}}
            </DescriptionList.Item>

            <DescriptionList.Divider />

            <DescriptionList.Item @label={{t "pages.target-profiles.label.name"}}>
              {{@model.internalName}}
            </DescriptionList.Item>

            <DescriptionList.Item @label={{t "pages.target-profiles.label.external-name"}}>
              {{@model.name}}
            </DescriptionList.Item>

            <DescriptionList.Divider />

            <DescriptionList.Item @label={{t "pages.target-profiles.label.estimated-time"}}>
              {{this.estimatedTimeLabel}}
              {{t "pages.target-profiles.label.estimated-time-experimental"}}
            </DescriptionList.Item>

            <DescriptionList.Divider />

            <DescriptionList.Divider />

            <DescriptionList.Item @label={{t "pages.target-profiles.label.created-at"}}>
              {{formatDate @model.createdAt}}
            </DescriptionList.Item>

            <DescriptionList.Divider />

            <DescriptionList.Item @label={{t "pages.target-profiles.label.outdated"}}>
              {{this.displayBooleanState this.isOutdated}}
            </DescriptionList.Item>

            <DescriptionList.Divider />

            <DescriptionList.Item @label={{t "pages.target-profiles.label.simplified-access"}}>
              {{this.displayBooleanState this.isSimplifiedAccess}}
            </DescriptionList.Item>

            <DescriptionList.Divider />
            {{#if this.hasLinkedCampaign}}
              <DescriptionList.Item @label={{t "pages.target-profiles.label.link-campaign"}}>
                {{t "common.words.yes"}}
              </DescriptionList.Item>
              {{#if this.hasLinkedAutonomousCourse}}
                <DescriptionList.Item @label={{t "pages.target-profiles.label.link-autonomous-course"}}>
                  {{t "common.words.yes"}}
                </DescriptionList.Item>
              {{/if}}
            {{else}}
              <DescriptionList.Item @label={{t "pages.target-profiles.label.link-autonomous-course-or-campaign"}}>
                {{t "common.words.no"}}
              </DescriptionList.Item>
            {{/if}}

            <DescriptionList.Divider />

            <DescriptionList.Item @label={{t "pages.target-profiles.resettable-checkbox.label"}}>
              {{this.displayBooleanState this.areKnowledgeElementsResettable}}
            </DescriptionList.Item>

            <DescriptionList.Divider />

            <DescriptionList.Item @label={{t "pages.target-profiles.tubes-count"}}>
              {{@model.tubesCount}}
            </DescriptionList.Item>

            {{#if @model.description}}
              <DescriptionList.Divider />

              <DescriptionList.Item @label="Description">
                <SafeMarkdownToHtml @markdown={{@model.description}} />
              </DescriptionList.Item>
            {{/if}}

            {{#if @model.comment}}
              <DescriptionList.Divider />

              <DescriptionList.Item @label="Commentaire (usage interne)">
                <SafeMarkdownToHtml @markdown={{@model.comment}} />
              </DescriptionList.Item>
            {{/if}}

            <DescriptionList.Divider />

          </DescriptionList>

          {{! template-lint-disable no-redundant-role }}
          <div class="target-profile-section__image">
            <img src={{@model.imageUrl}} role="img" alt="Profil cible" />
          </div>
        </div>
        <div class="target-profile__actions">
          <PixButtonLink
            @route="authenticated.target-profiles.edit"
            @model={{@model.id}}
            @size="small"
            @variant="primary"
          >
            {{t "common.actions.edit"}}
          </PixButtonLink>

          <PixButton @size="small" @variant="primary" @triggerAction={{this.openCopyModal}}>{{t
              "pages.target-profiles.copy.button.label"
            }}</PixButton>

          <Copy @isOpen={{this.showCopyModal}} @onClose={{this.closeCopyModal}} @onSubmit={{this.copyTargetProfile}} />

          <div class="target-profile__actions-separator"></div>
          <PixButtonLink
            @variant="secondary"
            @href="{{this.externalURL}}"
            @size="small"
            target="_blank"
            rel="noopener noreferrer"
          >Tableau de bord
          </PixButtonLink>

          <PixButton @triggerAction={{this.downloadJSON}} @size="small" @variant="success">
            Télécharger le profil cible (JSON)
          </PixButton>

          <PixButton @triggerAction={{this.toggleDisplayPdfParametersModal}} @size="small" @variant="success">
            Télécharger le profil cible (PDF)
          </PixButton>

          <div class="target-profile__actions-separator"></div>
          {{#unless @model.isSimplifiedAccess}}
            <PixButton @size="small" @variant="error" @triggerAction={{this.toggleDisplaySimplifiedAccessPopupConfirm}}>
              Marquer comme accès simplifié
            </PixButton>
          {{/unless}}

          {{#unless @model.outdated}}
            <PixButton @size="small" @variant="error" @triggerAction={{this.toggleDisplayConfirm}}>
              Marquer comme obsolète
            </PixButton>
          {{/unless}}
        </div>
      </section>

      <PixTabs @variant="primary" @ariaLabel="Navigation de la section détails d'un profil cible" class="navigation">
        <LinkTo @route="authenticated.target-profiles.target-profile.details" @model={{@model}}>
          Détails
        </LinkTo>
        <LinkTo
          @route="authenticated.target-profiles.target-profile.organizations"
          @model={{@model}}
          aria-label="Organisations du profil cible"
        >
          Organisations
        </LinkTo>
        <LinkTo @route="authenticated.target-profiles.target-profile.insights" @model={{@model}}>
          Clés de lecture
        </LinkTo>
        <LinkTo
          @route="authenticated.target-profiles.target-profile.training-summaries"
          @model={{@model}}
          aria-label="Contenus formatifs du profil cible"
        >
          Contenus formatifs
        </LinkTo>
      </PixTabs>

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
