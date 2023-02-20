import Joi from 'joi';

const CAMPAIGN_TYPES = ['EVALUATION', 'COLLECTE_PROFILS'];
const TEST_STATUS = [2, 3, 4];
const TEST_TYPES = ['DI', 'PC', 'CP'];
const UNITS = ['A', 'B'];

const campagne = Joi.object({
  nom: Joi.string().required().example('Campagne Pôle emploi').description('Nom de la campagne'),
  dateDebut: Joi.date()
    .required()
    .example('2020-11-31T12:00:38.133Z')
    .description('Date et heure de création de la campagne'),
  dateFin: Joi.date()
    .allow(null)
    .example('2020-11-31T12:00:38.133Z')
    .description("Date et heure de l'archivage de la campagne"),
  type: Joi.string()
    .required()
    .valid(...CAMPAIGN_TYPES)
    .example('EVALUATION')
    .description('Type de la campagne. EVALUATION ou COLLECTE_PROFILS'),
  codeCampagne: Joi.string().max(255).required().example('POLEEMPLOI').description('Code de la campagne'),
  urlCampagne: Joi.string()
    .max(255)
    .required()
    .example('https://app.pix.fr/campagnes/POLEEMPLOI')
    .description("URL campagne généré à partir de l'URL de pix et le code campagne"),
  nomOrganisme: Joi.string().required().valid('Pix').example('Pix').description("Nom de l'organisme (Pix"),
  typeOrganisme: Joi.string().required().valid('externe').example('externe').description("Type de l'organisme"),
}).required();

const individu = Joi.object({
  nom: Joi.string().required().max(255).example('Martin').description('Nom du participant'),
  prenom: Joi.string().required().max(255).example('Paul').description('Prénom du participant'),
  idPoleEmploi: Joi.string()
    .required()
    .max(255)
    .example('XXX')
    .description("Identifiant Pôle emploi du demandeur d'emploi"),
}).required();

const evaluation = Joi.object({
  scoreObtenu: Joi.number()
    .example(3.14)
    .description('Score sur l’ensemble des acquis évalués dans le test par compétence. Vide si pas encore partagé'),
  uniteScore: Joi.string()
    .valid(...UNITS)
    .example('A')
    .description('Unité de score. A: Pourcentage, B: Point'),
  certifiable: Joi.boolean()
    .example(true)
    .description('Uniquement pour les campagnes de collecte de profils. Vide si pas encore partagé'),
  niveau: Joi.number()
    .min(1)
    .max(8)
    .example(1)
    .description(
      'Pour une campagne de collecte de profils, niveau de la compétence (entre 1 et 8). Vide si pas encore partagé'
    ),
  nbSousElementValide: Joi.number()
    .example(10)
    .description("Pour une campagne d'évaluation, nombre d’acquis validés par compétence. Vide si pas encore partagé"),
});

const elementEvalue = Joi.object({
  libelle: Joi.string()
    .max(255)
    .required()
    .example('Mener une recherche et une veille d’information')
    .description("Libellé de l'élément évalué"),
  categorie: Joi.string()
    .required()
    .max(50)
    .valid('competence')
    .example('competence')
    .description("Catégorie de l'élément évalué"),
  type: Joi.string()
    .required()
    .max(50)
    .valid('competence Pix')
    .example('competence Pix')
    .description("Type de l'élément évalué"),
  domaineRattachement: Joi.string()
    .required()
    .max(255)
    .example('1. Information et données')
    .description("Domaine de rattachement de l'élément évalué"),
  nbSousElements: Joi.number()
    .example(2)
    .description("Pour campagne d'évaluation uniquement, nombre d’acquis total pour l'élément évalué"),
  evaluation,
});

const test = Joi.object({
  etat: Joi.number()
    .required()
    .valid(...TEST_STATUS)
    .example(2)
    .description("État du test. 2: En cours, 3: En attente d'envoi, 4: Validé"),
  typeTest: Joi.string()
    .required()
    .valid(...TEST_TYPES)
    .example('DI')
    .description('Code du profil cible Pix. DI: Diagnostic initial, PC: Parcours complet, CP: Profil PIX complet'),
  progression: Joi.number()
    .min(0)
    .max(100)
    .example(3.14)
    .description(
      "Uniquement pour les campagnes d'évaluation. Pourcentage de progression (obligatoire si état 2, si état > 2 alors 100%)"
    ),
  certifiable: Joi.boolean()
    .example(true)
    .description('Uniquement pour les campagnes de collecte de profils. Vide si pas encore partagé'),
  referenceExterne: Joi.number()
    .required()
    .example(12345)
    .description("Identifiant de la participation PIX d'une personne au test"),
  dateDebut: Joi.date().required().example('2020-11-31T12:00:38.133Z').description('Date de début du test'),
  dateProgression: Joi.date()
    .allow(null)
    .example('2020-11-31T12:00:38.133Z')
    .description('Date de la dernière réponse du test. Vide si pas encore commencé'),
  dateValidation: Joi.date()
    .allow(null)
    .example('2020-11-31T12:00:38.133Z')
    .description('Date du partage du test. Vide si pas encore partagé'),
  evaluation: Joi.number()
    .allow(null)
    .example(3.14)
    .description(
      "Pour une campagne d'évaluation, pourcentage de maîtrise de l'ensemble des acquis du profil. Pour une campagne de collecte de profils, score du participant. Vide si pas encore partagé"
    ),
  uniteEvaluation: Joi.string()
    .valid(...UNITS)
    .example('A')
    .description("Unité d'évaluation. A: Pourcentage, B: Point"),
  elementsEvalues: Joi.array().items(elementEvalue).description('Vide si pas de partage de résultats'),
}).required();

export default Joi.array()
  .items(
    Joi.object({
      idEnvoi: Joi.number().required().example(1234).description("Identifiant unique de l'envoi"),
      dateEnvoi: Joi.date().required().example('2020-11-31T12:00:38.133Z').description("Instant de la demande d'envoi"),
      resultat: Joi.object({ campagne, individu, test }).required(),
    }).label('Envoi')
  )
  .label('Envois');
