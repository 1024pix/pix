import { within } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';

export default async function selectOption(screen, buttonLabel, optionLabel) {
  const button = screen.getByRole('button', {
    name: buttonLabel,
  });

  const list = within(button.closest('div')).getByRole('listbox', { hidden: true });

  const option = within(list).getByText(optionLabel);

  await click(option);
}
