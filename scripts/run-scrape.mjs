import { access } from 'node:fs/promises'
import { constants } from 'node:fs'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import nextEnv from '@next/env'

const execFileAsync = promisify(execFile)
const { loadEnvConfig } = nextEnv

loadEnvConfig(process.cwd())

const scriptPath = path.join(process.cwd(), 'scrapers', 'scrape.py')
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const configuredServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
const serviceKey =
  configuredServiceKey && configuredServiceKey.length > 80
    ? configuredServiceKey
    : anonKey

if (!supabaseUrl || !serviceKey) {
  console.error('Missing SUPABASE_URL and/or a Supabase service key on the server.')
  process.exit(1)
}

await access(scriptPath, constants.R_OK)

const env = {
  ...process.env,
  SUPABASE_URL: supabaseUrl,
  SUPABASE_SERVICE_KEY: serviceKey,
}

const pythonCandidates = [
  process.env.PYTHON_EXECUTABLE,
  path.join(process.cwd(), '.venv312', 'bin', 'python'),
  path.join(process.cwd(), '.venv313', 'bin', 'python'),
  path.join(process.cwd(), '.venv', 'bin', 'python'),
  '/usr/bin/python3.12',
  '/home/linuxbrew/.linuxbrew/bin/python3.13',
  '/home/linuxbrew/.linuxbrew/opt/python@3.14/bin/python3.14',
  '/home/linuxbrew/.linuxbrew/bin/python3',
  'python3',
  'python',
].filter(Boolean)

let lastError = null

for (const pythonCmd of pythonCandidates) {
  try {
    const { stdout, stderr } = await execFileAsync(pythonCmd, [scriptPath], {
      cwd: process.cwd(),
      env,
      timeout: 10 * 60 * 1000,
      maxBuffer: 1024 * 1024 * 10,
    })

    if (stderr.trim()) {
      process.stderr.write(stderr)
    }
    process.stdout.write(stdout)
    process.exit(0)
  } catch (error) {
    if (error?.code === 'ENOENT') {
      lastError = error
      continue
    }

    if (error?.stdout) {
      process.stdout.write(error.stdout)
    }
    if (error?.stderr) {
      process.stderr.write(error.stderr)
    } else if (error?.message) {
      process.stderr.write(`${error.message}\n`)
    }
    process.exit(1)
  }
}

if (lastError?.message) {
  process.stderr.write(`${lastError.message}\n`)
} else {
  process.stderr.write('Python is not installed or not available as python3/python.\n')
}
process.exit(1)
