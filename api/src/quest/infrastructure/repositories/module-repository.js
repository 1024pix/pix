import * as modulesApi from '../../../devcomp/application/api/modules-api.js';
import { Module } from '../../domain/models/Module.js';

export const getByIds = async ({ moduleIds, dependencies = { modulesApi } }) => {
  const modules = await dependencies.modulesApi.getModulesByIds({ moduleIds });

  return modules.map((module) => new Module(module));
};

export const getByShortIds = async ({ moduleShortIds, dependencies = { modulesApi } }) => {
  const modules = await dependencies.modulesApi.getModulesByShortIds({ moduleShortIds });

  return modules.map((module) => new Module(module));
};
