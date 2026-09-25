import { Core } from '@strapi/strapi';
declare const settings: ({ strapi }: {
    strapi: Core.Strapi;
}) => {
    /**
     * Helper that returns the plugin settings.
     * @returns {Object} the settings of the plugin
     */
    get: () => object;
    /**
     * Helper that sets the plugin settings and returns them.
     * @param {Object} settings the desired settings for the plugin
     * @param {number} settings.size the desired size of the placeholder
     * @returns {Object} the new settings for the plugin
     */
    set: (settings: {
        size: number;
    }) => object;
};
export default settings;
