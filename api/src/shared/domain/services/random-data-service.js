/* eslint-disable import/no-unresolved */
import { Randomix } from '@1024pix/randomix';
import * as generators from '@1024pix/randomix/generators';
import * as data from '@1024pix/randomix/data';
/* eslint-enable import/no-unresolved */

const randomix = new Randomix({
  generators,
  data,
});

export function generateChallengeVariables({ challenge, assessmentId }, dependencies = { randomix }) {
  const randomDataGenerator = dependencies.randomix.getGenerator({ locale: challenge.locale, seed: assessmentId });

  challenge.instruction.generateVariables(randomDataGenerator);
}
