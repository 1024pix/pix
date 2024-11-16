import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export const SIXTH_GRADE_ATTESTATION_KEY = 'SIXTH_GRADE';
export const SIXTH_GRADE_ATTESTATION_FILE_NAME = 'attestations';

export default class AuthenticatedAttestationsController extends Controller {
  @service fileSaver;
  @service session;
  @service currentUser;
  @service notifications;

  @action
  async downloadSixthGradeAttestationsFile(selectedDivisions) {
    try {
      const organizationId = this.currentUser.organization.id;
      const formatedDivisionsForQuery = selectedDivisions
        .map((division) => `divisions[]=${encodeURIComponent(division)}`)
        .join('&');

      const url = `/api/organizations/${organizationId}/attestations/${SIXTH_GRADE_ATTESTATION_KEY}?${formatedDivisionsForQuery}`;

      const token = this.session.isAuthenticated ? this.session.data.authenticated.access_token : '';

      await this.fileSaver.save({ url, token, fileName: SIXTH_GRADE_ATTESTATION_FILE_NAME });
    } catch (error) {
      this.notifications.sendError(error.message, { autoClear: false });
    }
  }
}
