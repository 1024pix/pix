import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class AuthenticatedAttestationsRoute extends Route {
  queryParams = {
    attestationKey: {
      refreshModel: true,
    },
    pageNumber: {
      refreshModel: true,
    },
    pageSize: {
      refreshModel: true,
    },
    statuses: {
      refreshModel: true,
    },
    divisions: {
      refreshModel: true,
    },
    search: {
      refreshModel: true,
    },
  };

  @service currentUser;
  @service router;
  @service store;

  beforeModel() {
    if (!this.currentUser.canAccessAttestationsPage) {
      this.router.replaceWith('application');
    }
  }

  async model(params) {
    const organizationId = this.currentUser.organization.id;
    let availableAttestations, getAttestationsError;
    try {
      availableAttestations = await this.store.findAll('attestation', { adapterOptions: { organizationId } });
    } catch (error) {
      getAttestationsError = error;
    }
    const attestationKey = params.attestationKey ?? availableAttestations[0].key;
    const currentAttestation = availableAttestations.find((attestation) => attestationKey === attestation.key);

    const attestationParticipantStatuses = await this.store.query('attestation-participant-status', {
      organizationId,
      attestationKey,
      filter: {
        statuses: params.statuses,
        divisions: params.divisions,
        search: params.search,
      },
      page: {
        number: params.pageNumber,
        size: params.pageSize,
      },
    });

    if (this.currentUser.organization.isManagingStudents) {
      const divisions = await this.currentUser.organization.divisions;
      const options = divisions.map(({ name }) => ({ label: name, value: name }));
      return { options, attestationParticipantStatuses, currentAttestation, availableAttestations };
    }

    return { attestationParticipantStatuses, currentAttestation, availableAttestations, getAttestationsError };
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.statuses = [];
      controller.divisions = [];
      controller.search = null;
      controller.pageSize = 50;
      controller.pageNumber = 1;
      controller.attestationKey = null;
    }
  }

  @action
  refreshModel() {
    this.refresh();
  }

  @action
  loading() {
    return false;
  }
}
