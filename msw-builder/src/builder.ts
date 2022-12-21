import { rest, ResponseResolver, MockedRequest, defaultContext } from "msw"
import { joinPath } from "./util"

type MaybePromise<T> = T | Promise<T>

type Options<ResponseData> = {
  method: keyof typeof rest
  basePath: string
  path: string
  statusCode: number
  resolver: (req: MockedRequest) => MaybePromise<ResponseData | undefined>
  spy: ResponseResolver
}

class RestMswBuilder<ResponseData> {
  private options: Options<ResponseData>

  constructor(options?: Partial<Options<ResponseData>>) {
    this.options = {
      ...options,
      method: "get",
      basePath: "http://localhost:3000",
      path: "/",
      statusCode: 200,
      resolver: () => undefined,
      spy: () => {},
    }
  }

  setMethod(method: Options<ResponseData>["method"]) {
    return new RestMswBuilder<ResponseData>({ ...this.options, method })
  }

  setBasePath(basePath: Options<ResponseData>["basePath"]) {
    return new RestMswBuilder<ResponseData>({ ...this.options, basePath })
  }

  setPath(path: Options<ResponseData>["path"]) {
    return new RestMswBuilder<ResponseData>({ ...this.options, path })
  }

  setStatusCode(statusCode: Options<ResponseData>["statusCode"]) {
    return new RestMswBuilder<ResponseData>({ ...this.options, statusCode })
  }

  setResolver<ResponseData>(resolver: Options<ResponseData>["resolver"]) {
    return new RestMswBuilder<ResponseData>({ ...this.options, resolver })
  }

  setSpy(spy: Options<ResponseData>["spy"]) {
    return new RestMswBuilder<ResponseData>({ ...this.options, spy })
  }

  toHandler() {
    const { method, basePath, path, statusCode, resolver, spy } = this.options
    return rest[method](
      joinPath(basePath, path),
      async (req: MockedRequest, res: any, ctx: any) => {
        spy(req, res, ctx)
        return res(ctx.status(statusCode), ctx.json(await resolver(req)))
      }
    )
  }
}

const baseBuilder = new RestMswBuilder()
  .setBasePath("http://localhost:3000")
  .setResolver<{ name: string; age: number }>(() => ({ age: 1, name: "hoge" }))

const mock = jest.fn()
const normalUserBuilder = baseBuilder.setSpy((req, res, ctx) => {
  mock(req.url)
})

const emptyUserHandler = normalUserBuilder.setResolver(() => []).toHandler()
