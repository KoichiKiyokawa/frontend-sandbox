export const sql =
  (db: D1Database) =>
  async <T>(segments: TemplateStringsArray, ...args: unknown[]) => {
    let query = ""
    for (let i = 0; i < args.length; i++) {
      query += segments[i] + "?"
    }
    query += segments[segments.length - 1]
    const res = await db
      .prepare(query)
      .bind(...args)
      .run()
    if (res.success)
      return { success: true as const, results: res.results as T[] }
    else return { success: false as const, error: res.error as string }
  }
