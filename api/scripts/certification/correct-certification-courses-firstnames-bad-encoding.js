import { knex } from '../../db/knex-database-connection.js';
import { Script } from '../../src/shared/application/scripts/script.js';
import { ScriptRunner } from '../../src/shared/application/scripts/script-runner.js';

export class CorrectCertificationCoursesFirstnamesBadEncoding extends Script {
  constructor() {
    super({
      description:
        'Some candidates firstnames in certification-courses and certification-candidates tables have some badly ' +
        'encoded accents. The goal here is to replace those weirdly encoded characters (UTF-8 ↔ ISO-8859-1)',
      permanent: false,
      options: {
        dryRun: {
          type: 'boolean',
          describe: 'Run the script without making any database changes',
          default: true,
        },
      },
    });
  }

  async handle({ logger, options }) {
    const { dryRun } = options;
    logger.info(`Script execution started with options ${JSON.stringify(options)}`);

    const trx = await knex.transaction();

    try {
      const correctedCertificationCourseIds = await correctFirstNames(trx, 'certification-courses');
      const correctedCertificationCandidateIds = await correctFirstNames(trx, 'certification-candidates');

      const certificationCoursesTotal = correctedCertificationCourseIds.size;
      const certificationCandidatesTotal = correctedCertificationCandidateIds.size;

      if (dryRun) {
        await trx.rollback();
        logger.info(
          `${certificationCoursesTotal} certification-courses rows and ` +
            `${certificationCandidatesTotal} certification-candidates rows would have been updated`,
        );
        return;
      } else {
        await trx.commit();
        logger.info(
          `Script finished. Number of rows with weirdly encoded firstnames corrected : ` +
            `${certificationCoursesTotal} certification-courses, ` +
            `${certificationCandidatesTotal} certification-candidates, youpi`,
        );
      }
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}

async function correctFirstNames(trx, tableName) {
  const correctedIds = new Set();

  for (const { badAccent, goodAccent } of badlyEncodedAccents) {
    const updatedRows = await trx(tableName)
      .where('firstName', 'like', `%${badAccent}%`)
      .update({ firstName: knex.raw('REPLACE(??, ?, ?)', ['firstName', badAccent, goodAccent]) })
      .returning('id');

    updatedRows.forEach(({ id }) => correctedIds.add(id));
  }

  const corrections = { ...firstNamesDictionary1, ...firstNamesDictionary2 };
  for (const [badFirstName, goodFirstName] of Object.entries(corrections)) {
    const updatedRows = await trx(tableName)
      .where('firstName', badFirstName)
      .update({ firstName: goodFirstName })
      .returning('id');

    updatedRows.forEach(({ id }) => correctedIds.add(id));
  }

  return correctedIds;
}

const badlyEncodedAccents = [
  { badAccent: 'Ã©', goodAccent: 'é' },
  { badAccent: 'Ã¨', goodAccent: 'è' },
  { badAccent: 'Ã«', goodAccent: 'ë' },
  { badAccent: 'Ã¯', goodAccent: 'ï' },
  { badAccent: 'Ã§', goodAccent: 'ç' },
];

const firstNamesDictionary1 = {
  'Amï¿œlia': 'Amélia',
  'Amï¿œlie': 'Amélie',
  'Anaï¿œlle': 'Anaëlle',
  'Anaï¿œs': 'Anaïs',
  'Andrï¿œa': 'Andréa',
  'Angï¿œle': 'Angèle',
  'Angï¿œlo': 'Angélo',
  'Anne-Amï¿œlie': 'Anne-Amélie',
  'Aurï¿œlia': 'Aurélia',
  'Aurï¿œlien': 'Aurélien',
  'Azalï¿œe': 'Azalée',
  'Azï¿œlie': 'Azélie',
  'Bï¿œatrice': 'Béatrice',
  'Bï¿œrangï¿œre': 'Bérangère',
  'Bï¿œrenger': 'Bérenger',
  'Bï¿œrï¿œnice': 'Bérénice',
  'Cï¿œcile': 'Cécile',
  'Cï¿œcilia': 'Cécilia',
  'Cï¿œdric': 'Cédric',
  'Cï¿œlia': 'Célia',
  'Cï¿œlian': 'Célian',
  'Charlï¿œne': 'Charlène',
  'Chloï¿œ': 'Chloé',
  'Clï¿œmence': 'Clémence',
  'Clï¿œment': 'Clément',
  'Danaï¿œ': 'Danaé',
  'Dorothï¿œe': 'Dorothée',
  'Elï¿œonore': 'Eléonore',
  'Fï¿œlicie': 'Félicie',
  'Fï¿œlix': 'Félix',
  'Franï¿œois': 'François',
  'Gaï¿œtane': 'Gaëtane',
  'Galatï¿œe': 'Galatée',
  'Grï¿œgoire': 'Grégoire',
  'Hï¿œloï¿œse': 'Héloïse',
  'Inï¿œs': 'Inès',
  'Ismaï¿œl': 'Ismaël',
  'Jï¿œrï¿œme': 'Jérôme',
  'Joï¿œl': 'Joël',
  'Kouamï¿œ': 'Kouamé',
  'Laurï¿œne': 'Laurène',
  'Lï¿œa': 'Léa',
  'Lï¿œna': 'Léna',
  'Lï¿œo': 'Léo',
  'Lï¿œon': 'Léon',
  'Lï¿œonard': 'Léonard',
  'Lï¿œopold': 'Léopold',
  'Loï¿œc': 'Loïc',
  'Loï¿œse': 'Loïse',
  'Macï¿œo': 'Macéo',
  'Maï¿œline': 'Maëline',
  'Maï¿œlys': 'Maëlys',
  'Marie-Grï¿œce': 'Marie-Grâce',
  'Mathï¿œo': 'Mathéo',
  'Mattï¿œo': 'Mattéo',
  'Matthï¿œo': 'Matthéo',
  'Mï¿œlina': 'Mélina',
  'Mï¿œline': 'Méline',
  'Mï¿œlissa': 'Mélissa',
  'Mï¿œlodie': 'Mélodie',
  'Michaï¿œl': 'Michaël',
  'Mickaï¿œl': 'Mickaël',
  'Naï¿œl': 'Naël',
  'Naï¿œma': 'Naïma',
  'Nï¿œo': 'Néo',
  'Noï¿œ': 'Noé',
  'Ocï¿œane': 'Océane',
  'Raphaï¿œl': 'Raphaël',
  'Rï¿œmi': 'Rémi',
  'Salomï¿œ': 'Salomé',
  'Sï¿œlï¿œne': 'Sélène',
  'Solï¿œne': 'Solène',
  'Thaï¿œs': 'Thaïs',
  'Thï¿œa': 'Théa',
  'Thï¿œo': 'Théo',
  'Timï¿œo': 'Timéo',
  'Timothï¿œ': 'Timothé',
  'Timothï¿œe': 'Timothée',
  'Waï¿œl': 'Waël',
  'Wenaï¿œl': 'Wenaël',
  'Zï¿œlie': 'Zélie',
  'Zï¿œphire': 'Zéphire',
  'Zoï¿œ': 'Zoé',
};

const firstNamesDictionary2 = {
  'Aim�': 'Aimé',
  'Aliz�a': 'Alizéa',
  'Am�lie': 'Amélie',
  'Ana�lle': 'Anaëlle',
  'Ana�s': 'Anaïs',
  'Ang�lique': 'Angélique',
  'Aur�lie Jos�phine Marina': 'Aurélie Joséphine Marina',
  'Aur�lien': 'Aurélien',
  'Beno�t': 'Benoît',
  'Bethsa�da': 'Bethsaïda',
  'C�lia': 'Célia',
  'C�sar': 'César',
  'Charl�ne': 'Charlène',
  'Chlo�': 'Chloé',
  'Cl�mence': 'Clémence',
  'Cl�mentine': 'Clémentine',
  'Elo�se': 'Eloïse',
  'Eryne-Zo�': 'Eryne-Zoé',
  'Eug�ne': 'Eugène',
  'F�lice': 'Félice',
  'Fran�ois': 'François',
  'Ga�l': 'Gaël',
  'G�raldine': 'Géraldine',
  'Gr�gory': 'Grégory',
  'Gwena�lle': 'Gwenaëlle',
  'Gwenna�s': 'Gwennaïs',
  'H�l�na': 'Héléna',
  'H�l�ne': 'Hélène',
  'H�lo�se': 'Héloïse',
  'In�s': 'Inès',
  'Jean-Fran�ois': 'Jean-François',
  'K�vin': 'Kévin',
  'L�a': 'Léa',
  'L�ana': 'Léana',
  'L�ane': 'Léane',
  'L�anne': 'Léanne',
  'L�ia': 'Léia',
  'Lena�g': 'Lenaïg',
  'L�o': 'Léo',
  'L�onie': 'Léonie',
  'Ma�li': 'Maëli',
  'Ma�lie': 'Maëlie',
  'Ma�lyne': 'Maëlyne',
  'Ma�va': 'Maëva',
  'Mah�': 'Mahé',
  'Ma�ana': 'Maïana',
  'Mano�lle': 'Manoëlle',
  'Mat�o': 'Matéo',
  'Math�o': 'Mathéo',
  'Matt�o': 'Mattéo',
  'Matth�o': 'Matthéo',
  'M�lanie': 'Mélanie',
  'M�lina': 'Mélina',
  'M�linda': 'Mélinda',
  'M�lodie': 'Mélodie',
  'Na�ma': 'Naïma',
  'Natha�l': 'Nathaël',
  'No�': 'Noé',
  'No�mie': 'Noémie',
  'No�my': 'Noëmy',
  'Oc�ane': 'Océane',
  'Oph�lie': 'Ophélie',
  'P�n�lope': 'Pénélope',
  'Rapha�l': 'Raphaël',
  'R�mi': 'Rémi',
  'Salom�': 'Salomé',
  'S�bastien': 'Sébastien',
  'S�verin': 'Séverin',
  'Th�o': 'Théo',
  'Th�odore': 'Théodore',
  'Zo�': 'Zoé',
};

await ScriptRunner.execute(import.meta.url, CorrectCertificationCoursesFirstnamesBadEncoding);
