/**
 * Instantané au format historique — une entrée par acquis, la plus récente par
 * couple (user, skill), hors remises à zéro.
 *
 * Les tests s'en servent pour éprouver la relecture des instantanés écrits du
 * temps des knowledge elements ; la désérialisation les replie en état.
 */
export const toLegacySnapshot = (knowledgeElements) => {
  const seen = new Set();
  const latestFirst = [...knowledgeElements].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const kept = latestFirst.filter((knowledgeElement) => {
    if (seen.has(knowledgeElement.skillId) || knowledgeElement.status === 'reset') return false;
    seen.add(knowledgeElement.skillId);
    return true;
  });

  return JSON.stringify(
    kept.map(({ createdAt, source, status, earnedPix, skillId, competenceId }) => ({
      createdAt,
      source,
      status,
      earnedPix,
      skillId,
      competenceId,
    })),
  );
};
