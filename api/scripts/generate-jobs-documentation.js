/**
 * Generates `JOBS.md`, the list of the pg-boss jobs of the API, from the job controllers
 * declared in `jobs.js`, one section per bounded context and one sub-section per job. The code is the only
 * source of truth: the file is not versioned, it is regenerated and published whenever the jobs change.
 *
 * Usage: `npm run doc:jobs`
 *
 * Only settings that do not depend on the environment are rendered: cron expressions and
 * feature toggles come from the configuration, so the file would differ between machines.
 */
import * as url from 'node:url';

import { jobControllersByContext } from '../jobs.js';
import { JobController } from '../src/shared/application/jobs/job-controller.js';

const Trigger = {
  CRON: 'Planifié',
  EVENT: 'Événement',
  ON_DEMAND: 'À la demande',
};

const describeTrigger = (job) => {
  // JobScheduleController always sets jobCron, possibly to an empty value
  if ('jobCron' in job) return Trigger.CRON;
  if (job.eventName) return `${Trigger.EVENT} \`${job.eventName}\``;

  return Trigger.ON_DEMAND;
};

// True when the controller, or a class it extends, redefines the `isJobEnabled` getter of JobController.
// The getter is not called: its value depends on the environment, only its existence is a fact about the job.
const isToggledByConfiguration = (ControllerClass) => {
  let Class = ControllerClass;
  while (Class !== JobController) {
    if (Object.hasOwn(Class.prototype, 'isJobEnabled')) return true;
    Class = Object.getPrototypeOf(Class);
  }

  return false;
};

const describeSettings = (job, ControllerClass) => {
  const settings = [`équipe \`${job.team}\``, describeTrigger(job), `groupe \`${job.jobGroup}\``];
  if (isToggledByConfiguration(ControllerClass)) settings.push('activable par configuration');
  if (job.isDeadLetterQueueEnabled) settings.push('dead letter queue');
  settings.push(`expiration ${job.expireIn / 3600} h`);

  return settings.join(' · ');
};

const renderJob = (ControllerClass) => {
  const job = new ControllerClass();

  return [`### ${job.jobName}`, '', job.description, '', describeSettings(job, ControllerClass)].join('\n');
};

const renderContext = (context, controllerClasses) =>
  [`## ${context}`, ...controllerClasses.map(renderJob)].join('\n\n');

export function renderJobsDocumentation(jobControllersByContext) {
  const header = [
    '# Jobs de l’API',
    '',
    'Ce fichier est généré à partir du code par `npm run doc:jobs`. Il n’est pas versionné : il est régénéré, puis publié, à chaque changement de job.',
    '',
    'Déclenchement :',
    '',
    `- **${Trigger.CRON}** : lancé par un cron, dont l’expression est configurée par environnement.`,
    `- **${Trigger.EVENT}** : abonné à un événement publié par l’API ; chaque abonné reçoit sa propre copie de l’événement.`,
    `- **${Trigger.ON_DEMAND}** : déposé dans sa file par un use case de l’API.`,
    '',
    'Sous la description de chaque job, une ligne rappelle son équipe, son déclenchement et ses réglages :',
    '',
    '- **Équipe** : équipe responsable du job.',
    '- **Groupe** : groupe de jobs dont le worker exécute la file (`default` pour le worker de l’API, `maddo` pour celui de Maddo).',
    '- **Activable par configuration** : le job peut être désactivé sur un environnement par sa configuration.',
    '- **Dead letter queue** : un job qui échoue définitivement est conservé dans une file spéciale.',
    '- **Expiration** : durée au-delà de laquelle une exécution en cours est considérée comme expirée par pg-boss.',
  ].join('\n');

  const contexts = Object.entries(jobControllersByContext).map(([context, controllerClasses]) =>
    renderContext(context, controllerClasses),
  );

  return [header, ...contexts].join('\n\n') + '\n';
}

const isLaunchedFromCommandLine = process.argv[1] === url.fileURLToPath(import.meta.url);

if (isLaunchedFromCommandLine) {
  process.stdout.write(renderJobsDocumentation(jobControllersByContext));
}
