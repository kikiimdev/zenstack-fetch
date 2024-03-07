/* eslint-disable @typescript-eslint/ban-ts-comment */

import { Prisma, type PrismaClient } from "@prisma/client"
import { deserialize } from "superjson"
import { type MaybeRef, ref, unref } from "vue"

type Any = Record<string, unknown>

export type Model = Exclude<keyof PrismaClient, `$${string}` | symbol>
type Operation<M extends Model> = keyof PrismaClient[M] & PrismaOperation
export type PrismaInput<
  M extends Model,
  O extends Operation<M>,
  S,
> = Prisma.Exact<S, Prisma.Args<PrismaClient[M], O>>

type UsePrismaArgs<M extends Model, O extends Operation<M>, S> = {
  model: M
  operation: O
  input?: MaybeRef<Prisma.Exact<S, Prisma.Args<PrismaClient[M], O>>>
}

export type Sort<ColumnT> = {
  column: keyof ColumnT
  direction: ColumnT[keyof ColumnT]
}

export const usePrisma = async <M extends Model, O extends Operation<M>, S>(
  args: UsePrismaArgs<M, O, S>
) => {
  const { model, operation, input = {} } = args

  const data = ref(undefined as Prisma.Result<PrismaClient[M], S, O>)

  const execute = async () => {
    const unreffedInput = unref(input)

    let method: "GET" | "POST" | "PUT" | "DELETE" = "GET"
    if (
      operation === "create" ||
      // operation === "createMany" ||
      operation === "upsert"
    )
      method = "POST"
    else if (operation === "update" || operation === "updateMany")
      method = "PUT"
    else if (operation === "delete" || operation === "deleteMany")
      method = "DELETE"

    let query: { q: unknown } | undefined = undefined
    if (unreffedInput) {
      query = {
        q: unreffedInput,
      }
    }

    let body
    if (operation === "create") {
      body = {
        data: (unreffedInput as Any)?.data,
      }
    }
    if (operation === "update" || operation === "updateMany") {
      body = {
        data: (unreffedInput as Any)?.data,
        where: (unreffedInput as Any)?.where,
      }
    }
    if (operation === "upsert") {
      body = {
        create: (unreffedInput as Any)?.create,
        update: (unreffedInput as Any)?.update,
        where: (unreffedInput as Any)?.where,
      }
    }
    if (operation === "delete" || operation === "deleteMany") {
      body = {
        where: (unreffedInput as Any)?.where,
      }
    }

    // @ts-ignore
    const { data } = await useFetch(`/api/model/${model}/${operation}`, {
      // @ts-ignore
      method,
      query,
      body,
    })
    const response = data.value

    // @ts-ignore
    const { data: json, meta } = response
    let _data = json
    if (meta) _data = deserialize({ json, meta: meta.serialization })

    data.value = _data

    // return response as { data: typeof _data }
    return data.value
  }

  return await execute()
}

export const defineTake = (take: MaybeRef<number | undefined>) =>
  unref(take) ? Number(unref(take)) : undefined

export const defineSkip = ({
  perPage,
  page,
}: {
  perPage: MaybeRef<number | undefined>
  page: MaybeRef<number | undefined>
}) => {
  const _perPage = unref(perPage)
  const _page = unref(page)
  if (!_page) return undefined

  const skip = Number((_perPage || 10) * (_page - 1))

  return skip
}

export const defineOrderBy = <T>(sort: MaybeRef<Sort<T> | undefined>) => {
  const _sort = unref(sort)
  if (!_sort) return undefined

  const orderBy = dotStringToObject(
    _sort.column as string,
    _sort.direction
  ) as T
  return orderBy

  // return {
  //   [_sort.column]: _sort.direction,
  // }
}

export const defineWhere = <T>(where: MaybeRef<T | undefined>) => {
  const _where = unref(where)
  if (!_where || !Object.keys(_where as unknown[]).length) return undefined

  return _where
}

function dotStringToObject(strings: string, data: unknown): unknown {
  const keys = strings.split(".").reverse()
  let lastKey = ""
  const current: Any = {}

  keys.map((key) => {
    if (!lastKey) {
      current[key] = data
    } else {
      current[key] = { ...current }
      delete current[lastKey]
    }

    lastKey = key
  })

  return current
}

export const operations = [
  "findFirst",
  "findFirstOrThrow",
  "findUnique",
  "findUniqueOrThrow",
  "findMany",
  "create",
  // "createMany",
  "update",
  "updateMany",
  "upsert",
  "delete",
  "deleteMany",
  "aggregate",
  "count",
  // "groupBy",
  // "$queryRaw",
  // "$executeRaw",
  // "$queryRawUnsafe",
  // "$executeRawUnsafe",
  // "findRaw",
  // "aggregateRaw",
  // "$runCommandRaw",
] as const
export type PrismaOperation = (typeof operations)[number]
