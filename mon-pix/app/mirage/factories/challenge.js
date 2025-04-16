import { Factory, trait } from 'miragejs';

export default Factory.extend({
  id() {
    return 'rec_' + Math.random().toString(36).slice(2, 7);
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

  forCompetenceEvaluation: trait({
    afterCreate(challenge) {
      challenge.update({ id: 'recCOMPEVAL_' + Math.random().toString(36).slice(2, 7) });
    },
  }),

  forCertification: trait({
    afterCreate(challenge) {
      challenge.update({ id: 'recCERTIF_' + Math.random().toString(36).slice(2, 7) });
    },
  }),

  forDemo: trait({
    afterCreate(challenge) {
      challenge.update({ id: 'recDEMO_' + Math.random().toString(36).slice(2, 7) });
    },
  }),

  forCampaign: trait({
    afterCreate(challenge) {
      challenge.update({ id: 'recSMARPLA_' + Math.random().toString(36).slice(2, 7) });
    },
  }),

  QCM: trait({
    type: 'QCM',
    instruction: "Un QCM propose plusieurs choix, l'utilisateur peut en choisir plusieurs",
    attachments: ['http://example_of_url'],
    'illustration-url': 'http://fakeimg.pl/350x200/?text=PictureOfQCM',
    proposals:
      '- *possibilite* 1, et/ou' +
      '\n - [possibilite 2](/test), et/ou' +
      '\n - ![possibilite 3](/images/pix-logo-blanc.svg), et/ou' +
      '\n - possibilite 4',
  }),

  QCU: trait({
    type: 'QCU',
    instruction: "Un QCU propose plusieurs choix, l'utilisateur peut en choisir un seul",
    attachments: ['file.docx', 'file.odt'],
    'illustration-url': 'http://fakeimg.pl/350x200/?text=QCU',
    proposals:
      '- 1ere *possibilite*\n ' +
      '- 2eme [possibilite](/test)\n ' +
      '- ![3eme possibilite](/images/pix-logo-blanc.svg)\n' +
      '- 4eme possibilite',
  }),

  QROC: trait({
    type: 'QROC',
    instruction: 'Un QROC est une question ouverte avec un simple champ texte libre pour répondre',
    proposals: 'Entrez le *prénom* de B. Gates : ${firstname#prénom} (en toutes lettres)\nSVP',
  }),

  withAutoReply: trait({
    autoReply: true,
  }),

  withTextArea: trait({
    format: 'paragraphe',
  }),

  QROCWithSelect: trait({
    type: 'QROC',
    instruction: 'Un QROC est une question',
    proposals: 'Select: ${banana#tomatoPlaceholder§saladAriaLabel options=["mango","potato"]}',
  }),

  QROCM: trait({
    type: 'QROCM',
    instruction: 'Un QROCM est une question avec plusieurs champs texte libres pour répondre',
    proposals: 'Trois logiciels libres : ${logiciel1#un} ${logiciel2#deux} ${logiciel3#trois}\nMerci',
  }),

  QROCMind: trait({
    type: 'QROCM-ind',
    instruction:
      "L'URL suivante, censée aboutir à un article, donne lieu à une redirection vers la page d'accueil du site. Retrouvez la page recherchée. Reportez le titre de l’article et son auteur.",
    proposals: 'Titre : ${titre}\n' + 'Auteur : ${auteur}',
  }),

  QROCMDep: trait({
    type: 'QROCM-dep',
    instruction:
      'Aurélie est montée dans le métro après avoir pris cette photo sur le quai.\n A quelle station peut-elle descendre ?',
    proposals: 'Station **1** : ${station1}\n' + 'Station *2* : ${station2}',
  }),

  QROCMWithSelect: trait({
    type: 'QROCM-ind',
    instruction:
      "L'URL suivante, censée aboutir à un article, donne lieu à une redirection vers la page d'accueil du site. Retrouvez la page recherchée. Reportez le titre de l’article et son auteur.",
    proposals: 'Select: ${banana#tomatoPlaceholder§saladAriaLabel options=["mango","potato"]}',
  }),

  timed: trait({
    timer: 92159,
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
    attachments: ['https://pix.fr/_nuxt/image/73cc59.svg'],
  }),

  withEmbed: trait({
    embedUrl: 'https://example.biz',
    embedTitle: 'a title',
    embedHeight: '100',
  }),

  withFocused: trait({
    focused: true,
  }),
});
