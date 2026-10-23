// Local static mount reproduces GitHub Pages' repository subdirectory.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';

const root = resolve('dist');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
};
createServer(async (req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  if (!path.startsWith('/Afrika-2040/')) {
    res.writeHead(404).end();
    return;
  }
  const target = resolve(
    root,
    decodeURIComponent(path.slice('/Afrika-2040/'.length) || 'index.html'),
  );
  if (!target.startsWith(root + '/')) {
    res.writeHead(403).end();
    return;
  }
  try {
    const data = await readFile(target);
    res
      .writeHead(200, {
        'content-type': types[extname(target)] || 'application/octet-stream',
      })
      .end(data);
  } catch {
    res.writeHead(404).end();
  }
}).listen(4174, '0.0.0.0');
