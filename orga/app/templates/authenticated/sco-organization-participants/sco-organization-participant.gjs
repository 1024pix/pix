import t from 'ember-intl/helpers/t';
import Breadcrumb from 'pix-orga/components/ui/breadcrumb';
import LearnerHeaderInfo from 'pix-orga/components/ui/learner-header-info';
import PageTitle from 'pix-orga/components/ui/page-title';
<template>
  <article>
    <PageTitle>
      <:breadcrumb>
        <Breadcrumb @links={{@controller.breadcrumbLinks}} />
      </:breadcrumb>

      <:title>
        {{t
          "common.fullname"
          firstName=@model.organizationLearner.firstName
          lastName=@model.organizationLearner.lastName
        }}
      </:title>

      <:tools>
        <LearnerHeaderInfo
          @groupName={{t "components.group.SCO"}}
          @group={{@model.organizationLearner.division}}
          @authenticationMethods={{@model.organizationLearner.authenticationMethodsList}}
          @isCertifiable={{@model.organizationLearner.isCertifiable}}
          @certifiableAt={{@model.organizationLearner.certifiableAt}}
          @hideCertifiableAt={{@controller.hasComputeOrganizationLearnerCertificabilityEnabled}}
        />
      </:tools>
    </PageTitle>

    {{outlet}}
  </article>
</template>
