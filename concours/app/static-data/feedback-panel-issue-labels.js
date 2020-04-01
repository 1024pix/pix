const topLevelLabels = [
  {
    name: 'La question',
    value: 'instructions',
  },
  {
    name: 'L’image',
    value: 'picture',
    displayOnlyOnChallengePage: true,
  },
  {
    name: 'Le lien indiqué dans la question',
    value: 'link',
  },
  {
    name: 'Le simulateur / l\'application',
    value: 'simulator',
  },
  {
    name: 'Le fichier à télécharger',
    value: 'download',
  },
  {
    name: 'La réponse',
    value: 'answer',
    displayOnlyOnComparisonWindow: true
  },
  {
    name: 'Le tutoriel',
    value: 'tutorial',
    displayOnlyOnComparisonWindow: true
  },
  {
    name: 'Autre',
    value: 'other',
  },
];

const questions = {
  'instructions': [
    {
      name: 'Je ne comprends pas la question',
      type: 'textbox',
    },
    {
      name: 'Je souhaite proposer une amélioration de la question',
      type: 'textbox',
    },
  ],
  'picture': [
    {
      name: 'image',
      type: 'tutorial',
      content: `Votre connexion internet est peut-être trop faible. <br>
        Rechargez la page en appuyant sur le bouton actualiser <object type="image/svg+xml" class="tuto-icon" data="/images/icons/icon-reload.svg"></object> à côté de la barre d’adresse. Attendez un peu, le simulateur va peut-être s’afficher. <br><br>
        Si ce n’est pas le cas, pouvez-vous retenter à un autre moment ou depuis un autre endroit avec une meilleure connexion&nbsp;?`
    }
  ],
  'link': [
    {
      name: 'link',
      type: 'textbox',
    }
  ],
  'simulator': [
    {
      name: 'Le simulateur / l’application ne s’affiche pas',
      type: 'tutorial',
      content: `Votre connexion internet est peut-être trop faible. <br>
        Rechargez la page en appuyant sur le bouton actualiser <object type="image/svg+xml" class="tuto-icon" data="/images/icons/icon-reload.svg"></object> à côté de la barre d’adresse. Attendez un peu, le simulateur va peut-être s’afficher. <br><br>
        Si ce n’est pas le cas, pouvez-vous retenter à un autre moment ou depuis un autre endroit avec une meilleure connexion&nbsp;?`
    },
    {
      name: 'Le simulateur / l’application a un autre problème',
      type: 'textbox',
    },
  ],
  'download': [
    {
      name: 'Je n’arrive pas à ouvrir le fichier sur un ordinateur',
      type: 'tutorial',
      content: `Pour réussir cette épreuve, vous pouvez utiliser la suite LibreOffice, gratuite et disponible pour PC et Mac. Elle contient Libre Office Writer (équivalent à Word) et Libre Office Calc (équivalent à Excel). 
      <a href="https://fr.libreoffice.org/download/telecharger-libreoffice">Télécharger Libre Office</a>`
    },
    {
      name: 'Je ne retrouve pas le fichier téléchargé',
      type: 'tutorial',
      content: `Par défaut, un fichier téléchargé est enregistré dans un dossier “Téléchargements” ou “Downloads”. 
       Il se peut aussi qu’il soit téléchargé au même endroit que votre dernier téléchargement...`
    },
    {
      name: 'Je n’arrive pas à modifier le fichier',
      type: 'tutorial',
      content: `Le fichier est probablement ouvert en “Lecture seule” ou “Mode protégé”. <br> 
      Cliquez sur “Activer la modification” ou “Éditer le document” sur le bandeau en haut du fichier s’il s’affiche. <br> 
      Sinon enregistrez le fichier sous un autre nom et ouvrez ce nouveau fichier.`
    },
    {
      name: 'J’ai un autre problème avec le fichier',
      type: 'textbox',
    },
  ],
  'answer': [
    {
      name: 'Je ne suis pas d’accord avec la réponse',
      type: 'textbox',
    },
    {
      name: 'Ma réponse est correcte mais n’a pas été validée',
      type: 'textbox',
    },
  ],
  'tutorial': [
    {
      name: 'Le tutoriel n’est pas adapté',
      type: 'textbox',
    },
    {
      name: 'Le lien vers le tutoriel mène vers une autre page ou une page d’erreur',
      type: 'textbox',
    },
    {
      name: 'J’ai un tutoriel à vous proposer',
      type: 'textbox',
    },
  ],
  'other': [
    {
      name: 'J’ai une idée (géniale) d’épreuve à proposer',
      type: 'textbox',
    },
    {
      name: 'J’ai une suggestion d’amélioration de la plateforme',
      type: 'textbox',
    },
    {
      name: 'J’ai un autre problème',
      type: 'textbox',
    },
  ]
};

export { topLevelLabels, questions };
