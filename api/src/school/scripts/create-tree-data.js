import fs from 'node:fs';
import * as url from 'node:url';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { logger } from '../../shared/infrastructure/utils/logger.js';
import { NotFoundError } from '../../shared/domain/errors.js';

const { promises } = fs;

const { readFile, access } = promises;

function createRelationsFromPath(path) {
  logger.info(`Create relations from path: ${path}`);

  const nodeMatcher = new RegExp('(?<node1>.*)\\s\\>\\s(?<node2>.*)');
  let matched = nodeMatcher.exec(path);
  const relations = [];
  while (matched) {
    relations.push({ from: matched.groups.node1, to: `${matched.groups.node1} > ${matched.groups.node2}` });
    matched = nodeMatcher.exec(matched.groups.node1);
  }
  return relations;
}

function createTreeFromData(data) {
  const relations = data.flatMap((pathWithNumber) =>
    createRelationsFromPath(pathWithNumber.fullPath).map((path) => {
      return { ...path, number: pathWithNumber.number };
    }),
  );
  const uniqueRelations = [];

  relations.forEach((relation) => {
    const uniqueRelation = uniqueRelations.filter(
      (uniqueRelations) => relation.from === relation.from && uniqueRelations.to === relation.to,
    )?.[0];
    if (uniqueRelation) {
      uniqueRelation.number = uniqueRelation.number + relation.number;
    } else {
      uniqueRelations.push(relation);
    }
  });

  const nodes = [...new Set(uniqueRelations.flatMap((relation) => [relation.from, relation.to]))].map((nodeId) => {
    return { id: nodeId };
  });
  return { relations: uniqueRelations, nodes };
}

function _validateArgs({ jsonFile }) {
  if (!jsonFile) {
    throw new Error('Un fichier json est nécessaire pour construire l\'arbre.);
  }
  return { jsonFile };
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

async function main() {
  const commandLineArgs = yargs(hideBin(process.argv))
    .option('jsonFile', {
      description: 'Fichier contenant les chemins en format Json.',
    })
    .help().argv;
  const { jsonFile } = _validateArgs(commandLineArgs);
  try {
    await access(jsonFile, fs.constants.F_OK);
  } catch (err) {
    throw new NotFoundError(`File ${filePath} not found!`);
  }

  const rawData = await readFile(filePath, 'utf8');

  const data = JSON.parse(rawData);
  const tree = createTreeFromData(data);
  console.log({tree: JSON.stringify(tree)});
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      logger.error('\x1b[31mErreur : %s\x1b[0m', error.message);
      process.exitCode = 1;
    }
  }
})();

export { createRelationsFromPath, createTreeFromData };
