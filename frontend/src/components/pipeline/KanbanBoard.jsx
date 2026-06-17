// Author: Ajar | Module: Pipeline | CRM Platform v1.0

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { User, Clock, Bot } from 'lucide-react';
import api from '../../services/api.js';
import toast from 'react-hot-toast';
import useUiStore from '../../store/uiStore.js';

const STAGE_CONFIG = {
  NEW_LEAD: { label: 'New Lead', color: '#6C63FF', accent: 'border-primary/50' },
  QUALIFIED: { label: 'Qualified', color: '#F59E0B', accent: 'border-warning/50' },
  PROPOSAL: { label: 'Proposal', color: '#3B82F6', accent: 'border-blue-500/50' },
  NEGOTIATION: { label: 'Negotiation', color: '#8B5CF6', accent: 'border-purple-500/50' },
  WON: { label: 'Won', color: '#22C55E', accent: 'border-success/50' },
  LOST: { label: 'Lost', color: '#EF4444', accent: 'border-danger/50' },
};

const STAGE_ORDER = ['NEW_LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];

export default function KanbanBoard() {
  const [pipeline, setPipeline] = useState({});
  const [loading, setLoading] = useState(true);
  const { openAiDrawer } = useUiStore();

  const fetchPipeline = async () => {
    try {
      const res = await api.get('/pipeline');
      setPipeline(res.data.data);
    } catch {
      toast.error('Failed to load pipeline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPipeline(); }, []);

  const handleDragEnd = async (result) => {
    const { draggableId, source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const fromStage = source.droppableId;
    const toStage = destination.droppableId;
    const leadId = draggableId;

    // Optimistic update
    const prevPipeline = { ...pipeline };
    const newPipeline = JSON.parse(JSON.stringify(pipeline));

    const movedLead = newPipeline[fromStage].leads.splice(source.index, 1)[0];
    movedLead.pipelineStage = toStage;
    newPipeline[fromStage].count--;
    newPipeline[toStage].leads.splice(destination.index, 0, movedLead);
    newPipeline[toStage].count++;

    setPipeline(newPipeline);

    try {
      await api.put('/pipeline/move', { leadId, fromStage, toStage });
      toast.success(`Moved to ${STAGE_CONFIG[toStage].label}`);
    } catch (err) {
      // Rollback
      setPipeline(prevPipeline);
      toast.error(err.response?.data?.error || 'Move failed');
    }
  };

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGE_ORDER.map((s) => (
          <div key={s} className="min-w-[280px] kanban-column p-4 animate-pulse">
            <div className="h-6 bg-surface-elevated rounded w-24 mb-4" />
            <div className="space-y-3">
              <div className="h-24 bg-surface-elevated rounded-lg" />
              <div className="h-24 bg-surface-elevated rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '500px' }}>
        {STAGE_ORDER.map((stageKey) => {
          const stage = pipeline[stageKey] || { leads: [], count: 0, estimatedValue: 0 };
          const config = STAGE_CONFIG[stageKey];
          const isWon = stageKey === 'WON';
          const isLost = stageKey === 'LOST';

          return (
            <div
              key={stageKey}
              className={`min-w-[280px] flex-1 kanban-column ${isWon ? 'kanban-column-won' : ''} ${isLost ? 'kanban-column-lost' : ''} flex flex-col`}
            >
              {/* Column Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.color }} />
                  <h3 className="font-semibold text-sm">{config.label}</h3>
                  <span className="badge bg-surface-elevated text-text-secondary text-xs">{stage.count}</span>
                </div>
                <span className="text-xs font-mono text-text-secondary">${(stage.estimatedValue || 0).toLocaleString()}</span>
              </div>

              {/* Droppable Area */}
              <Droppable droppableId={stageKey}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-3 flex-1 space-y-3 transition-colors duration-200 ${snapshot.isDraggingOver ? 'bg-primary/5' : ''}`}
                  >
                    {stage.leads?.map((lead, index) => (
                      <Draggable key={lead.id} draggableId={lead.id} index={index}>
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            className={`kanban-card ${dragSnapshot.isDragging ? 'dragging' : ''}`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-medium text-sm">{lead.name}</h4>
                                <p className="text-text-secondary text-xs">{lead.company}</p>
                              </div>
                              {lead.score != null && (
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10" title={`AI Score: ${lead.score}`}>
                                  <Bot size={10} className="text-primary" />
                                  <span className="text-xs font-mono font-bold text-primary">{lead.score}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-1 text-text-secondary text-xs">
                                <User size={12} />
                                <span>{lead.assignedTo?.name || 'Unassigned'}</span>
                              </div>
                              {lead.estimatedValue > 0 && (
                                <span className="text-xs font-mono text-text-secondary">${lead.estimatedValue?.toLocaleString()}</span>
                              )}
                            </div>

                            <button
                              onClick={() => openAiDrawer(lead.id)}
                              className="mt-2 text-xs text-primary hover:text-primary-hover flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ opacity: 0.7 }}
                            >
                              <Bot size={10} /> Analyze
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {stage.leads?.length === 0 && (
                      <div className="text-center py-8 text-text-secondary text-sm">
                        No leads
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
