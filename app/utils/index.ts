import { resolve as pathResolve } from 'path';
import {
  mkdir,
  readFile,
  writeFile,
  readdir,
  rmdir,
  createWriteStream,
  WriteStream,
  createReadStream,
  unlink,
  ensureDirSync,
} from 'fs-extra';

// 文件分割默认大小： 1mb
const DEFAULT_SIZE = 1024 * 1024 * 1;

export const PUBLIC_DIR = pathResolve(__dirname, '../', 'public/uploads');

// 存放分割后的文件目录
export const TEMP_DIR = pathResolve(__dirname, '../', 'temp');

/**
 * 分割代码块，将文件按照size大小进行拆分
 * @param filename 文件路径
 * @param size 分片大小
 */
export const splitChunks = async (filename: string, size: number = DEFAULT_SIZE) => {
  //要分割的文件绝对路径
  let filePath = pathResolve(__dirname, '../', filename);
  //以文件名命名的临时目录，存放分割后的文件
  const chunksDir = pathResolve(TEMP_DIR, filename);
  //递归创建目录, 没有父目录会自动创建
  await mkdir(chunksDir);
  // 读取文件内容，二进制Buffer, 是一个字节数组 1个字节是8bit位
  let content = await readFile(filePath);

  let i = 0;
  let current = 0; // 当前的索引
  let length = content.length; // 文件大小

  // 循环切片
  while (current < length) {
    // 写文件
    await writeFile(
      pathResolve(chunksDir, filename + '-' + i), // 路径
      content.slice(current, current + size) // 内容
    )
    i++;
    current += size;
  }
}

/**
 * 1.读取temp目录下image.jpg目录里所有的文件,按尾部的索引号 
 * 2.把它们累加在一起，另外一旦加过了要把temp目录里的文件删除
 * 3.为了提高性能，尽量用流来实现，不要readFile writeFile
 */
export const mergeChunks = async (filename: string, size: number = DEFAULT_SIZE) => {
  // 合并文件目录
  const filePath = pathResolve(PUBLIC_DIR, filename);
  // 分片文件目录
  const chunksDir = pathResolve(TEMP_DIR, filename);
  // 读取分片文件集合
  const chunkFiles = await readdir(chunksDir);
  //按文件名后面切片数字升序排列
  chunkFiles.sort((a, b) => Number(a.split('-').slice(-1)) - Number(b.split('-').slice(-1)));

  // 确保目录的存在。如果目录结构不存在,就创建一个。同步
  ensureDirSync(PUBLIC_DIR);

  await Promise.all(
    chunkFiles.map((chunkFile: string, index: number) => {
      return pipeStream(
        pathResolve(chunksDir, chunkFile), // 分片的绝对路径
        createWriteStream(filePath, {
          start: index * size
        })
      );
    })
  );
  // 合并完成删除文件目录, 目录必须为空目录
  await rmdir(chunksDir);
}

/**
 * 使用可读流的方式写数据
 * @param filePath 
 * @param ws 
 */
export const pipeStream = (filePath: string, ws: WriteStream): Promise<undefined> => {
  return new Promise((resolve: Function) => {
    let rs = createReadStream(filePath); // image.png-0
    // 监听关闭事件，如果文件读取完毕，删除分片文件
    rs.on('end', async () => {
      await unlink(filePath); //删除分片文件
      resolve();
    });

    rs.pipe(ws);
  });
};
