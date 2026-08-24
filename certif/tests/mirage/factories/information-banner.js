import { Factory, trait } from 'miragejs';
import ENV from 'pix-certif/config/environment';

export default Factory.extend({
  id() {
    return ENV.APP.APPLICATION_NAME;
  },

  withoutBanners: trait({
    banners: [],
  }),
});
