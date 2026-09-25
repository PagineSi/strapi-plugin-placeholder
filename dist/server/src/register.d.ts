import { Core } from '@strapi/strapi';
declare const register: ({ strapi }: {
    strapi: Core.Strapi;
}) => import('winston').Logger;
export default register;
