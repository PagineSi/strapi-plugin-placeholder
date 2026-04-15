import type { Core } from '@strapi/strapi';

const register = ({ strapi }: { strapi: Core.Strapi }) => {
  if (!strapi.plugin('upload')) {
    return strapi.log.warn("Upload plugin is not installed, Placeholder won't be started.");
  }

  /* Update the Media Library File content type, adding the placeholder field */
  const uploadPlugin = strapi.plugin('upload');
  if (uploadPlugin.contentTypes?.file?.attributes) {
    uploadPlugin.contentTypes.file.attributes.placeholder = {
      type: 'text',
    };
  }
};

export default register;
