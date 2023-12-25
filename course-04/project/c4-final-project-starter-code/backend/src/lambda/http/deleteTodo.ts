import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getUserId } from '../../utils/utils'
import { deleteTodo } from '../../domain/service/todoService'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId: string = event.pathParameters.todoId
    const userId: string = getUserId(event)
    const deleted = await deleteTodo(userId, todoId)
    return {
      statusCode: 200,
      body: JSON.stringify(deleted)
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
