export function toCamelCase(str: string): string {
  return str
    .split(/[^A-Za-z]+/)
    .map((word, index) => {
      return index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join("")
}

export function toPascalCase(str: string): string {
  // Make the first letter uppercase and keep rest lowercase
  return str.charAt(0).toUpperCase() + str.slice(1)
}
