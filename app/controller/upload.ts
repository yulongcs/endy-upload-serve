import { Controller } from 'egg';
import * as path from 'path';
import * as fs from 'fs-extra';
// import {
//   extname,
//   resolve as pathResolve
// } from 'path';
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
    const filename = Date.now() + path.extname(stream.filename).toLocaleLowerCase();
    // 目标文件
    const target = path.resolve(PUBLIC_DIR, filename);
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
    const chunkPath = path.resolve(TEMP_DIR, filename);
    const target = path.resolve(chunkPath, chunk_name);
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
   * 切片上传
   */
  public async breakpointUpload() {
    const { ctx } = this;
    // 读取文件流
    const stream = await ctx.getFileStream();
    const { filename, chunk_name, start } = ctx.params;
    // 目标文件
    const chunkPath = path.resolve(TEMP_DIR, filename);
    const target = path.resolve(chunkPath, chunk_name);
    // 确保目录的存在。如果目录结构不存在,就创建一个。同步
    ensureDirSync(chunkPath);
    // 写入流
    const writeStream = createWriteStream(target, {
      start: isNaN(Number(start)) ? 0 : Number(start),
    });
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

  /**
   * 校验文件，实现秒传，断点续传
   */
  public async verify() {
    const { ctx } = this;
    const { filename } = ctx.params;
    const filePath = path.resolve(PUBLIC_DIR, filename);
    let existFile = await fs.pathExists(filePath);
    const { host } = ctx.header;
    if (existFile) {
      return ctx.body = {
        success: true,
        needUpload: false,
        url: `http://${host}/public/uploads/${filename}`,
      };
    }

    let tempFilePath = path.resolve(TEMP_DIR, filename);
    let uploadedList: any[] = [];
    let existTemporaryFile = await fs.pathExists(tempFilePath);
    if (existTemporaryFile) {
      uploadedList = await fs.readdir(tempFilePath);
      uploadedList = await Promise.all(
        uploadedList.map(async (filename: string) => {
          let stat = await fs.stat(path.resolve(tempFilePath, filename));
          return {
            filename,
            size: stat.size
          }
        }));
    }

    ctx.body = {
      success: true,
      needUpload: true,
      uploadedList,
    };
  }
}
