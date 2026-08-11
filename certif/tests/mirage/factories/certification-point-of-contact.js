import { Factory } from 'miragejs';

export default Factory.extend({
  firstName() {
    return 'Laura';
  },

  lastName() {
    return 'PassTaCertif';
  },

  email() {
    return 'laura.passtacertif@example.net';
  },

  lang() {
    return 'fr';
  },

  pixCertifTermsOfServiceAccepted() {
    return false;
  },
});
