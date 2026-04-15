import type { Core } from '@strapi/strapi';
import { canGeneratePlaceholder, getService } from './utils';

const bootstrap = ({ strapi }: { strapi: Core.Strapi }) => {
  const generatePlaceholder = async (event) => {
    const { data, where } = event.params;

    if (!data.url || !data.mime || !data.hash || !data.ext) {
      // If the returned data is missing a url or mime property (probably because we're doing an update)
      // then we'll need to pull these values from the upload.file plugin and merge them in.
      const file = await strapi.documents('plugin::upload.file').findFirst({
        filters: { id: where.id },
      });
      if (file) {
        data.url = data.url ?? file.url;
        data.mime = data.mime ?? file.mime;
        data.hash = data.hash ?? file.hash;
        data.ext = data.ext ?? file.ext;
      }
    }

    if (!canGeneratePlaceholder(data)) return;
    data.placeholder = await getService(strapi, 'placeholder').generate({
      hash: data.hash,
      ext: data.ext,
      url: data.url,
      provider: data.provider,
    });
  };

  strapi.db.lifecycles.subscribe({
    models: ['plugin::upload.file'],
    beforeCreate: generatePlaceholder,
    beforeUpdate: generatePlaceholder,
  });
};

export default bootstrap;
