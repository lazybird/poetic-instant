export interface DbPoem {
  id: string
  text: string
  author: string
  created_at: string
  likes: number
}

export interface NewPoem {
  text: string
  author: string
}

export interface DbFavorite {
  id: string
  poem_id: string
  created_at: string
} 