import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export const runtime = 'nodejs'

export async function POST() {
  const runnerPath = path.join(process.cwd(), 'scripts', 'run-scrape.mjs')

  try {
    const { stdout, stderr } = await execFileAsync(process.execPath, [runnerPath], {
      cwd: process.cwd(),
      env: process.env,
      timeout: 10 * 60 * 1000,
      maxBuffer: 1024 * 1024 * 10,
    })

    return Response.json({
      ok: true,
      command: process.execPath,
      output: stdout.trim(),
      errorOutput: stderr.trim(),
    })
  } catch (error) {
    const details = error as NodeJS.ErrnoException & {
      stdout?: string
      stderr?: string
    }

    return Response.json(
      {
        ok: false,
        error: details.stderr?.trim() || details.message || 'Scraper failed.',
        output: details.stdout?.trim() || '',
      },
      { status: 500 }
    )
  }
}
