import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixMessage from '@1024pix/pix-ui/components/pix-message';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import ENV from 'pix-admin/config/environment';

export default class OrganizationInformationSection extends Component {
  @service oidcIdentityProviders;
  @service accessControl;
  @tracked tags;
  @tracked hasOrganizationChildren;

  constructor() {
    super(...arguments);
    if (this.args.organization.tags) {
      Promise.resolve(this.args.organization.tags).then((tags) => {
        this.tags = tags;
      });
    }
    if (this.args.organization.children) {
      Promise.resolve(this.args.organization.children).then((children) => {
        this.hasOrganizationChildren = children.length > 0;
      });
    }
  }

  get isManagingStudentAvailable() {
    return (
      !this.args.organization.isLearnerImportEnabled &&
      (this.args.organization.isOrganizationSCO || this.args.organization.isOrganizationSUP)
    );
  }

  get identityProviderName() {
    const GARIdentityProvider = { code: 'GAR', organizationName: 'GAR' };
    const allIdentityProviderList = [...this.oidcIdentityProviders.list, GARIdentityProvider];
    const identityProvider = allIdentityProviderList.findBy(
      'code',
      this.args.organization.identityProviderForCampaigns,
    );
    const identityProviderName = identityProvider?.organizationName;
    return identityProviderName ?? 'Aucun';
  }

  get externalURL() {
    const urlDashboardPrefix = ENV.APP.ORGANIZATION_DASHBOARD_URL;
    return urlDashboardPrefix && urlDashboardPrefix + this.args.organization.id;
  }

  <template>
    <div class="organization__data">
      <h2 class="organization__name">{{@organization.name}}</h2>

      {{#if this.tags}}
        <ul class="organization-tags-list">
          {{#each @organization.tags as |tag|}}
            <li class="organization-tags-list__tag">
              <PixTag @color="purple-light">{{tag.name}}</PixTag>
            </li>
          {{/each}}
        </ul>
      {{else}}
        <PixMessage class="organization-information-section__missing-tags-message" @type="information">Cette
          organisation n'a pas de tags.
        </PixMessage>
      {{/if}}
      <div class="organization__network-label">
        {{#if this.hasOrganizationChildren}}
          <PixTag @color="success">{{t
              "components.organizations.information-section-view.parent-organization"
            }}</PixTag>
        {{/if}}
        {{#if @organization.parentOrganizationId}}
          <ul>
            <li>
              <PixTag class="organization__child-tag" @color="success">{{t
                  "components.organizations.information-section-view.child-organization"
                }}</PixTag>
            </li>
            <li>
              {{t "components.organizations.information-section-view.parent-organization"}}
              :
              <LinkTo @route="authenticated.organizations.get" @model={{@organization.parentOrganizationId}}>
                {{@organization.parentOrganizationName}}
              </LinkTo>
            </li>
          </ul>
        {{/if}}
      </div>
      {{#if @organization.isArchived}}
        <PixMessage class="organization-information-section__archived-message" @type="warning">
          Archivée le
          {{@organization.archivedFormattedDate}}
          par
          {{@organization.archivistFullName}}.
        </PixMessage>
      {{/if}}

      <div class="organization-information-section__content">
        <div class="organization-information-section__details">
          <ul class="organization-information-section__details__list">
            <li>Type : {{@organization.type}}</li>
            <li>Créée par : {{@organization.creatorFullName}} ({{@organization.createdBy}})</li>
            <li>Créée le : {{@organization.createdAtFormattedDate}}</li>
            {{#if @organization.externalId}}
              <li>Identifiant externe : {{@organization.externalId}}</li>
            {{/if}}
            {{#if @organization.provinceCode}}
              <li>Département : {{@organization.provinceCode}}</li>
            {{/if}}

            <br />

            <li>Nom du DPO : {{@organization.dataProtectionOfficerFullName}}</li>
            <li>Adresse e-mail du DPO : {{@organization.dataProtectionOfficerEmail}}</li>
            <br />
            <li>Crédits : {{@organization.credit}}</li>
            <li>Lien vers la documentation :
              {{#if @organization.documentationUrl}}
                <a
                  href="{{@organization.documentationUrl}}"
                  target="_blank"
                  rel="noopener noreferrer"
                >{{@organization.documentationUrl}}</a>
              {{else}}
                Non spécifié
              {{/if}}
            </li>
            <li>SSO : {{this.identityProviderName}}</li>

            <br />

            <li>Adresse e-mail d'activation SCO : {{@organization.email}}</li>

            <br />

            <li>Lien vers le formulaire du Net Promoter Score :
              {{#if @organization.formNPSUrl}}
                <a
                  href="{{@organization.formNPSUrl}}"
                  target="_blank"
                  rel="noopener noreferrer"
                >{{@organization.formNPSUrl}}</a>
              {{else}}
                Non spécifié
              {{/if}}
            </li>
            <li>Affichage du Net Promoter Score : {{if @organization.showNPS "Oui" "Non"}}</li>
          </ul>
          <h3 class="page-section__title page-section__title--sub">Fonctionnalités disponibles : </h3>
          <ul class="organization-information-section__details__list">
            {{#if @organization.isLearnerImportEnabled}}
              <li>Gestion des préscrits activé (format d'import: {{@organization.learnerImportFormatName}}</li>
            {{/if}}
            <li>Affichage des acquis dans l'export de résultats : {{if @organization.showSkills "Oui" "Non"}}</li>
            {{#if this.isManagingStudentAvailable}}
              <li>Gestion d’élèves/étudiants : {{if @organization.isManagingStudents "Oui" "Non"}}</li>
            {{/if}}
            <li>Activer l'envoi multiple sur les campagnes d'évaluation :
              {{if @organization.isMultipleSendingAssessmentEnabled "Oui" "Non"}}</li>
            <li>Activer la page Places sur PixOrga :
              {{if @organization.isPlacesManagementEnabled "Oui" "Non"}}</li>
            {{#if @organization.code}}
              <br />
              <li>Code : {{@organization.code}}</li>
            {{/if}}
            {{#if @organization.isComputeCertificabilityEnabled}}
              <li>Certificabilité automatique activée</li>
            {{/if}}

          </ul>
          {{#if this.accessControl.hasAccessToOrganizationActionsScope}}
            <div class="form-actions">
              <PixButton @variant="secondary" @size="small" @triggerAction={{@toggleEditMode}}>
                Modifier
              </PixButton>
              {{#unless @organization.isArchived}}
                <PixButton @variant="error" @size="small" @triggerAction={{@toggleArchivingConfirmationModal}}>
                  Archiver l'organisation
                </PixButton>
              {{/unless}}
            </div>
          {{/if}}
        </div>
        <div>
          <PixButtonLink
            @variant="secondary"
            @href={{this.externalURL}}
            @size="small"
            target="_blank"
            rel="noopener noreferrer"
          >Tableau de bord
          </PixButtonLink>
        </div>
      </div>
    </div>
  </template>
}
