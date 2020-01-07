import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todoAccess'
//import { CreateGroupRequest } from '../requests/CreateGroupRequest'
import { parseUserId } from '../auth/utils'

const todoAccess = new TodoAccess()

export async function getUserTodos(jwtToken) {
  const userId = parseUserId(jwtToken)
  return await todoAccess.getUserTodos(userId)
}
