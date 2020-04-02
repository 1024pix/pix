import { hbs } from 'ember-cli-htmlbars';

export default { title: 'Tooltip' };

export const pixTooltip = () => {
  return {
    template: hbs`
      <br><br>
      <PixTooltip
        @text='In accumsan scelerisque sapien, et lacinia nisi efficitur a.'
        @position='right'>
        <button>Hover me!</button>
      </PixTooltip>
    `,
  }
};
