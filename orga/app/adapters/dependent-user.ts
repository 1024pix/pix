import type { Snapshot } from '@warp-drive/legacy/compat/-private';

import ApplicationAdapter from './application';

export default class DependentUserAdapter extends ApplicationAdapter {
  urlForCreateRecord(
    modelName: string,
    snapshot: Snapshot & { adapterOptions?: { generateUsernameAndTemporaryPassword?: boolean } },
  ): string {
    const path = snapshot.adapterOptions?.generateUsernameAndTemporaryPassword
      ? 'sco-organization-learners/username-password-generation'
      : 'sco-organization-learners/password-update';
    return this.apiUrl(path);
  }
}
