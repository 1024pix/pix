import url from 'url';
import { logger } from '../lib/infrastructure/logger.js';
import { parseCsvWithHeader } from '../lib/infrastructure/helpers/csv.js';
const swaggerUrl = `https://app.pix.fr/api/swagger.json`;

/**
 * Helpers Functions
 */
const replaceId = (url) => url.replace(/\{\w+\}/g, '{id}');

const toCsv = (data) => {
  const headers = Object.keys(data[0]);
  return [headers.join(','), ...data.map((line) => Object.values(line).join(','))].join('\n');
};

const extractRoutes = (routes) =>
  Object.entries(routes.paths).flatMap(([route, routeDef]) => {
    return Object.keys(routeDef).map((verb) => ({ verb: verb.toLocaleUpperCase(), route: `/api${route}` }));
  });

const getCsvHeaders = (data) => Object.keys(data[0]);

function updateAuditCsvFromSwaggerJson(csvData, currentPixRoutes) {
  const csvRoutes = csvData.filter(({ Method }) => ['PUT', 'POST', 'DELETE', 'GET'].includes(Method));

  // compare keys
  const existingRoutesKey = currentPixRoutes.map(({ verb, route }) => `${verb} ${replaceId(route)}`);
  const oldRouteKeys = csvRoutes.map(({ Method, URI }) => `${Method} ${replaceId(URI)}`);

  // diff
  const newRoutes = existingRoutesKey.filter((route) => !oldRouteKeys.includes(route));
  const deletedRoutes = oldRouteKeys.filter((route) => !existingRoutesKey.includes(route));

  const newRouteOnly = currentPixRoutes.filter(({ verb, route }) => newRoutes.includes(`${verb} ${replaceId(route)}`));
  const routesWithoutDeletedRoutes = csvRoutes.filter(({ Method, URI }) => {
    return !deletedRoutes.includes(`${Method} ${replaceId(URI)}`);
  });

  // generate new csv file
  const routes = routesWithoutDeletedRoutes.concat(
    newRouteOnly.map(({ verb, route }) => {
      const headers = getCsvHeaders(csvRoutes);
      const line = {};
      for (const header of headers) {
        line[header] = '';
      }
      line.Method = verb;
      line.URI = route;
      return line;
    }),
  );
  return toCsv(routes);
}

async function main() {
  if (process.argv.length < 3) {
    help();
    return;
  }

  // fetch current route from prod
  // eslint-disable-next-line no-restricted-globals
  const response = await fetch(swaggerUrl);
  const swaggerJson = await response.json();
  const currentPixRoutes = extractRoutes(swaggerJson);

  // load previous csv route export from https://docs.google.com/spreadsheets/d/1EH-iyEAvXjVE80vQvVpJSQdamd0_aEJws4RqgcFGLqk/edit#gid=580012004&fvid=1350901934

  const csvfilePath = process.argv[2];
  const csvRoutesRaw = await parseCsvWithHeader(csvfilePath);
  updateAuditCsvFromSwaggerJson(csvRoutesRaw, currentPixRoutes);
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

if (isLaunchedFromCommandLine) {
  try {
    await main();
  } catch (error) {
    logger.error(error);
    throw error;
  }
}
function help() {
  console.info(`
  Utilisation : node scripts/update-audit-api-csv-file.js FILE.csv > updated.csv
  Afficher la liste des routes actualisées au format CSV pour
  mettre à jour le document d'audit

  Le fichier FILE.csv est un export csv à générer depuis le googlesheet
  https://docs.google.com/spreadsheets/d/1EH-iyEAvXjVE80vQvVpJSQdamd0_aEJws4RqgcFGLqk/edit#gid=580012004&fvid=1350901934

  La liste des routes est récupérée depuis le fichier swagger de l'api
  (https://app.pix.fr/api/swagger.json)

  # HOWTO
  Avant de lancer le script, il faut récupérer un export csv du précédent
  audit des routes de l'api Pix.
  Pour cela, ouvrir le dernier onglet et faire un export csv.

  Lancer le script
  node scripts/update-audit-api-csv-file.js FILE.csv > updated.csv
  Le fichier updated.csv contient la liste des routes du précédent audit
  actualisée avec les nouvelles routes et sans les routes qui n'existent plus.

  Créer un nouvel onglet dans le googlesheet et importer le fichier updated.csv
  dans l'onglet actif.

  >  Pinger les équipes sur slack afin de s'affecter les nouvelles routes et faire les vérifications adéquats
  `);
}
export { updateAuditCsvFromSwaggerJson };
