"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
const mimeTypes = require("mime-types");
const promises = require("node:fs/promises");
const path = require("node:path");
const clientS3 = require("@aws-sdk/client-s3");
const s3RequestPresigner = require("@aws-sdk/s3-request-presigner");
const _interopDefault = (e) => e && e.__esModule ? e : { default: e };
const mimeTypes__default = /* @__PURE__ */ _interopDefault(mimeTypes);
const path__default = /* @__PURE__ */ _interopDefault(path);
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
  return strapi.plugin(PLUGIN_ID).service(serviceName);
};
const bootstrap = ({ strapi }) => {
  const generatePlaceholder = async (event) => {
    const { data, where } = event.params;
    if (!data.url || !data.mime || !data.hash || !data.ext) {
      const file = await strapi.documents("plugin::upload.file").findFirst({
        filters: { id: where.id }
      });
      if (file) {
        data.url = data.url ?? file.url;
        data.mime = data.mime ?? file.mime;
        data.hash = data.hash ?? file.hash;
        data.ext = data.ext ?? file.ext;
      }
    }
    if (!canGeneratePlaceholder(data)) return;
    data.placeholder = await getService(strapi, "placeholder").generate({
      hash: data.hash,
      ext: data.ext,
      url: data.url,
      provider: data.provider
    });
  };
  strapi.db.lifecycles.subscribe({
    models: ["plugin::upload.file"],
    beforeCreate: generatePlaceholder,
    beforeUpdate: generatePlaceholder
  });
};
const register = ({ strapi }) => {
  if (!strapi.plugin("upload")) {
    return strapi.log.warn("Upload plugin is not installed, Placeholder won't be started.");
  }
  const uploadPlugin = strapi.plugin("upload");
  if (uploadPlugin.contentTypes?.file?.attributes) {
    uploadPlugin.contentTypes.file.attributes.placeholder = {
      type: "text"
    };
  }
};
const config = {
  default: {},
  validator() {
  }
};
const loadImage = async (strapi, url) => {
  if (/^https?:\/\//i.test(url)) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image "${url}": ${response.status} ${response.statusText}`);
    }
    return Buffer.from(await response.arrayBuffer());
  }
  const publicDir = path__default.default.resolve(strapi.dirs.static.public);
  const filePath = path__default.default.resolve(publicDir, `.${url.startsWith("/") ? url : `/${url}`}`);
  if (!filePath.startsWith(publicDir + path__default.default.sep)) {
    throw new Error(`Image path "${url}" is outside the public directory.`);
  }
  return promises.readFile(filePath);
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
          imageUrl = await getService(strapi, "bucket").get({ settings: settings2, objectName });
          if (!imageUrl) return null;
        } else if (provider !== "local") {
          strapi.log.warn(`Provider "${provider}" is not supported by the placeholder service.`);
          return null;
        }
        const { getPlaiceholder } = await import("plaiceholder");
        const image = await loadImage(strapi, imageUrl);
        const { base64 } = await getPlaiceholder(image, { removeAlpha: true, ...settings2 });
        return base64;
      } catch (error) {
        strapi.log.error(error);
        return null;
      }
    }
  };
};
const bucket = () => ({
  async get({ settings: settings2, objectName }) {
    const s3 = new clientS3.S3Client({
      endpoint: settings2.endpoint,
      credentials: {
        accessKeyId: settings2.accessKey,
        secretAccessKey: settings2.secretKey
      },
      forcePathStyle: settings2.forcePathStyle
    });
    const command = new clientS3.GetObjectCommand({
      Bucket: settings2.bucket,
      Key: objectName
    });
    return s3RequestPresigner.getSignedUrl(s3, command, { expiresIn: 15 * 60 });
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
  bucket,
  settings
};
const index = {
  register,
  bootstrap,
  config,
  services
};
exports.default = index;
