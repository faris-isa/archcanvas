import { db } from './init'
import { PipelineSummary, PipelineDetail } from '@archcanvas/shared'
import { FieldValue } from 'firebase-admin/firestore'

const COLLECTION = 'pipelines'

export const pipelineService = {
  async listPipelines(): Promise<PipelineSummary[]> {
    const snapshot = await db.collection(COLLECTION).orderBy('updatedAt', 'desc').get()
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      }
    })
  },

  async getPipeline(id: string): Promise<PipelineDetail | null> {
    const doc = await db.collection(COLLECTION).doc(id).get()
    if (!doc.exists) return null
    const data = doc.data()!
    return {
      id: doc.id,
      name: data.name,
      canvasState: data.canvasState, // Native JSON in Firestore
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    }
  },

  async createPipeline(name: string, canvasState: any): Promise<string> {
    const docRef = await db.collection(COLLECTION).add({
      name,
      canvasState,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
    return docRef.id
  },

  async updatePipeline(id: string, name?: string, canvasState?: any): Promise<void> {
    const update: any = {
      updatedAt: FieldValue.serverTimestamp(),
    }
    if (name) update.name = name
    if (canvasState) update.canvasState = canvasState
    await db.collection(COLLECTION).doc(id).update(update)
  },

  async deletePipeline(id: string): Promise<void> {
    await db.collection(COLLECTION).doc(id).delete()
  }
}
