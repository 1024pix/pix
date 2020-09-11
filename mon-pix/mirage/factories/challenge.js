import { Factory, trait } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({

  id() {
    return `rec_${faker.random.alphaNumeric(5)}`;
  },

  type() {
    return 'QROC';
  },

  instruction() {
    return 'Dans le village de Montrésor (37, France), sur quelle rue débouche la rue des Perrières ?';
  },

  proposals() {
    return 'Rue de : ${Rue#}';
  },

  // NOTE : ID set in the afterCreate, else faker would always generate the same ID
  forCompetenceEvaluation: trait({
    afterCreate(challenge) {
      challenge.update({ id: `recCOMPEVAL_${faker.random.alphaNumeric(5)}` });
    },
  }),

  forCertification: trait({
    afterCreate(challenge) {
      challenge.update({ id: `recCERTIF_${faker.random.alphaNumeric(5)}` });
    },
  }),

  forDemo: trait({
    afterCreate(challenge) {
      challenge.update({ id: `recDEMO_${faker.random.alphaNumeric(5)}` });
    },
  }),

  forCampaign: trait({
    afterCreate(challenge) {
      challenge.update({ id: `recSMARPLA_${faker.random.alphaNumeric(5)}` });
    },
  }),

  QCM: trait({
    type: 'QCM',
    instruction: 'Un QCM propose plusieurs choix, l\'utilisateur peut en choisir plusieurs',
    attachments: ['http://example_of_url'],
    'illustration-url': 'http://fakeimg.pl/350x200/?text=PictureOfQCM',
    proposals: '- possibilite 1, et/ou' +
      '\n - possibilite 2, et/ou' +
      '\n - possibilite 3, et/ou' +
      '\n - possibilite 4',
  }),

  QCU: trait({
    type: 'QCU',
    instruction: 'Un QCU propose plusieurs choix, l\'utilisateur peut en choisir un seul',
    attachments: ['file.docx', 'file.odt'],
    'illustration-url': 'http://fakeimg.pl/350x200/?text=QCU',
    proposals: '- 1ere possibilite\n ' +
      '- 2eme possibilite\n ' +
      '- 3eme possibilite\n' +
      '- 4eme possibilite',
  }),

  QROC: trait({
    type: 'QROC',
    instruction: 'Un QROC est une question ouverte avec un simple champ texte libre pour répondre',
    proposals: 'Entrez le prénom de B. Gates : ${firstname#prénom} (en toutes lettres)\nSVP',
  }),

  withAutoReply: trait({
    autoReply: true,
  }),

  withTextArea: trait({
    format: 'paragraphe',
  }),

  QROCM: trait({
    type: 'QROCM',
    instruction: 'Un QROCM est une question avec plusieurs champs texte libres pour répondre',
    proposals: 'Trois logiciels libres : ${logiciel1#un} ${logiciel2#deux} ${logiciel3#trois}\nMerci',
  }),

  QROCMind: trait({
    type: 'QROCM-ind',
    instruction: 'L\'URL suivante, censée aboutir à un article, donne lieu à une redirection vers la page d\'accueil du site. Retrouvez la page recherchée. Reportez le titre de l’article et son auteur.',
    proposals: 'Titre : ${titre}\n' + 'Auteur : ${auteur}',
  }),

  QROCMDep: trait({
    type: 'QROCM-dep',
    instruction: 'Aurélie est montée dans le métro après avoir pris cette photo sur le quai.\n A quelle station peut-elle descendre ?',
    proposals: 'Station 1 : ${station1}\n' + 'Station 2 : ${station2}',
  }),

  timed: trait({
    timer: faker.random.number(),
  }),

  QROCwithFile1: trait({
    type: 'QROC',
    instruction: 'Un QROC avec deux fichiers',
    attachments: ['file1.docx', 'file1.odt'],
    'illustration-url': 'http://fakeimg.pl/350x200/?text=QCU',
    proposals: 'Entrez la premiere ligne ${ligne1}',
  }),

  QROCwithFile2: trait({
    type: 'QROC',
    instruction: 'Un QROC avec deux fichiers, deuxieme version',
    attachments: ['file2.docx', 'file2.odt'],
    'illustration-url': 'http://fakeimg.pl/350x200/?text=QCU',
    proposals: 'Entrez la premiere ligne ${ligne2}',
  }),

  withAttachment: trait({
    attachments: [faker.internet.url()],
  }),

  withEmbed: trait({
    embedUrl: 'https://example.biz',
    embedTitle: faker.random.words(),
    embedHeight: '100',
  }),

});
