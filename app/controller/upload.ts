import { Controller } from 'egg';
import {
  extname,
  resolve as pathResolve
} from 'path';
import {
  PUBLIC_DIR,
  TEMP_DIR,
  mergeChunks,
} from '../utils';
import {
  createWriteStream,
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

  /**
   * 切片上传
   */
  public async chunkUpload() {
    const { ctx } = this;
    // 读取文件流
    const stream = await ctx.getFileStream();
    const { filename, chunk_name } = ctx.params;
    // 目标文件
    const chunkPath = pathResolve(TEMP_DIR, filename);
    const target = pathResolve(chunkPath, chunk_name);
    // 确保目录的存在。如果目录结构不存在,就创建一个。同步
    ensureDirSync(chunkPath);
    // 写入流
    const writeStream = createWriteStream(target);
    //异步把文件流 写入
    stream.pipe(writeStream);

    ctx.body = {
      success: true
    };
  }

  /**
   * 切片合并
   */
  public async merge() {
    const { ctx } = this;
    const { filename, size } = ctx.request.body;
    
    // 合并切片
    await mergeChunks(filename, size);

    const { host } = ctx.header;
    ctx.body = {
      success: true,
      url: `http://${host}/public/uploads/${filename}`,
    };
  }

  public async verify() {
    const { ctx } = this;
    ctx.body = await ctx.service.test.sayHi('egg');
  }
}
