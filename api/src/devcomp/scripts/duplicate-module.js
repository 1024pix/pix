import fs from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import { duplicateModule } from '../domain/usecases/duplicate-module.js';

export class DuplicateModule extends Script {
  constructor() {
    super({
      description:
        'Duplique un module Modulix (fichier JSON du dossier learning-content/modules) en régénérant tous les identifiants UUID, le shortId, le slug et le titre.',
      permanent: true,
      options: {
        source: {
          type: 'string',
          describe: 'Le nom du fichier module source à dupliquer (ex: bac-a-sable.json)',
          demandOption: true,
        },
      },
    });
  }

  async handle({ options, logger }) {
    const { source } = options;

    const modulePath = fileURLToPath(import.meta.url);
    const __dirname = dirname(modulePath);
    const modulesDir = join(__dirname, '../infrastructure/datasources/learning-content/modules');
    const sourcePath = join(modulesDir, source);
    const fileNameWithoutExtension = basename(source, '.json');
    const targetPath = join(modulesDir, `${fileNameWithoutExtension}_copie.json`);

    _assertSourceFileExistsAndHasJSONExtension(sourcePath);
    _assertTargetFileDoesNotExist(targetPath);

    // eslint-disable-next-line n/no-sync
    const moduleData = JSON.parse(fs.readFileSync(sourcePath, 'utf-8'));
    const duplicatedModuleData = duplicateModule({ moduleData });

    const duplicatedModuleContent = JSON.stringify(duplicatedModuleData, null, 2);
    // eslint-disable-next-line n/no-sync
    fs.writeFileSync(targetPath, `${duplicatedModuleContent}\n`);

    logger.info(`Module dupliqué : ${targetPath}`);
    logger.info('Pensez à lancer "npm run modulix:test" pour valider le nouveau module.');
  }
}

function _assertSourceFileExistsAndHasJSONExtension(sourcePath) {
  if (!sourcePath.endsWith('.json')) {
    throw new Error(`Le fichier source doit avoir l'extension .json (reçu : "${sourcePath}")`);
  }

  // eslint-disable-next-line n/no-sync
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Le fichier source "${sourcePath}" n'existe pas.`);
  }
}

function _assertTargetFileDoesNotExist(targetPath) {
  // eslint-disable-next-line n/no-sync
  if (fs.existsSync(targetPath)) {
    throw new Error(`Le fichier cible "${targetPath}" existe déjà.`);
  }
}

await ScriptRunner.execute(import.meta.url, DuplicateModule);
