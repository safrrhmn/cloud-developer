import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { getTodosForUser } from '../../domain/service/todoService'

import { getUserId } from '../../utils/utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const userId: string = getUserId(event)
    const todosForUser = getTodosForUser(userId)
    return {
      statusCode: 200,
      body: JSON.stringify(todosForUser)
    }
  })
handler
  .use(httpErrorHandler())
  .use(
  cors({
    credentials: true
  })
)