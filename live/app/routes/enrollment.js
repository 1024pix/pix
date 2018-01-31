import { hash } from 'rsvp';
import { inject as service } from '@ember/service';
import BaseRoute from 'pix-live/routes/base-route';

const pixDescriptionGoals = [
  'Faciliter l\'évaluation des compétences et connaissances numériques des élèves (à partir de la 4ème) et des étudiants',
  'Identifier le niveau collectif d\'une classe ou d\'une cohorte d\'étudiants pour mieux cibler les contenus de vos enseignements',
  'Connaître le niveau de chacun pour adapter et différencier vos pratiques pédagogiques',
  'Suivre les progrès des élèves et des étudiants tout au long de leur parcours',
  'Motiver les élèves et les étudiants par des défis',
  'Permettre aux élèves et aux étudiants d\'obtenir un profil de compétences certifié, reconnu par l\'État et le monde professionnel.'
];

const stepsForPioneersInstitutions = [
  {
    id: 'scolaire',
    title: 'Pour les collèges et lycées',
    destinataires: 'élèves',
    image: 'icon-college.svg',
    steps: [
      {
        date: 'Jusqu\'à fin avril 2018',
        description: 'Les collèges et lycées qui souhaitent proposer la certification Pix à leurs élèves s\'inscrivent auprès de Pix.'
      }, {
        description: 'Les équipes pédagogiques découvrent les fonctionnalités de Pix (formations courtes en ligne).'
      }, {
        description: 'Les collégiens (à partir de la 4ème) et les lycéens se créent un compte Pix et s\'évaluent, compétence après compétence, sur la plateforme.'
      }, {
        description: 'Les élèves font remonter leurs profils de compétence Pix à leurs enseignants.'
      }, {
        description: 'Les établissements peuvent identifier les besoins de leurs élèves, organiser un accompagnement ciblé et mesurer les progrès au long de l\'année.'
      }, {
        date: 'De mai à juin 2018',
        description: 'Les collèges et lycées organisent des sessions de certification pour les élèves.'
      },
    ]
  },
  {
    id: 'superieur',
    title: 'Pour l\'Enseignement supérieur',
    destinataires: 'étudiants',
    image: 'icon-etudiants.svg',
    steps: [
      {
        date: 'Jusqu’à fin septembre 2017',
        description: 'Inscription des établissements pour le 2nd semestre.'
      }, {
        description: 'Possibilité d\'organiser une pré-campagne d\'évaluation des étudiants en cycle d\'accueil (limitée à certaines compétences).'
      }, {
        description: 'Les universités et les écoles peuvent proposer des modules d\'enseignement ciblé sur les compétences et la culture numérique (ex modules C2i).'
      }, {
        description: 'Les étudiants testent leurs compétences sur la plateforme et constituent leurs profils.'
      }, {
        date: 'De mi-décembre 2017 à février 2018 ',
        description: 'Les établissements organisent en présentiel des sessions de certification.'
      },
    ]
  }
];

const pixCommitments = [
  'Pouvoir mesurer avec précision les compétences numériques des élèves et étudiants à l\'aide d\'un outil innovant, original, intuitif ... et modeste ;)',
  'Faire profiter les élèves et les étudiants de la nouvelle certification prenant la relève du B2i et du C2i',
  'Créer dans son établissement une dynamique pédagogique autour des compétences numériques',
  'Préparer son établissement pour la généralisation prévue pour 2018-2019',
  'Influencer par vos retours les futurs développements de la plateforme'
];

const pixUncommitments = [
  'Bénéficier de toutes les fonctionnalités de la plateforme dès la rentrée #versionbeta',
  'Croire que Pix va permettre à tous de se former sans l\'implication des équipes pédagogiques',
  'Penser qu\'un outil numérique permet se passer de l\'humain',
  'Réservé aux experts de l\'informatique',
  'Une obligation ministérielle !'
];

export default BaseRoute.extend({

  panelActions: service(),

  model() {
    return hash({
      pixDescriptionGoals: pixDescriptionGoals,
      stepsForPioneersInstitutions: stepsForPioneersInstitutions,
      pixCommitments: pixCommitments,
      pixUncommitments: pixUncommitments
    });
  }

});
