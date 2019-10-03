import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import ENV from 'mon-pix/config/environment';

export default Component.extend({
  session: service(),

  tooManySnapshots: computed('snapshots.meta.rowCount', function() {
    return this.get('snapshots.meta.rowCount') > 200;
  }),

  snapshotsExportUrl: computed('organization', function() {
    const organizationId = this.get('organization.id');
    const { access_token } = this.get('session.data.authenticated');
    return `${ENV.APP.API_HOST}/api/organizations/${organizationId}/snapshots/export?userToken=${access_token}`;
  }),
});
