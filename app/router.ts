import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;

  router.get('/', controller.home.index);

  // upload
  router.post('/upload/', controller.upload.upload);
  router.post('/upload/:filename/:chunk_name/:start', controller.upload.upload);
  router.get('/merge/:filename', controller.upload.merge);
  router.get('/verify/:filename', controller.upload.verify);
 
};
