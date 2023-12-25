import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { getTodosForUser } from '../../domain/service/todoService'

import { getUserId } from '../../utils/utils'
import { createLogger } from '../../utils/logger'
const logger = createLogger('auth')
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const userId: string = getUserId(event)
    logger.info(`Received user with id ${userId}`)
    const todosForUser = await getTodosForUser(userId)
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