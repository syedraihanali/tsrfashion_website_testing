import { spawn } from 'node:child_process';

async function runCommandWithRetries({ name, command, args, retries = 3, retryDelayMs = 2000 }) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    const exitCode = await runCommand(command, args);
    if (exitCode === 0) {
      return;
    }

    const attemptInfo = `${name} attempt ${attempt} failed with exit code ${exitCode}`;
    if (attempt < retries) {
      console.warn(`${attemptInfo}. Retrying in ${retryDelayMs / 1000} seconds...`);
      await delay(retryDelayMs);
    } else {
      throw new Error(`${attemptInfo}. No retries left.`);
    }
  }
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      env: process.env,
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      resolve(code ?? 1);
    });
  });
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function main() {
  try {
    await runCommandWithRetries({
      name: 'Prisma migrate deploy',
      command: 'npx',
      args: ['prisma', 'migrate', 'deploy'],
    });

    await runCommandWithRetries({
      name: 'Prisma db seed',
      command: 'npx',
      args: ['prisma', 'db', 'seed'],
    });

    await runCommandWithRetries({
      name: 'Next.js build',
      command: 'npx',
      args: ['next', 'build'],
      retries: 1,
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
