import { randomUUID } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { promisify } from 'node:util';
import { gunzip } from 'node:zlib';

import ms from 'ms';

import { Script } from '../src/shared/application/scripts/script.js';
import { ScriptRunner } from '../src/shared/application/scripts/script-runner.js';
import {
  HEAP_PROFILE_REQUEST_TOPIC,
  HEAP_PROFILE_RESULT_TOPIC,
} from '../src/shared/infrastructure/heap-profile/heap-profile-listener.js';
import { PROFILE_STATUS } from '../src/shared/infrastructure/heap-profile/heap-profile-recorder.js';
import { summarizeAllocationSites } from '../src/shared/infrastructure/heap-profile/heap-profile-summary.js';
import { getTopic } from '../src/shared/infrastructure/pubsub.js';

const gunzipAsync = promisify(gunzip);

// l'abonnement Redis n'est pas effectif dès le retour de `subscribe` ; publier
// dans la foulée exposerait à rater les réponses, que pub/sub ne rejoue pas
const SUBSCRIPTION_SETTLING_DELAY_MS = 1000;

// marge laissée aux conteneurs après la fermeture de leur fenêtre, pour arrêter
// le profileur, compresser et publier
const RESULT_GRACE_PERIOD_MS = 30_000;

function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
  return `${Math.round(bytes / 1024)} Ko`;
}

export class TakeHeapProfile extends Script {
  constructor() {
    super({
      description:
        'Profile les allocations des conteneurs visés pendant une fenêtre, et récupère le profil. À lancer depuis un conteneur one-off : scalingo -a pix-api run node scripts/take-heap-profile.js --containers web-2 --duration 5m',
      permanent: true,
      options: {
        containers: {
          type: 'string',
          describe: 'Conteneurs visés : web-2, "web-2,worker-1", web-%3, web, all',
          demandOption: true,
          requiresArg: true,
        },
        duration: {
          type: 'string',
          describe: 'Durée de la fenêtre de profilage (format ms : 30s, 5m, 1h)',
          default: '5m',
          requiresArg: true,
        },
        samplingInterval: {
          type: 'number',
          describe: "Intervalle d'échantillonnage en octets ; par défaut celui du conteneur",
          requiresArg: true,
        },
        includeCollected: {
          type: 'boolean',
          describe: 'Inclure les objets déjà collectés : montre la pression GC plutôt que ce qui survit',
          default: false,
        },
        reason: {
          type: 'string',
          describe: 'Motif, reporté dans les logs des conteneurs visés',
          requiresArg: true,
        },
        outputDir: {
          type: 'string',
          describe: 'Répertoire où écrire les profils reçus',
          default: tmpdir(),
          requiresArg: true,
        },
      },
    });
  }

  async handle({ options, logger }) {
    const { containers, duration, samplingInterval, includeCollected, reason, outputDir } = options;
    const durationMs = ms(duration);
    if (!durationMs) throw new Error(`Durée illisible : "${duration}" (attendu : 30s, 5m, 1h…)`);

    const requestId = randomUUID();
    const profilesReceived = [];

    getTopic(HEAP_PROFILE_RESULT_TOPIC).subscribe(async (result) => {
      if (result?.requestId !== requestId) return;

      if (result.status === PROFILE_STATUS.STARTED) {
        logger.info(
          {
            durationMs: result.durationMs,
            samplingInterval: result.samplingInterval,
          },
          `${result.container} : profilage démarré`,
        );
        return;
      }

      if (result.status !== PROFILE_STATUS.DONE) {
        logger.warn(result, `${result.container} : ${result.status}`);
        return;
      }

      const { profile: encodedProfile, ...summary } = result;
      const profile = JSON.parse(await gunzipAsync(Buffer.from(encodedProfile, 'base64')));
      const path = join(outputDir, `${result.container}-${new Date().toISOString().replaceAll(':', '-')}.heapprofile`);
      await writeFile(path, JSON.stringify(profile));
      profilesReceived.push({
        container: result.container,
        path,
        profile,
        summary,
      });

      logger.info(
        summary,
        `${result.container} : profil reçu (${summary.samples} échantillons, ` +
          `tas ${formatBytes(summary.heapUsedBefore)} → ${formatBytes(summary.heapUsedAfter)}), écrit dans ${path}`,
      );
      this.#printAllocationSites({ profile, logger });
      this.#printEncodedProfile({
        container: result.container,
        encodedProfile,
      });
    });

    await delay(SUBSCRIPTION_SETTLING_DELAY_MS);

    logger.info({ requestId, containers, durationMs }, 'demande de profilage publiée');
    getTopic(HEAP_PROFILE_REQUEST_TOPIC).publish({
      requestId,
      containers,
      durationMs,
      samplingInterval,
      includeCollected,
      reason,
      requestedAt: Date.now(),
    });

    // on ignore combien de conteneurs vont répondre : on attend la fenêtre plus
    // de quoi laisser les profils arriver, les réponses étant affichées au fil de l'eau
    await delay(durationMs + RESULT_GRACE_PERIOD_MS);

    if (profilesReceived.length === 0) {
      logger.warn(
        { requestId, containers },
        "aucun profil reçu : vérifier HEAP_PROFILE_ENABLED, le sélecteur, et que les conteneurs visés tournent bien avec cette version de l'API",
      );
    }
  }

  /** Les gros sites d'allocation, pour avoir la réponse sans quitter le terminal. */
  #printAllocationSites({ profile, logger }) {
    const sites = summarizeAllocationSites(profile, { limit: 10 });
    for (const [rank, { site, bytes }] of sites.entries()) {
      logger.info(`  ${String(rank + 1).padStart(2)}. ${formatBytes(bytes).padStart(8)}  ${site}`);
    }
  }

  /**
   * Le profil est aussi recraché en base64 sur la sortie standard : un conteneur
   * one-off disparaît avec son système de fichiers, et c'est la seule façon d'en
   * sortir le fichier sans bucket ni accès shell (cf. docs/fr/profiling-memoire-node.md).
   */
  #printEncodedProfile({ container, encodedProfile }) {
    process.stdout.write(`\n----- DÉBUT PROFIL ${container} (gzip+base64) -----\n`);
    process.stdout.write(`${encodedProfile}\n`);
    process.stdout.write(`----- FIN PROFIL ${container} -----\n\n`);
  }
}

await ScriptRunner.execute(import.meta.url, TakeHeapProfile);
