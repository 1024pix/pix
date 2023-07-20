import { Factory, trait } from 'miragejs';

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
  QROCWithTextArea: trait({
    format: 'paragraphe',
  }),
  QROCWithSelect: trait({
    type: 'QROC',
    instruction: 'Un QROC est une question',
    proposals: 'Select: ${banana#tomatoPlaceholder§saladAriaLabel options=["good-answer","bad-answer"]}',
  }),
  QROCM: trait({
    type: 'QROCM-dep',
    instruction: 'Trouve les bonnes réponses.',
    proposals:
      'Le prénom est : ${prenom §prenom}\n\nLe livre est : ${livre# - Sélectionne - §livre options=["good-answer","bad-answer"]}',
  }),
  QCM: trait({
    type: 'QCM',
    instruction: 'Sélectionne les bonnes réponses.',
    proposals: '- Profil 1\n- bad-answer \n- Profil 3\n- Profil 4\n- Profil 5\n- Profil 6',
  }),
});
