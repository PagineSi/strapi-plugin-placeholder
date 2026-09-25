declare const bucket: () => {
    get({ settings, objectName }: {
        settings: any;
        objectName: any;
    }): Promise<string>;
};
export default bucket;
