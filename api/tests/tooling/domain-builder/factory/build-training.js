import { Training } from '../../../../src/devcomp/domain/models/Training.js';

const buildTraining = function ({
  id = 'training1',
  title = 'Training 1',
  internalTitle = 'Training 1 internal title',
  link = 'https://example.net',
  type = 'webinar',
  duration = {
    hours: 5,
  },
  locales = ['fr-fr'],
  targetProfileIds = [1],
  editorName = 'Ministère education nationale',
  editorLogoUrl = 'https://assets.pix.org/contenu-formatif/editeur/editor_logo_url.svg',
  trainingTriggers,
  deliveryMode = Training.modes.REMOTE,
  registrationRequired = false,
  program = 'training program',
  objectives = ['objective 1', 'objective 2'],
  description = "<p>Voici la description d'un contenu formatif</p>",
} = {}) {
  return new Training({
    id,
    title,
    internalTitle,
    link,
    type,
    duration,
    locales,
    targetProfileIds,
    editorName,
    editorLogoUrl,
    trainingTriggers,
    deliveryMode,
    registrationRequired,
    program,
    objectives,
    description,
  });
};

export { buildTraining };
