import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure Next traces files relative to this project (avoid wrong workspace root)
  outputFileTracingRoot: __dirname,
}

export default nextConfig
