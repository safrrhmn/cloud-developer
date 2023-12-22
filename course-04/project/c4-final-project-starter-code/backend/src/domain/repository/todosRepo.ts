import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import * as AWS from 'aws-sdk'

const AWSXRay = require('aws-xray-sdk')
import { createLogger } from '../../utils/logger'

import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { TodoItemEntity } from '../models/TodoItemEntity'

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('TodosRepo')

export class TodosRepo {
  constructor(private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
              private readonly todosTable = process.env.TODOS_TABLE,
              private readonly createdAtIndex = process.env.TODOS_CREATED_AT_INDEX) {

  }

  /**
   * Get All TODOs for User
   * @param userId
   */
  getAll = async (userId: string) => {
    const params: DocumentClient.QueryInput = {
      TableName: this.todosTable,
      IndexName: this.createdAtIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        userId: userId
      }
    }
    const result = await this.docClient.query(params).promise()
    logger.info('Successfully received getAll() response from dynamodb.')
    return result
  }

  /**
   *
   * @param userId
   * @param todoId
   * @param toBeUpdated
   * @constructor
   */
  UpdateById = async (userId: string, todoId: string, toBeUpdated: UpdateTodoRequest) => {
    const params: DocumentClient.UpdateItemInput = {
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      },
      UpdateExpression: 'set dueDate = :dueDate, done = :done',
      ExpressionAttributeValues: {
        dueDate: toBeUpdated.dueDate,
        done: toBeUpdated.done
      }
    }
    const result = await this.docClient.update(params).promise()
    logger.info('Successfully got response from dynamodb after update.')
    return result
  }

  /**
   * Save a new TODO to DB.
   * @param item
   */
  save = async (item: TodoItemEntity) => {
    const params: DocumentClient.PutItemInput = {
      TableName: this.todosTable,
      Item: item
    }
    logger.info('New TODO Save Request to DB {}', params)
    const result = await this.docClient.put(params).promise()
    logger.info('Successfully saved TODO item {}.', item)
    return result
  }

  /**
   * Delete a todo object using userid and todoId
   * @param todoId
   * @param userId
   */
  delete = async (todoId: string, userId: string) => {
    const params: DocumentClient.DeleteItemInput = {
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      }
    }
    const result = await this.docClient.delete(params).promise()
    logger.info('Successfully deleted todo item from dynamodb {}.', result)
    return result
  }
}