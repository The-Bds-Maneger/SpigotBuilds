import child_process from "node:child_process";
import os from "node:os";
import fs from "node:fs/promises";
import path from "node:path";
import { saveFile } from "./httpRequest.mjs";

const ver = process.argv[2]||"latest";
child_process.execFileSync("java", ["-jar", await saveFile("https://hub.spigotmc.org/jenkins/job/BuildTools/lastSuccessfulBuild/artifact/target/BuildTools.jar"), "-o", process.cwd(), "--rev", ver], {cwd: os.tmpdir(), stdio: "inherit"});
if (ver !== "latest") {
  await fs.rm(path.join(process.cwd(), "Spigot.jar"), {force: true}).catch(() => null);
  await fs.rename(path.join(process.cwd(), (await fs.readdir(path.join(process.cwd()))).find(file => (file.startsWith("Spigot")||file.startsWith("spigot")) && file.endsWith(".jar"))), path.join(process.cwd(), "Spigot.jar"), {force: true});
}