import { camelCase, pascalCase } from "change-case"

export function toCamelCase(str: string): string {
  return camelCase(str)
}

export function toPascalCase(str: string): string {
  return pascalCase(str)
}
