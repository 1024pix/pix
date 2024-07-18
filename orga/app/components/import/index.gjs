import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import groupBy from 'lodash/groupBy';
import uniq from 'lodash/uniq';

import UiPixLoader from '../ui/pix-loader';
import ScoOrganizationParticipantAdd from './add-sco';
import SupOrganizationParticipantAdd from './add-sup';
import ImportBanner from './banner';
import DownloadImportTemplateLink from './download-import-template-link';
import SupOrganizationParticipantReplace from './replace-sup';

export default class Import extends Component {
  @service currentUser;
  @service session;
  @service errorMessages;
  @service intl;

  get displayImportMessagePanel() {
    return this.args.organizationImportDetail?.hasError || this.args.organizationImportDetail?.hasWarning;
  }

  get inProgress() {
    return Boolean(this.args.organizationImportDetail?.inProgress);
  }

  get panelClasses() {
    const classes = ['import-students-page__error-panel'];

    if (this.args.organizationImportDetail?.hasWarning) classes.push('import-students-page__error-panel--warning');

    return classes.join(' ');
  }

  get errorDetailList() {
    if (this.args.organizationImportDetail?.hasWarning) {
      const warnings = [];
      const warningsByFields = groupBy(this.args.organizationImportDetail?.errors, 'field');
      if (warningsByFields.diploma) {
        const diplomas = uniq(warningsByFields.diploma.map((warning) => warning.value)).join(', ');
        warnings.push(this.intl.t('pages.organization-participants-import.warnings.diploma', { diplomas }));
      }
      if (warningsByFields['study-scheme']) {
        const studySchemes = uniq(warningsByFields['study-scheme'].map((warning) => warning.value)).join(', ');
        warnings.push(this.intl.t('pages.organization-participants-import.warnings.study-scheme', { studySchemes }));
      }
      return warnings;
    }
    return this.args.organizationImportDetail?.errors.map((error) =>
      this.errorMessages.getErrorMessage(error.code, error.meta),
    );
  }

  get supportedFormats() {
    if (
      (this.currentUser.isSCOManagingStudents && this.currentUser.isAgriculture) ||
      this.currentUser.isSUPManagingStudents
    ) {
      return ['.csv'];
    } else if (this.currentUser.isSCOManagingStudents) {
      return ['.xml', '.zip'];
    } else if (this.currentUser.hasLearnerImportFeature) {
      /**
       * On choisi de renvoyer une valeur en dur ('.csv') dans le cas de la feature d'import
       * afin de pouvoir avancer sur l'import ONDE. Cela est temporaire. par la suite
       * il faudra récupérer la valeur depuis le champ `fileType` de la table `organization-learner-import-formats`
       * en passant par un endpoint API
       */
      return ['.csv'];
    } else return [];
  }

  get textsByOrganizationType() {
    if (this.currentUser.isSCOManagingStudents) {
      return {
        title: 'pages.organization-participants-import.sco.title',
        'error-wrapper': 'pages.organization-participants-import.sco.error-wrapper',
        'global-error': 'pages.organization-participants-import.sco.title.global-error',
      };
    } else if (this.currentUser.isSUPManagingStudents) {
      return {
        title: 'pages.organization-participants-import.sup.title',
        'error-wrapper': 'pages.organization-participants-import.sup.error-wrapper',
        'global-error': 'pages.organization-participants-import.sup.title.global-error',
      };
    } else if (this.currentUser.hasLearnerImportFeature) {
      // ici aussi on gére les traductions en dur pour les imports à format
      // en se basant sur les besoins de l'import onde.
      // à modifier pour avoir des traduction spécifiques
      return {
        title: 'pages.organization-participants-import.sco.title',
        'error-wrapper': 'pages.organization-participants-import.sco.error-wrapper',
        'global-error': 'pages.organization-participants-import.sco.title.global-error',
      };
    } else {
      return {};
    }
  }

  <template>
    <article class="import-students-page">
      <header class="import-students-page__header">
        <h1>
          {{t this.textsByOrganizationType.title}}
        </h1>
        <DownloadImportTemplateLink />
      </header>

      <ImportBanner
        @organizationImportDetail={{@organizationImportDetail}}
        @errorPanelId="import-error-messages"
        @isLoading={{@isLoading}}
      />

      {{#if @isLoading}}
        <UiPixLoader />
      {{/if}}

      {{#unless @isLoading}}
        <div class="import-students-page__type-list">
          {{#if this.currentUser.isSCOManagingStudents}}
            <ScoOrganizationParticipantAdd
              @importHandler={{@onImportScoStudents}}
              @supportedFormats={{this.supportedFormats}}
              @disabled={{this.inProgress}}
            />
          {{else if this.currentUser.isSUPManagingStudents}}
            <SupOrganizationParticipantAdd
              @importHandler={{@onImportSupStudents}}
              @supportedFormats={{this.supportedFormats}}
              @disabled={{this.inProgress}}
            />
            <SupOrganizationParticipantReplace
              @importHandler={{@onReplaceStudents}}
              @supportedFormats={{this.supportedFormats}}
              @disabled={{this.inProgress}}
            />
          {{else if this.currentUser.hasLearnerImportFeature}}
            <ScoOrganizationParticipantAdd
              @importHandler={{@onImportLearners}}
              @supportedFormats={{this.supportedFormats}}
              @disabled={{this.inProgress}}
            />
          {{/if}}
        </div>
      {{/unless}}

      {{#if this.displayImportMessagePanel}}
        <section id="import-error-messages" class={{this.panelClasses}} aria-live="assertive">
          <h2>{{t "pages.organization-participants-import.error-panel.title"}}</h2>

          <ul class="import-students-page__error-panel-list">
            {{#each this.errorDetailList as |errorElement|}}
              <li class="import-students-page__error-panel-list__item">{{errorElement}}</li>
            {{/each}}
          </ul>
        </section>
      {{/if}}
    </article>
  </template>
}
