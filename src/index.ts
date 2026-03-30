/**
 * VectoSolve SDK — Official TypeScript client for the VectoSolve API
 *
 * Every method calls the VectoSolve API and consumes credits from your account.
 * Get your API key at https://vectosolve.com/developers
 */

export interface VectoSolveOptions {
  apiKey: string
  baseUrl?: string
}

export interface VectorizeOptions {
  mode?: 'standard' | 'hd' | 'cricut' | 'laser' | 'embroidery' | 'stencil' | 'coloring' | 'stamp'
}

export interface UpscaleOptions {
  scale?: 2 | 4
}

export interface GenerateLogoOptions {
  prompt: string
  style?: 'vector_illustration' | 'icon' | 'line_art' | 'engraving' | 'line_circuit' | 'linocut'
  model?: 'recraftv3' | 'recraftv2'
  colors?: string[]
  numVariants?: 1 | 2 | 4
}

export interface GeneratePatternOptions {
  prompt: string
  style?: string
}

export interface ApiResponse<T = Record<string, unknown>> {
  success: boolean
  data: T
  credits?: { used: number; remaining: number }
  error?: string
}

export interface VectorizeResult {
  svg: string
  width: number
  height: number
}

export interface RemoveBgResult {
  image: string // base64 PNG
  width: number
  height: number
}

export interface UpscaleResult {
  image: string // base64
  width: number
  height: number
}

export interface LogoResult {
  svgs: string[]
}

export class VectoSolve {
  private apiKey: string
  private baseUrl: string

  constructor(options: VectoSolveOptions) {
    if (!options.apiKey) throw new Error('VectoSolve: apiKey is required. Get one at https://vectosolve.com/developers')
    this.apiKey = options.apiKey
    this.baseUrl = options.baseUrl || 'https://vectosolve.com/api/v1'
  }

  // ── Vectorize ──

  async vectorize(input: string | Buffer | Blob, options?: VectorizeOptions): Promise<ApiResponse<VectorizeResult>> {
    const form = await this.buildForm(input)
    if (options?.mode && options.mode !== 'standard') {
      form.append('mode', options.mode)
    }
    return this.post('/vectorize', form)
  }

  // ── Remove Background ──

  async removeBackground(input: string | Buffer | Blob): Promise<ApiResponse<RemoveBgResult>> {
    const form = await this.buildForm(input)
    return this.post('/remove-bg', form)
  }

  // ── Upscale ──

  async upscale(input: string | Buffer | Blob, options?: UpscaleOptions): Promise<ApiResponse<UpscaleResult>> {
    const form = await this.buildForm(input)
    if (options?.scale) form.append('scale', String(options.scale))
    return this.post('/upscale', form)
  }

  // ── Generate Logo ──

  async generateLogo(options: GenerateLogoOptions): Promise<ApiResponse<LogoResult>> {
    return this.postJson('/generate-logo', {
      prompt: options.prompt,
      style: options.style || 'vector_illustration',
      model: options.model || 'recraftv3',
      colors: options.colors,
      num_variants: options.numVariants || 1,
    })
  }

  // ── Generate Pattern ──

  async generatePattern(options: GeneratePatternOptions): Promise<ApiResponse> {
    return this.postJson('/generate-pattern', {
      prompt: options.prompt,
      style: options.style,
    })
  }

  // ── Internal ──

  private async buildForm(input: string | Buffer | Blob): Promise<FormData> {
    const form = new FormData()
    if (typeof input === 'string') {
      if (input.startsWith('http://') || input.startsWith('https://')) {
        form.append('image_url', input)
      } else {
        // File path — read with Node fs
        const { readFileSync } = await import('fs')
        const { basename } = await import('path')
        const buf = readFileSync(input)
        const blob = new Blob([buf])
        form.append('file', blob, basename(input))
      }
    } else if (input instanceof Blob) {
      form.append('file', input, 'image.png')
    } else if (Buffer.isBuffer(input)) {
      const blob = new Blob([input])
      form.append('file', blob, 'image.png')
    }
    return form
  }

  private async post<T>(endpoint: string, form: FormData): Promise<ApiResponse<T>> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}` },
      body: form,
    })
    const data = await res.json() as ApiResponse<T>
    if (!res.ok) throw new VectoSolveError(data.error || `API error ${res.status}`, res.status)
    return data
  }

  private async postJson<T>(endpoint: string, body: Record<string, unknown>): Promise<ApiResponse<T>> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    const data = await res.json() as ApiResponse<T>
    if (!res.ok) throw new VectoSolveError(data.error || `API error ${res.status}`, res.status)
    return data
  }
}

export class VectoSolveError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'VectoSolveError'
    this.status = status
  }
}

export default VectoSolve
