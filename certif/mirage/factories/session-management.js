import { Factory } from 'miragejs';
import { CREATED } from 'pix-certif/models/session-management';

export default Factory.extend({
  status() {
    return CREATED;
  },

  examinerGlobalComment(i) {
    if (i % 2 === 0) {
      return 'Un commentaire de session somme toute normal';
    }

    return '';
  },
});
