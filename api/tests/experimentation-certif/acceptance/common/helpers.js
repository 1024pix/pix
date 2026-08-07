import { data } from './learning-content.fixture.js';

export function makeCertifiable({ databaseBuilder, userId }) {
  const assessmentId = databaseBuilder.factory.buildAssessment({ userId }).id;
  for (const skill of data.learningContent.skills) {
    databaseBuilder.factory.buildKnowledgeElement({
      userId,
      assessmentId,
      earnedPix: skill.pixValue,
      competenceId: skill.competenceId,
      skillId: skill.id,
      createdAt: new Date('2025-12-25'),
      source: 'direct',
      status: 'validated',
    });
  }
}
