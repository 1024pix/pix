import { service } from '@ember/service';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import Card from 'pix-admin/components/card';

export default class CompetencesScoringForm extends Component {
  @service pixToast;
  @service intl;

  <template>
    <Card
      class="versions-competences-scoring"
      @title={{t "components.certification-frameworks.certification-framework.versions.scoring.competences.title"}}
    >
    </Card>
  </template>
}
