import { Controller } from 'egg';
// import { TEMP_DIR, mergeChunks, PUBLIC_DIR } from '../utils';
import {
  extname,
  resolve as pathResolve
} from 'path';
import {
  PUBLIC_DIR,
} from '../utils';
import {
  createWriteStream,
  // pathExistsSync,
  ensureDirSync,
} from 'fs-extra';


export default class UploadController extends Controller {

  /**
   * 基本上传文件，获取流文件，写入目标文件
   */
  public async upload() {
    const { ctx } = this;
    // 读取文件流
    const stream = await ctx.getFileStream();
    console.log('endy-stream', stream)
    // 定义文件名
    const filename = Date.now() + extname(stream.filename).toLocaleLowerCase();
    // 目标文件
    const target = pathResolve(PUBLIC_DIR, filename);
    // 确保目录的存在。如果目录结构不存在,就创建一个。同步
    ensureDirSync(PUBLIC_DIR);
    // 写入流
    const writeStream = createWriteStream(target);
    //异步把文件流 写入
    stream.pipe(writeStream);

    const { host } = ctx.header;

    ctx.body = {
      success: true,
      url: `http://${host}/public/uploads/${filename}`,
    };
  }

  public async merge() {
    const { ctx } = this;
    ctx.body = await ctx.service.test.sayHi('egg');
  }

  public async verify() {
    const { ctx } = this;
    ctx.body = await ctx.service.test.sayHi('egg');
  }
}
