import { type Request, type ResponseObject, type ResponseToolkit, type ServerRoute } from '@hapi/hapi';


export class HealthcheckController {
  async handle(_request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    return h.response('ok').code(200);
  }

}

const healthcheckController=  new HealthcheckController();

export const HEALTHCHECK_ROUTE: ServerRoute = {
  method: 'GET',
  path: '/health',
  options: {
    handler: healthcheckController.handle.bind(healthcheckController),
    auth:false
  }
};
