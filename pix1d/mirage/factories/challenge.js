import { Factory } from 'miragejs';

export default Factory.extend({
  type() {
    return 'QROC';
  },

  instruction() {
    return 'Dans le village de Montrésor (37, France), sur quelle rue débouche la rue des Perrières ?';
  },

  proposals() {
    return 'Rue de : ${Rue#}';
  },
});
