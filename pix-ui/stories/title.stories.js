import { hbs } from 'ember-cli-htmlbars';

export default { title: 'Titres' };

export const pixH1 = () => {
  return {
    template: hbs`<PixH1>Quick fox jumps nightly above wizard</PixH1>`,
  }
};
pixH1.story = {
  name: 'pix-h1',
};
