import { type PluginOptions } from "@zenstackhq/sdk"
import { isDataModel, type DataModel, type Model } from "@zenstackhq/sdk/ast"
import { writeFile, mkdir, rm, cp } from "fs/promises"
import { existsSync } from "fs"
import { toCamelCase, toPascalCase } from "./utils/change-case"
import { operations } from "./utils/use-prisma"

export const name = "ZenStack Fetch"

export default async function run(model: Model, options: PluginOptions) {
  const DIR = (options?.dir as string) || "lib/prisma"

  const isDirExists = existsSync(DIR)
  if (isDirExists)
    await rm(DIR, {
      recursive: true,
    })
  await mkdir(DIR, { recursive: true })
  await mkdir(`${DIR}/utils`)

  await cp(`${__dirname}/utils/use-prisma.ts`, `${DIR}/utils/use-prisma.ts`)

  // get all data models
  const dataModels = model.declarations.filter((x): x is DataModel =>
    isDataModel(x)
  )

  for (const model of dataModels) {
    const modelName = model.name
    const camelCaseModelName = toCamelCase(modelName)

    await writeFile(
      `${DIR}/${camelCaseModelName}.ts`,
      `import { Prisma } from "@prisma/client"
import { type PrismaClient } from "@zenstackhq/runtime"
import { usePrisma } from "./utils/use-prisma"

${createOperationTypes(model)}

${createFn(model)}
`
    )
  }

  await writeFile(`${DIR}/index.ts`, createImportIndex(dataModels))
}

function createImportIndex(models: DataModel[]) {
  const importType = (model: DataModel) =>
    operations
      .map((operation) => {
        const modelName = model.name
        // const camelCaseModelName = toCamelCase(modelName)
        const pascalCaseOperation = toPascalCase(operation)

        const withOutput = ![
          "updateMany",
          "deleteMany",
          "aggregate",
          "count",
        ].includes(operation)

        const inputImport = `  type ${pascalCaseOperation}${modelName}Input,`
        const outputImport = withOutput
          ? `\n type ${pascalCaseOperation}${modelName}Output,`
          : ""

        return `${inputImport}${outputImport}`
      })
      .join("\n")

  const importFn = (model: DataModel) =>
    operations
      .map((operation) => {
        const modelName = model.name
        // const camelCaseModelName = toCamelCase(model.name)
        // const pascalCaseOperation = toPascalCase(operation)

        return `  ${operation}${modelName},`
      })
      .join("\n")

  const imports = models
    .map((model) => {
      const modelName = model.name
      const camelCaseModelName = toCamelCase(modelName)

      return `export {
${importType(model)}
${importFn(model)}
} from "./${camelCaseModelName}"`
    })
    .join("\n\n")

  return `export { usePrisma } from "./utils/use-prisma"
${imports}
`
}

function createOperationTypes(model: DataModel) {
  return operations
    .map((operation) => {
      const modelName = model.name
      const camelCaseModelName = toCamelCase(model.name)
      const pascalCaseOperation = toPascalCase(operation)

      const withOutput = ![
        "updateMany",
        "deleteMany",
        "aggregate",
        "count",
      ].includes(operation)

      const inputType = `export type ${pascalCaseOperation}${modelName}Input = Prisma.Args<PrismaClient["${camelCaseModelName}"], "${operation}">`
      const outputType = withOutput
        ? `\nexport type ${pascalCaseOperation}${modelName}Output<I extends ${pascalCaseOperation}${modelName}Input> = Prisma.${modelName}GetPayload<I>`
        : ""

      return `${inputType} ${outputType}`
    })
    .join("\n")
}

function createFn(model: DataModel) {
  return operations
    .map((operation) => {
      const modelName = model.name
      const camelCaseModelName = toCamelCase(model.name)
      const pascalCaseOperation = toPascalCase(operation)

      return `export const ${operation}${modelName} = <T extends ${pascalCaseOperation}${modelName}Input> (
  input?: MaybeRef<Prisma.Exact<T, ${pascalCaseOperation}${modelName}Input>>
) =>
  usePrisma({
    model: "${camelCaseModelName}",
    operation: "${operation}",
    input,
  })
`
    })
    .join("\n")
}
