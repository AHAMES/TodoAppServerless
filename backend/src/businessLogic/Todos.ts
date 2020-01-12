import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todoAccess'
import { TodoUpdate } from '../models/TodoUpdate'
//import { CreateGroupRequest } from '../requests/CreateGroupRequest'
import { parseUserId } from '../auth/utils'

const todoAccess = new TodoAccess()

import { createLogger } from '../utils/logger'
const logger = createLogger('Todo logic')

export async function getUserTodos(jwtToken) {
  const userId = parseUserId(jwtToken)
  return await todoAccess.getUserTodos(userId)
}

export async function createTodo(
  newItem: TodoItem,
  jwtToken: string
): Promise<TodoItem> {
  const userId = parseUserId(jwtToken)
  newItem.userId = userId
  return await todoAccess.createTodo(newItem)
}

export async function updateUserTodo(
  todo: TodoUpdate,
  todoId: string,
  jwtToken: string
) {
  const userId = parseUserId(jwtToken)
  logger.info('userId in update user', { userId })
  await todoAccess.updateUserTodo(todo, todoId, userId)
}
export async function deleteUserTodos(todoId, jwtToken) {
  const userId = parseUserId(jwtToken)
  await todoAccess.deleteUserTodo(todoId, userId)
}

export async function generateUploadUrl(todoId: string, jwtToken) {
  const userId = parseUserId(jwtToken)
  return await todoAccess.generateUploadUrl(todoId, userId)
}

/*export async function setAttachmentURL(todoId: string, jwtToken) {
  const userId = parseUserId(jwtToken)
  await todoAccess.setAttachTodoURL(todoId, userId)
}*/
