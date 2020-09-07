import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';

export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>;

  // override config from framework / plugin
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1599219877215_8938';

  // add your egg config in here
  config.middleware = [];

  // add your special config in here
  const bizConfig = {
    sourceUrl: `https://github.com/eggjs/examples/tree/master/${appInfo.name}`,
  };

  config.security = {
    xframe: {
      enable: true,
    },
    csrf: {
      enable: false,
    },
    methodnoallow: {
      enable: true,
    },
  };

  config.cors = {
    origin:'*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH'
  };

  config.multipart = {
    fileSize: '10mb',
    mode: 'stream',
    fileExtensions: ['.raw', '.dmg', '.docx', '.pptx', '.txt']
    // whitelist: ['.png', '.mp4', '.raw', '.dmg'],
  };

  // the return config will combines to EggAppConfig
  return {
    ...config,
    ...bizConfig,
  };
};
