import { loadEnvConfig } from "@next/env";

// If you need to load environment variables outside of the Next.js runtime,
// such as in a root config file for an ORM or test runner...
// https://nextjs.org/docs/app/guides/environment-variables#loading-environment-variables-with-nextenv

const projectDir = process.cwd();
loadEnvConfig(projectDir);
