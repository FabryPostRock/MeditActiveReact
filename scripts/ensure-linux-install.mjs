// scripts/ensure-linux-install.mjs
import { existsSync, readFileSync } from 'node:fs';

function isWsl() {
  if (process.platform !== 'linux') {
    return false;
  }

  if (process.env.WSL_DISTRO_NAME || process.env.WSL_INTEROP) {
    return true;
  }

  const versionFiles = ['/proc/version', '/proc/sys/kernel/osrelease'];

  return versionFiles.some((filePath) => {
    if (!existsSync(filePath)) {
      return false;
    }

    try {
      return /microsoft|wsl/i.test(readFileSync(filePath, 'utf8'));
    } catch {
      return false;
    }
  });
}

function printEnvironment() {
  const environment = isWsl() ? 'WSL' : process.platform === 'linux' ? 'Linux' : process.platform;

  console.log(
    `[preinstall] Ambiente rilevato: ${environment}, ` + `Node ${process.version}, architettura ${process.arch}.`,
  );
}

if (process.platform !== 'linux') {
  console.error(`
ERRORE: le dipendenze del progetto Tongue devono essere installate da WSL/Linux.

Ambiente rilevato:
- sistema Node: ${process.platform}
- architettura: ${process.arch}
- versione Node: ${process.version}

Non eseguire da PowerShell, Prompt dei comandi o terminale Windows:
  npm install
  npm ci
  npm update

Apri invece Ubuntu/WSL ed esegui:
  cd /mnt/c/Users/fabri/Documents/SoftwareProjects/Tongue
  nvm use
  npm install

In alternativa, apri il workspace da WSL:
  code Tongue.code-workspace

Questo controllo impedisce la creazione di node_modules con binding nativi
Windows incompatibili con Vite/Rolldown eseguiti in WSL.
`);

  process.exit(1);
}

printEnvironment();

if (!isWsl()) {
  console.warn(
    '[preinstall] Linux rilevato, ma non WSL. ' +
      'L’installazione è consentita perché i binding nativi saranno comunque Linux.',
  );
}

console.log('[preinstall] Installazione consentita: node_modules sarà generato per Linux.');
