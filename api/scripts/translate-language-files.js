import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { Script } from '../src/shared/application/scripts/script.js';
import { ScriptRunner } from '../src/shared/application/scripts/script-runner.js';
import { config } from '../src/shared/config.js';

export class TranslateLanguageFiles extends Script {
  constructor() {
    super({
      description: 'This script is used to create/update translation files from a source translation file.',
      permanent: true,
      options: {
        dir: {
          type: 'string',
          describe:
            'Translations directory (source language file is required; target language file will be created if missing)',
          demandOption: true,
        },
        sourceLang: {
          type: 'string',
          describe: 'Source language : for example fr, en, it, es',
          default: 'fr',
        },
        targetLang: {
          type: 'string',
          describe: 'Target language : for example it, en, es',
          demandOption: true,
        },
        formality: {
          type: 'string',
          describe: 'DeepL formality: default|more|less',
          default: 'default',
        },
        batchSize: {
          type: 'number',
          describe: 'DeepL batch size',
          default: 500,
        },
        dryRun: {
          type: 'boolean',
          describe: 'If true: Write in files',
          default: false,
        },
      },
    });
  }

  async handle({ options, logger }) {
    const { dir, sourceLang, targetLang, formality, batchSize, dryRun } = options;

    const deeplKey = config.translations.deeplApiKey;
    if (!deeplKey) {
      throw new Error('DEEPL KEY NOT FOUND');
    }

    const sourcePath = path.join(dir, `${sourceLang}.json`);
    const targetPath = path.join(dir, `${targetLang}.json`);

    let tmpDir;
    let tmpI18nDir;
    let tmpSourcePath;
    let tmpTargetPath;

    try {
      tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'json-autotranslate-'));
      tmpI18nDir = path.join(tmpDir, 'i18n');

      await fs.promises.mkdir(tmpI18nDir, { recursive: true });
      logger.info(`Temp dir: ${tmpI18nDir}`);

      tmpSourcePath = path.join(tmpI18nDir, `${sourceLang}.json`);
      tmpTargetPath = path.join(tmpI18nDir, `${targetLang}.json`);

      logger.info(`Real source: ${sourcePath}`);
      logger.info(`Real target: ${targetPath}`);

      const args = [
        'json-autotranslate',
        '-s',
        'deepl-free',
        '-i',
        tmpI18nDir,
        '-l',
        sourceLang,
        '--directory-structure',
        'ngx-translate',
        '--matcher',
        'icu',
        '--type',
        'key-based',
        '--decode-escapes',
        '--config',
        `${deeplKey},${formality},${batchSize}`,
      ];

      if (dryRun) {
        logger.info('Dry run');
        logger.info('Translator: deepl-free');
        logger.info(`Languages: ${sourceLang} → ${targetLang}`);
        logger.info(`Formality: ${formality}, batchSize: ${batchSize}`);
        return;
      }

      await fs.promises.copyFile(sourcePath, tmpSourcePath);

      try {
        await fs.promises.copyFile(targetPath, tmpTargetPath);
      } catch (err) {
        if (err.code === 'ENOENT') {
          await fs.promises.writeFile(tmpTargetPath, '{}\n', 'utf-8');
        } else {
          throw err;
        }
      }

      const execute = 'npx';
      logger.info(`Running: npx json-autotranslate (deepl-free)`);
      await run(execute, args);

      let translatedContent;
      try {
        translatedContent = await fs.promises.readFile(tmpTargetPath, 'utf-8');
      } catch (err) {
        throw new Error(`Translation output not found at ${tmpTargetPath}.`, { cause: err });
      }
      await fs.promises.writeFile(targetPath, translatedContent, 'utf-8');
      logger.info(`Updated target: ${targetPath}`);
    } finally {
      if (tmpDir) {
        await fs.promises.rm(tmpDir, { recursive: true, force: true });
        logger.info(`Temp dir deleted: ${tmpDir}`);
      }
    }
  }
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit' });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited with code ${code}`));
    });
  });
}

await ScriptRunner.execute(import.meta.url, TranslateLanguageFiles);
