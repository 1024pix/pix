import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { EVENT_NAME } from 'pix-orga/constants/metrics-event-name';

export const SIXTH_GRADE_ATTESTATION_KEY = 'SIXTH_GRADE';
export const FILE_NAME = 'attestations';

export default class AuthenticatedAttestationsController extends Controller {
  @service fileSaver;
  @service session;
  @service currentUser;
  @service pixMetrics;
  @service notifications;
  @service intl;

  @tracked attestationKey = null;
  @tracked pageNumber = 1;
  @tracked pageSize = 50;
  @tracked statuses = [];
  @tracked divisions = [];
  @tracked search = null;

  @action
  async downloadAttestations(attestationKey, selectedDivisions) {
    this.pixMetrics.trackEvent(EVENT_NAME.ATTESTATION.DOWNLOAD_CLICK);
    try {
      let url;
      const organizationId = this.currentUser.organization.id;
      const baseUrl = `/api/organizations/${organizationId}/attestations/${attestationKey}`;
      if (selectedDivisions.length > 0) {
        const formatedDivisionsForQuery = selectedDivisions
          .map((division) => `divisions[]=${encodeURIComponent(division)}`)
          .join('&');

        url = baseUrl + `?${formatedDivisionsForQuery}`;
      } else {
        url = baseUrl;
      }

      const token = this.session.isAuthenticated ? this.session.data.authenticated.access_token : '';

      const noAttestationMessageNotification = this.intl.t('pages.attestations.no-attestations');

      await this.fileSaver.save({
        url,
        token,
        fileName: FILE_NAME,
        noContentMessageNotification: noAttestationMessageNotification,
      });
    } catch (error) {
      this.notifications.sendError(error.message, { autoClear: false });
    }
  }

  @action
  clearFilters() {
    this.statuses = [];
    this.divisions = [];
    this.search = null;
    this.pageNumber = 1;
  }

  @action
  triggerFiltering(fieldName, value) {
    this[fieldName] = value || undefined;
    this.pageNumber = 1;
  }
}
