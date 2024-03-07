import {
  AEFE_TAG,
  AGRICULTURE_TAG,
  CFA_TAG,
  COLLEGE_TAG,
  LYCEE_TAG,
  MEDNUM_TAG,
  POLE_EMPLOI_TAG,
  PRIVE_TAG,
  PUBLIC_TAG,
} from './constants.js';

const tagsBuilder = async function ({ databaseBuilder }) {
  databaseBuilder.factory.buildTag(AGRICULTURE_TAG);
  databaseBuilder.factory.buildTag(PUBLIC_TAG);
  databaseBuilder.factory.buildTag(PRIVE_TAG);
  databaseBuilder.factory.buildTag(POLE_EMPLOI_TAG);
  databaseBuilder.factory.buildTag(CFA_TAG);
  databaseBuilder.factory.buildTag(AEFE_TAG);
  databaseBuilder.factory.buildTag(MEDNUM_TAG);
  databaseBuilder.factory.buildTag(COLLEGE_TAG);
  databaseBuilder.factory.buildTag(LYCEE_TAG);
  await databaseBuilder.commit();
};

export { tagsBuilder };
