import { createLogger } from '../../utils/logger'

import { TodosRepo } from '../repository/todosRepo'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { TodoItemEntity } from '../models/TodoItemEntity'
import { v5 as uuidv5 } from 'uuid'

const logger = createLogger('TodoService')
const repo: TodosRepo = new TodosRepo()

/**
 * Create TODO object using CreateTodoRequest object for the user
 * @param userId
 * @param newTodo
 */
export const createTodo = async (userId: string, newTodo: CreateTodoRequest) => {
  const todoId = uuidv5
  const todoItem: TodoItemEntity = {
    userId,
    todoId,
    createdAt: new Date().toISOString(),
    name: newTodo.name,
    dueDate: newTodo.dueDate,
    done: false,
    attachmentUrl: `https://${process.env.ATTACHMENT_S3_BUCKET}.s3.amazonaws.com/${todoId}`
  }
  return repo.save(todoItem)
}

/**
 *
 * @param todoId
 * @param userId
 */
export const deleteTodo = async (todoId: string, userId: string) => {
  logger.info('Deleting the TODO object with ID {}', todoId)
  return repo.delete(todoId, userId)
}


/**
 *
 * @param user
 */
export const getTodosForUser = async (user: string) => {
  logger.info('Getting all TODOs for user {}', user)
  return repo.getAll(user)
}


/**
 *
 * @param userId
 * @param todoId
 * @param toBeUpdated
 */
export const updateTodo = async (userId: string, todoId: string, toBeUpdated: UpdateTodoRequest) => {
  logger.info('Updating todo, {}', JSON.stringify(toBeUpdated))
  return repo.UpdateById(userId, todoId, toBeUpdated)
}