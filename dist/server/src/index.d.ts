declare const _default: {
    register: ({ strapi }: {
        strapi: import('@strapi/types/dist/core').Strapi;
    }) => import('winston').Logger;
    bootstrap: ({ strapi }: {
        strapi: import('@strapi/types/dist/core').Strapi;
    }) => void;
    config: {
        default: {};
        validator(): void;
    };
    services: {
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
};
export default _default;
