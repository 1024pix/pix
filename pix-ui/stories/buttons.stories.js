import { hbs } from 'ember-cli-htmlbars';

export default { title: 'Bouttons' };

export const pixButtonPrimaryRounded = () => {
  return {
    template: hbs`<PixButtonPrimaryRounded>Click me</PixButtonPrimaryRounded>`,
  }
};
pixButtonPrimaryRounded.story = {
  name: 'pix-button-primary-rounded',
};

