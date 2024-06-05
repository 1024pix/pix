import Route from '@ember/routing/route';
import { service } from '@ember/service';
import RSVP from 'rsvp';

export default class OrganizationTeamRoute extends Route {
  @service router;
  @service notifications;

  queryParams = {
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
    firstName: { refreshModel: true },
    lastName: { refreshModel: true },
    email: { refreshModel: true },
    organizationRole: { refreshModel: true },
  };

  ERROR_MESSAGES = {
    DEFAULT: 'Une erreur est survenue.',
    STATUS_403: "Vous n'avez pas accès à certaines actions ou informations de cette page",
  };

  beforeModel() {
    const organization = this.modelFor('authenticated.organizations.get');
    if (organization.isArchived) {
      return this.router.replaceWith('authenticated.organizations.get.target-profiles');
    }
  }

  async model(params) {
    const organization = this.modelFor('authenticated.organizations.get');
    try {
      await organization.hasMany('organizationMemberships').reload({
        adapterOptions: {
          'page[size]': params.pageSize,
          'page[number]': params.pageNumber,
          'filter[firstName]': params.firstName,
          'filter[lastName]': params.lastName,
          'filter[email]': params.email,
          'filter[organizationRole]': params.organizationRole,
        },
      });
    } catch (errorResponse) {
      this._handleResponseError(errorResponse);
    }

    return RSVP.hash({
      organization,
      organizationMemberships: organization.organizationMemberships,
    });
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.pageNumber = 1;
      controller.pageSize = 10;
      controller.firstName = null;
      controller.lastName = null;
      controller.email = null;
      controller.organizationRole = null;
    }
  }

  _handleResponseError(errorResponse) {
    const { errors } = errorResponse;

    if (errors) {
      errors.map((error) => {
        switch (error.code) {
          case 403:
            this.notifications.error(this.ERROR_MESSAGES.STATUS_403);
            break;
          default:
            this.notifications.error(this.ERROR_MESSAGES.DEFAULT);
            break;
        }
      });
    } else {
      this.notifications.error(this.ERROR_MESSAGES.DEFAULT);
    }
  }
}
