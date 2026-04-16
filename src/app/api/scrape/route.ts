import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export const runtime = 'nodejs'

export async function POST() {
  const scriptPath = path.join(process.cwd(), 'scrapers', 'scrape.py')

  const env = {
    ...process.env,
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  }

  try {
    const { stdout, stderr } = await execFileAsync('python3', [scriptPath], {
      cwd: process.cwd(),
      env,
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
