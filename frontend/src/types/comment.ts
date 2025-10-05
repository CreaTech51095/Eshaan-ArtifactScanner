export interface ArtifactComment {
  id: string
  artifactId: string
  userId: string
  userEmail: string
  username: string
  content: string
  type: 'comment' | 'suggestion'
  createdAt: Date
  updatedAt: Date
  isDeleted: boolean
}

export interface CreateCommentData {
  artifactId: string
  content: string
  type: 'comment' | 'suggestion'
}

export interface UpdateCommentData {
  content: string
}

