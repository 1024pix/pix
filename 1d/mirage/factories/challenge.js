import { Factory, trait } from 'miragejs';

export default Factory.extend({
  type: 'QROC',
  instruction: 'Dans le village de Montrésor (37, France), sur quelle rue débouche la rue des Perrières ?',
  embedUrl: 'https://www.pix.fr',
  embedHeight: '600',
  embedTitle: 'Applications',
  proposals: 'Rue de : ${Rue#}',
  autoReply: false,

  QROCWithTextArea: trait({
    format: 'paragraphe',
  }),
  QROCWithSelect: trait({
    type: 'QROC',
    instruction: 'Un QROC est une question',
    proposals: 'Select: ${banana#tomatoPlaceholder§saladAriaLabel options=["good-answer","bad-answer"]}',
  }),
  QROCWithMultipleSelect: trait({
    type: 'QROCM-ind',
    instruction: 'Un QROCM attend plusieurs réponses.',
    proposals:
      'Banana: ${banana# - Sélectionne - §banana options=["a","b"]}\nPeach: ${peach# - Sélectionne - §peach options=["c","d"]}',
    embedUrl: '',
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
  QCU: trait({
    type: 'QCU',
    instruction: 'Sélectionne la bonne réponse.',
    proposals: '- Profil 1\n- bad-answer \n- Profil 3\n- Profil 4\n- Profil 5\n- Profil 6',
  }),
});
