import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getService } from '../utils';
import type { Core } from '@strapi/strapi';

// plaiceholder v3 only accepts a Buffer: local files are read from the public dir,
// remote ones (S3 signed URL) are downloaded.
const loadImage = async (strapi: Core.Strapi, url: string): Promise<Buffer> => {
  if (/^https?:\/\//i.test(url)) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image "${url}": ${response.status} ${response.statusText}`);
    }
    return Buffer.from(await response.arrayBuffer());
  }

  const publicDir = path.resolve(strapi.dirs.static.public);
  const filePath = path.resolve(publicDir, `.${url.startsWith('/') ? url : `/${url}`}`);
  if (!filePath.startsWith(publicDir + path.sep)) {
    throw new Error(`Image path "${url}" is outside the public directory.`);
  }
  return readFile(filePath);
};

const placeholder = ({ strapi }: { strapi: Core.Strapi }) => {
  return {
    async generate({
      hash,
      ext,
      url,
      provider,
    }: {
      hash: string;
      ext: string;
      url: string;
      provider: string;
    }): Promise<string | null> {
      try {
        const settings = getService(strapi, 'settings').get();
        let imageUrl = url;

        if (provider === 'aws-s3') {
          const objectName = `${hash}${ext}`;
          imageUrl = await getService(strapi, 'bucket').get({ settings, objectName });
          if (!imageUrl) return null;
        } else if (provider !== 'local') {
          strapi.log.warn(`Provider "${provider}" is not supported by the placeholder service.`);
          return null;
        }

        // plaiceholder v3 is ESM-only: a dynamic import keeps it loadable from the CJS build.
        const { getPlaiceholder } = await import('plaiceholder');
        const image = await loadImage(strapi, imageUrl);
        // removeAlpha defaulted to true in plaiceholder v2, keep the same output.
        const { base64 } = await getPlaiceholder(image, { removeAlpha: true, ...settings });
        return base64;
      } catch (error) {
        strapi.log.error(error);
        return null;
      }
    },
  };
};

export default placeholder;
