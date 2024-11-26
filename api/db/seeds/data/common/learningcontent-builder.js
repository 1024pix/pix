import { lcmsClient } from '../../../../src/shared/infrastructure/lcms-client.js';

export async function learningContentBuilder({ databaseBuilder }) {
  const learningContent = await lcmsClient.getLatestRelease();
  databaseBuilder.factory.learningContent.build(learningContent);
  await databaseBuilder.commit();
}
