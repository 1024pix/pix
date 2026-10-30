import OrganizationPlacesInfo from './organization-places-info';
import SchoolSessionManagement from './school-session-management';
import UserLoggedMenu from './user-logged-menu';

<template>
  <div class="topbar">
    <OrganizationPlacesInfo @placesCount={{@placesCount}} />
    <SchoolSessionManagement />
    <UserLoggedMenu class="topbar__user-logged-menu" />
  </div>
</template>
