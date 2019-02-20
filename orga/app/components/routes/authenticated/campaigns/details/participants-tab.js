import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({

  store: service(),

  participants: null,

  init({ campaign }) {
    this._super(...arguments);
    this.get('store').query('campaignParticipation', {
      filter: {
        campaignId: campaign.id,
      },
      page: {
        number: 1,
        size: 10,
      },
      sort: '-createdAt',
      include: 'user'
    }).then((participants) => {
      this.set('participants', participants);
    });
  }

});
