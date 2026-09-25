declare const services: {
    placeholder: ({ strapi }: {
        strapi: import('@strapi/types/dist/core').Strapi;
    }) => {
        generate({ hash, ext, url, provider, }: {
            hash: string;
            ext: string;
            url: string;
            provider: string;
        }): Promise<string | null>;
    };
    bucket: () => {
        get({ settings, objectName }: {
            settings: any;
            objectName: any;
        }): Promise<string>;
    };
    settings: ({ strapi }: {
        strapi: import('@strapi/types/dist/core').Strapi;
    }) => {
        get: () => object;
        set: (settings: {
            size: number;
        }) => object;
    };
};
export type PluginServices = {
    [key in keyof typeof services]: ReturnType<(typeof services)[key]>;
};
export default services;
