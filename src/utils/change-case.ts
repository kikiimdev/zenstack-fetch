import camelCase from "camelcase"

export function toCamelCase(str: string): string {
  return camelCase(str)
}

export function toPascalCase(str: string): string {
  return camelCase(str, { pascalCase: true })
}
