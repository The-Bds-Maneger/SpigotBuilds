import { tmpdir } from "node:os";
import fs from "node:fs";
import path from "node:path";
import got from "got";

export async function saveFile(url, options) {
  let fileSave = path.join(tmpdir(), "bdscore_"+(Math.random()*155515151).toFixed()+"_raw_bdscore_"+path.basename(url));
  const Headers = {};
  if (options) {
    if (options.filePath && typeof options.filePath === "string") fileSave = options.filePath;
    if (options.headers) Object.keys(options.headers).forEach(key => Headers[key] = String(options.headers[key]));
  }

  const gotStream = got.stream({url, headers: Headers, isStream: true});
  gotStream.pipe(fs.createWriteStream(fileSave, {autoClose: false}));
  await new Promise((done, reject) => {
    gotStream.on("end", () => setTimeout(done, 1000));
    gotStream.on("error", reject);
  });
  return fileSave;
}

export async function getBuffer(url, options) {
  const Headers = {};
  let Body;
  if (options) {
    if (options.headers) Object.keys(options.headers).forEach(key => Headers[key] = options.headers[key]);
    if (options.body) Body = options.body;
  }
  const data = await got(url, {
    headers: Headers,
    body: Body,
    method: (options?.method||"GET").toUpperCase(),
    responseType: "buffer"
  });
  return Buffer.from(data.body);
}

export async function getJSON(url, options) {
  return getBuffer(url, {
    body: options?.body,
    headers: options?.headers,
    method: options?.method
  }).then(res => JSON.parse(res.toString("utf8")));
}


export async function GithubRelease(username, repo) {
  let fullRepo = username;
  if (!username) throw new Error("Repository is required, example: GithubRelease(\"Username/repo\") or GithubRelease(\"Username\", \"repo\")");
  if (repo) {
    if (!/\//.test(fullRepo)) fullRepo += "/"+repo;
  }
  return getJSON(`https://api.github.com/repos/${fullRepo}/releases?per_page=100`);
}

export async function githubTree(username, repo, tree) {
  const validate = /^[a-zA-Z0-9_\-]+$/;
  if (!validate.test(username)) throw new Error("Invalid username");
  if (!validate.test(repo)) throw new Error("Invalid repository name");
  return getJSON<githubTree>(`https://api.github.com/repos/${username}/${repo}/git/trees/${tree}?recursive=true`);
}