import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import AttachOrganizationsForm from 'pix-admin/components/organizations/attach-organizations-form';
import ListItems from 'pix-admin/components/organizations/list-items';

export default class Organizations extends Component {
  @service currentUser;
  @service store;
  @service intl;
  @service pixToast;
  @service router;

  get isSuperAdminOrMetier() {
    return this.currentUser.adminMember.isSuperAdmin || this.currentUser.adminMember.isMetier;
  }

  @action
  _handleResponseError({ errors }) {
    const genericErrorMessage = this.intl.t('common.notifications.generic-error');

    if (!errors) {
      return this.pixToast.sendErrorNotification({ message: genericErrorMessage });
    }
    errors.forEach((error) => {
      if (['404', '412'].includes(error.status)) {
        return this.pixToast.sendErrorNotification({ message: error.detail });
      }
      return this.pixToast.sendErrorNotification({ message: genericErrorMessage });
    });
  }

  @action
  async reloadCurrentPage() {
    return this.router.replaceWith('authenticated.combined-course-blueprints.combined-course-blueprint.organizations');
  }

  @action
  async attachOrganizations(organizationsToAttach) {
    const combinedCourseBlueprint = this.args.combinedCourseBlueprint;
    const adapter = this.store.adapterFor('combined-course-blueprint');
    try {
      const response = await adapter.attachOrganizations({
        organizationIds: organizationsToAttach,
        combinedCourseBlueprintId: combinedCourseBlueprint.id,
      });
      const { 'attached-ids': attachedIds, 'duplicated-ids': duplicatedIds } = response.data.attributes;
      return { attachedIds, duplicatedIds };
    } catch (responseError) {
      this._handleResponseError(responseError);
    }
  }

  <template>
    <section class="page-section combined-course-blueprint-organizations organizations-list">
      <header class="header page-section__header">
        <h2 class="page-section__title">Organisations</h2>
      </header>

      <AttachOrganizationsForm
        @attachOrganizations={{this.attachOrganizations}}
        @reloadAfterSuccess={{this.reloadCurrentPage}}
      />

      <ListItems
        @organizations={{@organizations}}
        @administrationTeams={{@administrationTeams}}
        @triggerFiltering={{@triggerFiltering}}
        @onResetFilter={{@onResetFilter}}
        @goToOrganizationPage={{@goToOrganizationPage}}
        @entityName={{@blueprint.internalName}}
        @id={{@id}}
        @name={{@name}}
        @hideArchived={{@hideArchived}}
        @type={{@type}}
        @externalId={{@externalId}}
        @administrationTeamId={{@administrationTeamId}}
        @showDetachColumn={{this.isSuperAdminOrMetier}}
        @detachOrganizations={{@detachOrganizations}}
        @confirmationLabel="components.combined-course-blueprints.organizations.detach-organization"
      />
    </section>
  </template>
}
