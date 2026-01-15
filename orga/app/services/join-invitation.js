import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { SessionStorageEntry } from 'pix-orga/utils/session-storage-entry';

const invitationStorage = new SessionStorageEntry('joinInvitationData');

export default class JoinInvitationService extends Service {
  @service store;

  @tracked error = null;

  get invitation() {
    return invitationStorage.get();
  }

  async load({ invitationId, code }) {
    this.#reset();

    try {
      const result = await this.store.queryRecord('organization-invitation', { invitationId, code });

      const invitation = { invitationId, code, organizationName: result.organizationName };
      invitationStorage.set(invitation);

      return invitation;
    } catch (errorResponse) {
      const error = errorResponse?.errors[0];
      if (error.status === '403') {
        this.error = 'INVITATION_CANCELLED';
      } else if (error.status === '412') {
        this.error = 'INVITATION_ALREADY_ACCEPTED';
      } else if (error.status === '404') {
        this.error = 'INVITATION_NOT_FOUND';
      }
    }
  }

  async acceptInvitationByEmail(email) {
    await this.#acceptInvitation({ email });
  }

  async acceptInvitationByUserId(userId) {
    await this.#acceptInvitation({ userId });
  }

  /** Accepts an invitation from either an email or a userId. */
  async #acceptInvitation({ email, userId }) {
    console.log({ userId });
    if (!this.invitation) return;

    let record;
    try {
      const { invitationId, code } = this.invitation;
      const id = `${invitationId}_${code}`;
      const organizationInvitationRecord = this.store.peekRecord('organization-invitation-response', id);
      if (organizationInvitationRecord) return;

      record = this.store.createRecord('organization-invitation-response', { id, code, email, userId });
      await record.save({ adapterOptions: { organizationInvitationId: invitationId } });
    } catch (responseError) {
      console.log('ERROR', { responseError });
      record?.deleteRecord();
      const error = responseError?.errors[0];
      const isUserAlreadyOrganizationMember = error?.status === '412';
      if (isUserAlreadyOrganizationMember) return;
      throw responseError;
    } finally {
      this.#reset();
    }
  }

  #reset() {
    this.error = null;
    invitationStorage.remove();
  }
}
