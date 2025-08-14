import { Module } from '../../domain/models/Module.js';

import * as injectedModulesApi from '../../../devcomp/application/api/modules-api.js';

export const getByUserIdAndModuleIds = async ({ userId, moduleIds, modulesApi = injectedModulesApi } = {}) => {
  const modules = await modulesApi.getUserModuleStatuses({ userId, moduleIds });

  return modules.map((module) => new Module(module));
};
