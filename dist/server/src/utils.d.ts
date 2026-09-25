import { PluginServices } from './services';
import { Core } from '@strapi/strapi';
declare const canGeneratePlaceholder: (file: any) => any;
declare const getService: <ServiceName extends keyof PluginServices>(strapi: Core.Strapi, serviceName: ServiceName) => PluginServices[ServiceName];
export { canGeneratePlaceholder, getService };
