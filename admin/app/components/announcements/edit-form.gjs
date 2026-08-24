import { PixBannerAlert, PixButton, PixTextarea } from '@1024pix/nebulix-ember';
import { fn, get } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class AnnouncementsEditForm extends Component {
  @service pixToast;
  @service locale;

  @tracked content = { ...this.args.announcement?.content };
  @tracked isSaving = false;

  locales = this.locale.pixLocales;

  @action
  updateContent(locale, event) {
    this.content = { ...this.content, [locale]: event.target.value };
  }

  @action
  async save() {
    this.isSaving = true;
    try {
      const announcement = this.args.announcement;
      announcement.content = this.content;
      await announcement.save();
      this.pixToast.sendSuccessNotification({
        message: 'Annonce mise à jour avec succès.',
      });
    } catch {
      this.pixToast.sendErrorNotification({
        message: "Une erreur est survenue lors de la mise à jour de l'annonce.",
      });
    } finally {
      this.isSaving = false;
    }
  }

  <template>
    <PixBannerAlert class="announcements-instructions" @type="information">
      Le contenu est rendu en Markdown. Syntaxe disponible :
      <ul>
        <li><code>**texte**</code> → gras</li>
        <li><code>*texte*</code> → italique</li>
        <li><code>~~texte~~</code> → barré</li>
        <li><code>[libellé](url)</code> → lien (s'ouvre dans un nouvel onglet)</li>
        <li><code>- item</code> → liste à puces</li>
      </ul>
    </PixBannerAlert>
    {{#each this.locales as |locale|}}
      <div class="announcements-edit-form">
        <PixTextarea
          @id="announcement-content-{{locale}}"
          rows="6"
          value={{get this.content locale}}
          {{on "input" (fn this.updateContent locale)}}
        >
          <:label>{{locale}}</:label>
        </PixTextarea>
      </div>
    {{/each}}
    <PixButton @triggerAction={{this.save}} @isLoading={{this.isSaving}}>
      Enregistrer
    </PixButton>
  </template>
}
