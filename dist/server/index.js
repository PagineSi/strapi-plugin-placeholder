"use strict";
const mimeTypes = require("mime-types");
const plaiceholder = require("plaiceholder");
const AWS = require("aws-sdk");
const _interopDefault = (e) => e && e.__esModule ? e : { default: e };
const mimeTypes__default = /* @__PURE__ */ _interopDefault(mimeTypes);
const AWS__default = /* @__PURE__ */ _interopDefault(AWS);
const PLUGIN_ID = "strapi-plugin-placeholder";
const canGeneratePlaceholder = (file) => {
  if (!file.mime) {
    const lookedUpMime = mimeTypes__default.default.lookup(file.name);
    if (lookedUpMime) {
      file.mime = lookedUpMime;
    }
  }
  return file.mime?.startsWith("image/") && file.url;
};
const getService = (strapi, serviceName) => {
  const plugin = strapi.plugin(PLUGIN_ID);
  if (!plugin) {
    throw new Error(`Plugin "${PLUGIN_ID}" not found`);
  }
  return plugin.service(serviceName);
};
const bootstrap = ({ strapi }) => {
  const generatePlaceholder = async (event) => {
    const { data, where } = event.params;
    if (!data.url || !data.mime || !data.hash || !data.ext) {
      const file = await strapi.documents("plugin::upload.file").findFirst({ filters: { id: where.id } });
      data.url = data.url ?? file.url;
      data.mime = data.mime ?? file.mime;
      data.hash = data.hash ?? file.hash;
      data.ext = data.ext ?? file.ext;
    }
    if (!canGeneratePlaceholder(data))
      return;
    data.placeholder = await getService(strapi, "placeholder").generate({
      hash: data.hash,
      ext: data.ext,
      url: data.url,
      provider: data.provider
    });
    console.log("data", data);
  };
  strapi.db.lifecycles.subscribe({
    models: ["plugin::upload.file"],
    beforeCreate: generatePlaceholder,
    beforeUpdate: generatePlaceholder
  });
};
const register = ({ strapi }) => {
  if (!strapi.plugin("upload"))
    return strapi.log.warn("Upload plugin is not installed, Plaiceholder won't be started.");
  strapi.plugin("upload").contentTypes.file.attributes.placeholder = {
    type: "text"
  };
};
const config = {
  default: {},
  validator() {
  }
};
const placeholder = ({ strapi }) => {
  return {
    async generate({
      hash,
      ext,
      url,
      provider
    }) {
      try {
        const settings2 = getService(strapi, "settings").get();
        let imageUrl = url;
        if (provider === "aws-s3") {
          const objectName = `${hash}${ext}`;
          imageUrl = await getService(strapi, "minio").get({ settings: settings2, objectName });
          if (!imageUrl)
            return null;
        } else if (provider !== "local") {
          strapi.log.warn(`Provider "${provider}" is not supported by the placeholder service.`);
          return null;
        }
        const { base64 } = await plaiceholder.getPlaiceholder(imageUrl, settings2);
        return base64;
      } catch (error) {
        strapi.log.error(error);
        return null;
      }
    }
  };
};
const minio = () => ({
  async get({ settings: settings2, objectName }) {
    const s3 = new AWS__default.default.S3({
      endpoint: settings2.endpoint,
      credentials: {
        accessKeyId: settings2.accessKey,
        secretAccessKey: settings2.secretKey
      },
      s3ForcePathStyle: true
    });
    return s3.getSignedUrl("getObject", {
      Bucket: settings2.bucket,
      Key: objectName,
      Expires: 15 * 60
    });
  }
});
const settings = ({ strapi }) => ({
  /**
   * Helper that returns the plugin settings.
   * @returns {Object} the settings of the plugin
   */
  get: () => strapi.config.get(`plugin::${PLUGIN_ID}`),
  /**
   * Helper that sets the plugin settings and returns them.
   * @param {Object} settings the desired settings for the plugin
   * @param {number} settings.size the desired size of the placeholder
   * @returns {Object} the new settings for the plugin
   */
  set: (settings2) => strapi.config.set(`plugin::${PLUGIN_ID}`, settings2)
});
const services = {
  placeholder,
  minio,
  settings
};
const index = {
  register,
  bootstrap,
  config,
  services
};
module.exports = index;
//# sourceMappingURL=index.js.map
