import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import Component from '@glimmer/component';

export default class Breadcrumb extends Component {
  @service intl;
  @service router;

  get breadcrumb() {
    const crumbs = this.router.currentRouteName.split('.');

    const { localName, parent } = this.router.currentRoute;
    const breadcrumbs = [];

    if (localName !== 'index') {
      const parentCrumbs = parent.name.split('.');
      // on enlève 'authenticated' pour aller chercher la traduction du parent
      parentCrumbs.shift();

      breadcrumbs.push({
        path: parent.name,
        label: this.intl.t(`components.${parentCrumbs.join('.')}.title`),
      });
    }

    // on enlève 'authenticated' et 'index' pour aller chercher la traduction du titre de la page courante
    crumbs.shift();
    if (localName === 'index') {
      crumbs.pop();
    }

    breadcrumbs.push({
      path: null,
      label: this.args.title ?? this.intl.t(`components.${crumbs.join('.')}.title`),
    });

    return breadcrumbs;
  }

  <template>
    <nav class="breadcrumb">
      <ol>
        {{#each this.breadcrumb as |crumb|}}
          {{#if crumb.path}}
            <li>
              <LinkTo @route={{crumb.path}}>{{crumb.label}}</LinkTo>
            </li>
            <FaIcon @icon="chevron-right" />
          {{else}}
            <li>
              <h1>{{crumb.label}}</h1>
            </li>
          {{/if}}
        {{/each}}
      </ol>
    </nav>
  </template>
}
