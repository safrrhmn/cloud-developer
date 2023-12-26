import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodo } from '../../domain/service/todoService'
import { UpdateTodoRequest } from '../../domain/requests/UpdateTodoRequest'
import { getUserId } from '../../utils/utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('updateTodo')
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId: string = getUserId(event)
    logger.info(`Update user ${userId}`)
    const todoId: string = event.pathParameters.todoId
    logger.info(`Update todoId ${todoId}`)
    const toBeUpdate: UpdateTodoRequest = JSON.parse(event.body)
    if (toBeUpdate.name === '' || toBeUpdate.dueDate === '' || !toBeUpdate.done) {
      return {
        statusCode: 400,
        body: JSON.stringify('Invalid request body')
      }
    }
    logger.info(`Update body ${event.body}`)
    const updatedTodo = await updateTodo(userId, todoId, toBeUpdate)
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
