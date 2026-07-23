import { Module } from '../../../domain/models/combined-courses/value-objects/Module.js';

export const getByIds = async ({ moduleIds, modulesApi }) => {
  const modules = await modulesApi.getModulesByIds({ moduleIds });

  return modules.map((module) => new Module(module));
};
