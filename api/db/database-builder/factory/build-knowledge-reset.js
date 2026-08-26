import { forgetCompetence } from './knowledge-state-writer.js';

/**
 * Remise à zéro d'une compétence.
 *
 * Il n'en reste aucune trace : l'état de ses tubes est simplement effacé. Les
 * réponses ne sont plus relues, rien ne peut donc le reconstituer.
 *
 * L'ordre compte : ce qui a été appris avant est oublié, ce qui vient après
 * compte à nouveau.
 */
const buildKnowledgeReset = function ({ userId, competenceId } = {}) {
  forgetCompetence({ userId, competenceId });
};

export { buildKnowledgeReset };
