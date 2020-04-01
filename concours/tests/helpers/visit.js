import { visit as emberVisit } from '@ember/test-helpers';

export default async function visit(url) {

  try {
    await emberVisit(url);
  } catch (error) {
    const { message } = error;
    if (message !== 'TransitionAborted') {
      throw error;
    }
  }
}
