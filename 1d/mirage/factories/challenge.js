import { Factory } from 'miragejs';

export default Factory.extend({
  type() {
    return 'QROC';
  },

  instruction() {
    return 'Dans le village de Montrésor (37, France), sur quelle rue débouche la rue des Perrières ?';
  },
  embedUrl() {
    return 'https://www.pix.fr';
  },
  embedHeight() {
    return '600';
  },
  embedTitle() {
    return 'Applications';
  },
  proposals() {
    return 'Rue de : ${Rue#}';
  },
});
