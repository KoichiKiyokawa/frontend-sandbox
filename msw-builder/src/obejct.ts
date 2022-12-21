import { rest, ResponseResolver, RestRequest, defaultContext } from "msw"
import { joinPath } from "./util"

type MaybePromise<T> = T | Promise<T>

type Options = {
  method: keyof typeof rest
  basePath: string
  path: string
  statusCode: number
  resolver(req: RestRequest): MaybePromise<any>
  spy: ResponseResolver
  readonly toHandler: () => ReturnType<typeof rest[keyof typeof rest]>
}

const builder: Options = {
  method: "get",
  basePath: "http://localhost:3000",
  path: "/",
  statusCode: 200,
  resolver: () => undefined,
  spy: () => {},
  toHandler() {
    return rest[this.method](
      joinPath(this.basePath, this.path),
      async (req: RestRequest, res: any, ctx: any) => {
        this.spy(req, res, ctx)
        return res(
          ctx.status(this.statusCode),
          ctx.json(await this.resolver(req))
        )
      }
    )
  },
}

type User = { id: string; name: string; age: number }
const getUserBuilder: Options = {
  ...builder,
  path: "/user/:id",
  resolver: (req) =>
    ({
      id: req.params.id as string,
      age: 10,
      name: "hoge",
    } satisfies User),
}
