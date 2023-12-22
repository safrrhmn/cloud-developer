import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodo } from '../../domain/service/todoService'
import { UpdateTodoRequest } from '../../domain/requests/UpdateTodoRequest'
import { getUserId } from '../../utils/utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId: string = getUserId(event)
    const todoId: string = event.pathParameters.todoId
    const toBeUpdate: UpdateTodoRequest = JSON.parse(event.body)
    const updatedTodo = updateTodo(userId, todoId, toBeUpdate)
    return {
      statusCode: 200,
      body: JSON.stringify(updatedTodo)
    }
  })

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
