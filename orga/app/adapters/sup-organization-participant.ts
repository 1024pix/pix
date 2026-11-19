import type { Store } from '@warp-drive/core';
import type { ModelSchema } from '@warp-drive/core/types';
import type { Snapshot } from '@warp-drive/legacy/compat/-private';

import OrganizationParticipantAdapter from './organization-participant';

type UpdateStudentNumberSnapshot = Snapshot & {
  adapterOptions?: { updateStudentNumber?: boolean; organizationId: string; studentNumber: string };
};

export default class SupOrganizationParticipantAdapter extends OrganizationParticipantAdapter {
  protected participantsResource = 'sup-participants';

  updateRecord(store: Store, type: ModelSchema, snapshot: UpdateStudentNumberSnapshot) {
    if (!snapshot.adapterOptions?.updateStudentNumber) {
      return super.updateRecord(store, type, snapshot);
    }

    const { organizationId, studentNumber } = snapshot.adapterOptions;
    const url = this.apiUrl(`organizations/${organizationId}/sup-organization-learners/${snapshot.id}`);
    const payload = { data: { attributes: { 'student-number': studentNumber } } };
    return this.ajax(url, 'PATCH', { data: payload });
  }
}
