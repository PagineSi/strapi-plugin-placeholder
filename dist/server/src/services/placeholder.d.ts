import { Core } from '@strapi/strapi';
declare const placeholder: ({ strapi }: {
    strapi: Core.Strapi;
}) => {
    generate({ hash, ext, url, provider, }: {
        hash: string;
        ext: string;
        url: string;
        provider: string;
    }): Promise<string | null>;
};
export default placeholder;
