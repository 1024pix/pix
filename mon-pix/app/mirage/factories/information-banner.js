import { Factory, trait } from 'miragejs';
import ENV from 'mon-pix/config/environment';

export default Factory.extend({
  id() {
    console.log(ENV.APP.APPLICATION_NAME);
    return ENV.APP.APPLICATION_NAME;
  },

  withoutBanners: trait({
    banners: [],
  }),
});
