import { Factory } from 'ember-cli-mirage';

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

  pixCertifTermsOfServiceAccepted() {
    return false;
  },
});
