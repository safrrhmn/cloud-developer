import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { CreateTodoRequest } from '../../domain/requests/CreateTodoRequest'
import { getUserId } from '../../utils/utils'
import { createTodo } from '../../domain/service/todoService'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createTodo')
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    logger.info(`Received request for creating todo with body ${event.body}`)
    const userId: string = getUserId(event)
    const todosForUser = await createTodo(userId, newTodo)
    return {
      statusCode: 200,
      body: JSON.stringify(todosForUser)
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
