export function joinPath(...paths: string[]): string {
  return paths
    .map((path, i) => {
      if (i >= 1 && path.startsWith("/")) path = path.slice(1)
      if (path.endsWith("/")) path = path.slice(0, -1)
      return path
    })
    .join("/")
}
