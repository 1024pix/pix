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
    }
  }),

  forCertification: trait({
    afterCreate(challenge) {
      challenge.update({ id: `recCERTIF_${faker.random.alphaNumeric(5)}` });
    }
  }),

  forDemo: trait({
    afterCreate(challenge) {
      challenge.update({ id: `recDEMO_${faker.random.alphaNumeric(5)}` });
    }
  }),

  forSmartPlacement: trait({
    afterCreate(challenge) {
      challenge.update({ id: `recSMARPLA_${faker.random.alphaNumeric(5)}` });
    }
  }),

  QCM: trait({
    type: 'QCM',
    instruction: 'Un QCM propose plusieurs choix, l\'utilisateur peut en choisir plusieurs',
    attachments: ['http://example_of_url'],
    'illustration-url': 'http://fakeimg.pl/350x200/?text=PictureOfQCM',
    proposals: '- possibilite 1, et/ou' +
      '\n - possibilite 2, et/ou' +
      '\n - possibilite 3, et/ou' +
      '\n - possibilite 4'
  }),

  QCU: trait({
    type: 'QCU',
    instruction: 'Un QCU propose plusieurs choix, l\'utilisateur peut en choisir un seul',
    attachments: ['file.docx', 'file.odt'],
    'illustration-url': 'http://fakeimg.pl/350x200/?text=QCU',
    proposals: '- 1ere possibilite\n ' +
      '- 2eme possibilite\n ' +
      '- 3eme possibilite\n' +
      '- 4eme possibilite'
  }),

  QROC: trait({
    type: 'QROC',
    instruction: 'Un QROC est une question ouverte avec un simple champ texte libre pour répondre',
    proposals: 'Entrez le prénom de B. Gates : ${firstname#prénom} (en toutes lettres)\nSVP'
  }),

  QROCM: trait({
    type: 'QROCM',
    instruction: 'Un QROCMMMMM est une question avec plusieurs champs texte libre pour repondre',
    proposals: 'Trois logiciels libres : ${logiciel1#un} ${logiciel2#deux} ${logiciel3#trois}\nMerci'
  }),

  QROCMind: trait({
    type: 'QROCM-ind',
    instruction: 'L\'URL suivante, censée aboutir à un article, donne lieu à une redirection vers la page d\'accueil du site. Retrouvez la page recherchée. Reportez le titre de l’article et son auteur.  \n' + '\n' + '> https://www.cairn.info/revue-reseaux-2011-numero1-page-137.htm',
    proposals: 'Titre : ${titre}\n' + 'Auteur : ${auteur}'
  }),

  timed: trait({
    timer: faker.random.number(),
  }),

  withAttachment: trait({
    attachments: [faker.internet.url()],
  }),

});
