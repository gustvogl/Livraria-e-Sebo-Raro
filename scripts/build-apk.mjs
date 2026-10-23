import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, copyFileSync, chmodSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const windows = process.platform === 'win32';
const command = windows ? 'gradlew.bat' : './gradlew';
if (!windows) chmodSync(path.join(root, 'android', 'gradlew'), 0o755);
const result = spawnSync(command, ['assembleDebug', '--no-daemon', '--stacktrace'], {
  cwd: path.join(root, 'android'), stdio: 'inherit', shell: windows,
});
if (result.error) {
  console.error('Não foi possível iniciar o Gradle. Confira Java 17 e Android SDK / Android Studio.', result.error.message);
  process.exit(1);
}
if (result.status !== 0) process.exit(result.status || 1);
const apk = path.join(root, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
if (!existsSync(apk)) throw new Error('O Gradle terminou, mas o APK não foi encontrado.');
mkdirSync(path.join(root, 'apk'), { recursive: true });
const target = path.join(root, 'apk', 'Livraria-Rara.apk');
copyFileSync(apk, target);
console.log(`\nAPK pronto: ${target}\n`);
