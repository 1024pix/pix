import { TrainingForAdmin } from '../../../../lib/domain/read-models/TrainingForAdmin.js';

const buildTrainingForAdmin = function ({
  id = 'training1',
  title = 'Training 1',
  link = 'https://example.net',
  type = 'webinar',
  duration = {
    hours: 5,
  },
  locale = 'fr-fr',
  targetProfileIds = [1],
  editorName = 'Ministère education nationale',
  editorLogoUrl = 'https://images.pix.fr/contenu-formatif/editeur/editor_logo_url.svg',
  trainingTriggers,
} = {}) {
  return new TrainingForAdmin({
    id,
    title,
    link,
    type,
    duration,
    locale,
    targetProfileIds,
    editorName,
    editorLogoUrl,
    trainingTriggers,
  });
};

export { buildTrainingForAdmin };
