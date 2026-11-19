import type { Snapshot } from '@warp-drive/legacy/compat/-private';

import ApplicationAdapter from './application';

export default class DependentUserAdapter extends ApplicationAdapter {
  urlForCreateRecord(
    modelName: string,
    snapshot: Snapshot & { adapterOptions?: { generateUsernameAndTemporaryPassword?: boolean } },
  ): string {
    return snapshot.adapterOptions?.generateUsernameAndTemporaryPassword
      ? this.apiUrl('sco-organization-learners/username-password-generation')
      : this.apiUrl('sco-organization-learners/password-update');
  }
}
