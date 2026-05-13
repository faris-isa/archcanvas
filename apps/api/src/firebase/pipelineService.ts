import { db } from "./init";
import { PipelineSummary, PipelineDetail } from "@archcanvas/shared";
import { FieldValue } from "firebase-admin/firestore";

const COLLECTION = "pipelines";

// Simple In-Memory fallback for when Firestore is unavailable
const MEMORY_STORE: Record<string, any> = {};

export const pipelineService = {
  async listPipelines(): Promise<PipelineSummary[]> {
    try {
      const snapshot = await db.collection(COLLECTION).orderBy("updatedAt", "desc").get();
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        };
      });
    } catch (e) {
      console.warn("Firestore unavailable, using memory store for listing");
      return Object.entries(MEMORY_STORE)
        .map(([id, data]) => ({
          id,
          name: data.name,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        }))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }
  },

  async getPipeline(id: string): Promise<PipelineDetail | null> {
    try {
      const doc = await db.collection(COLLECTION).doc(id).get();
      if (!doc.exists) return MEMORY_STORE[id] || null;
      const data = doc.data()!;
      return {
        id: doc.id,
        name: data.name,
        canvasState: data.canvasState,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      };
    } catch (e) {
      console.warn("Firestore unavailable, using memory store for get");
      return MEMORY_STORE[id] || null;
    }
  },

  async createPipeline(name: string, canvasState: any): Promise<string> {
    try {
      const docRef = await db.collection(COLLECTION).add({
        name,
        canvasState,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return docRef.id;
    } catch (e) {
      console.warn("Firestore unavailable, saving to memory store");
      const id = `mem-${Date.now()}`;
      const now = new Date().toISOString();
      MEMORY_STORE[id] = {
        id,
        name,
        canvasState,
        createdAt: now,
        updatedAt: now,
      };
      return id;
    }
  },

  async updatePipeline(id: string, name?: string, canvasState?: any): Promise<void> {
    try {
      const update: any = {
        updatedAt: FieldValue.serverTimestamp(),
      };
      if (name) update.name = name;
      if (canvasState) update.canvasState = canvasState;
      await db.collection(COLLECTION).doc(id).update(update);
    } catch (e) {
      console.warn("Firestore unavailable, updating in memory store");
      if (MEMORY_STORE[id]) {
        if (name) MEMORY_STORE[id].name = name;
        if (canvasState) MEMORY_STORE[id].canvasState = canvasState;
        MEMORY_STORE[id].updatedAt = new Date().toISOString();
      }
    }
  },

  async deletePipeline(id: string): Promise<void> {
    try {
      await db.collection(COLLECTION).doc(id).delete();
    } catch (e) {
      console.warn("Firestore unavailable, deleting from memory store");
      delete MEMORY_STORE[id];
    }
  },
};
