import { EggPlugin } from 'egg';

const plugin: EggPlugin = {
  // static: true,
  // nunjucks: {
  //   enable: true,
  //   package: 'egg-view-nunjucks',
  // },
  multipart: {
    enable: true,
    package: 'egg-multipart',
  },
  cors: {
    enable: true,
    package: 'egg-cors',
  },
};

export default plugin;
