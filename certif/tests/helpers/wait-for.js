import { getScreen } from '@1024pix/ember-testing-library';
import { waitUntil } from '@ember/test-helpers';

export async function waitForDialogClose() {
  const screen = await getScreen();

  await waitUntil(() => {
    try {
      screen.getByRole('dialog');
      return false;
    } catch {
      return true;
    }
  });
}

export async function waitForDialog() {
  const screen = await getScreen();

  await waitUntil(() => {
    try {
      screen.getByRole('dialog');
      return true;
    } catch {
      return false;
    }
  });
}
