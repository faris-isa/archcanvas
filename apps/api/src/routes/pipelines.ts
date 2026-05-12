import { Hono } from 'hono'
import { 
  createPipeline, 
  getPipelines, 
  getPipelineById, 
  updatePipeline, 
  deletePipeline 
} from '../db/queries'
import { PipelineSummary, PipelineDetail } from '@archcanvas/shared'

const pipelines = new Hono()

pipelines.get('/', async (c) => {
  const list = await getPipelines()
  const summaries: PipelineSummary[] = list.map(p => ({
    id: p.id,
    name: p.name,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }))
  return c.json(summaries)
})

pipelines.get('/:id', async (c) => {
  const id = c.req.param('id')
  const p = await getPipelineById(id)
  if (!p) return c.json({ error: 'Not Found' }, 404)
  
  const detail: PipelineDetail = {
    id: p.id,
    name: p.name,
    canvasState: p.canvasState,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }
  return c.json(detail)
})

pipelines.post('/', async (c) => {
  const body = await c.req.json()
  const id = `pipe-${Date.now()}`
  const newP = await createPipeline({
    id,
    name: body.name || 'Untitled Pipeline',
    canvasState: body.canvasState || JSON.stringify({ nodes: [], edges: [] }),
  })
  return c.json(newP, 201)
})

pipelines.put('/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const updated = await updatePipeline(id, body)
  if (!updated) return c.json({ error: 'Not Found' }, 404)
  return c.json(updated)
})

pipelines.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const deleted = await deletePipeline(id)
  if (!deleted) return c.json({ error: 'Not Found' }, 404)
  return c.json({ success: true }, 200)
})

export default pipelines
