// Lecture de l'état de connaissance simulé, aux mêmes règles que le modèle
// KnowledgeState de l'API : un acquis est validé sous le plancher de son tube,
// invalidé au-dessus du plafond, incertain entre les deux.

// Même convention que l'API : un acquis sans tube est seul dans le sien
export const tubeIdOfSkill = (skill) => skill.tubeId ?? skill.id;

export const skillStatusInKnowledgeState = (knowledgeState, skill) => {
  const bounds = knowledgeState.find(({ tubeId }) => tubeId === tubeIdOfSkill(skill));
  if (!bounds) return null;
  if (skill.difficulty <= bounds.floor) return 'validated';
  if (bounds.ceiling !== null && skill.difficulty >= bounds.ceiling) return 'invalidated';
  return null;
};
