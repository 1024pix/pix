import { hbs } from 'ember-cli-htmlbars';

export default { title: 'Buttons' };

export const pixButtonPrimaryRounded = () => {
  return {
    template: hbs`<PixButtonPrimaryRounded>Click me</PixButtonPrimaryRounded>`,
  }
};
pixButtonPrimaryRounded.story = {
  name: 'pix-button-primary-rounded',
};

