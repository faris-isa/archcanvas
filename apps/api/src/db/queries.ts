import { db } from './connection'
import { pipelines, type NewPipeline } from './schema'
import { eq } from 'drizzle-orm'

export const createPipeline = async (data: NewPipeline) => {
  return db.insert(pipelines).values(data).returning().get()
}

export const getPipelines = async () => {
  return db.select().from(pipelines).all()
}

export const getPipelineById = async (id: string) => {
  return db.select().from(pipelines).where(eq(pipelines.id, id)).get()
}

export const updatePipeline = async (id: string, data: Partial<NewPipeline>) => {
  return db.update(pipelines)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(pipelines.id, id))
    .returning()
    .get()
}

export const deletePipeline = async (id: string) => {
  return db.delete(pipelines).where(eq(pipelines.id, id)).returning().get()
}
