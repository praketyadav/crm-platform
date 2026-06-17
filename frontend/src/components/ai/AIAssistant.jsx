// Author: Praket | Module: AI Components | CRM Platform v1.0

import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Copy, Mail, Sparkles, Target, FileText } from 'lucide-react';
import api from '../../services/api.js';
import useUiStore from '../../store/uiStore.js';
import toast from 'react-hot-toast';

const QUICK_ACTIONS = [
  { icon: Target, label: 'Analyze Lead', type: 'analyze' },
  { icon: Mail, label: 'Write Follow-Up Email', type: 'email', emailType: 'FOLLOWUP' },
  { icon: FileText, label: 'Write Proposal', type: 'email', emailType: 'PROPOSAL' },
  { icon: Sparkles, label: 'Score Lead', type: 'score' },
];

export default function AIAssistant() {
  const { aiDrawerLeadId, closeAiDrawer } = useUiStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [leadId, setLeadId] = useState(aiDrawerLeadId || '');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (aiDrawerLeadId) setLeadId(aiDrawerLeadId);
  }, [aiDrawerLeadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (role, content, meta = {}) => {
    setMessages((prev) => [...prev, { id: Date.now(), role, content, meta, timestamp: new Date() }]);
  };

  const handleQuickAction = async (action) => {
    if (!leadId) {
      toast.error('Please enter a lead ID first');
      return;
    }

    setIsLoading(true);
    addMessage('user', `${action.label} for lead ${leadId.substring(0, 8)}...`);

    try {
      let res;
      if (action.type === 'analyze') {
        res = await api.post('/ai/analyze-lead', { leadId });
        const data = res.data.data;
        addMessage('assistant', null, {
          type: 'analysis',
          probability: data.probability,
          summary: data.summary,
          recommended_action: data.recommended_action,
          urgency: data.urgency,
          risk_factors: data.risk_factors,
          strengths: data.strengths,
        });
      } else if (action.type === 'email') {
        res = await api.post('/ai/generate-email', { leadId, emailType: action.emailType });
        const data = res.data.data;
        addMessage('assistant', null, {
          type: 'email',
          subject: data.subject,
          body: data.body,
        });
      } else if (action.type === 'score') {
        res = await api.post('/ai/score-lead', { leadId });
        const data = res.data.data;
        addMessage('assistant', null, {
          type: 'score',
          score: data.score,
          confidence: data.confidence,
          reasoning: data.reasoning,
          key_factors: data.key_factors,
        });
      }
    } catch (err) {
      addMessage('assistant', `Error: ${err.response?.data?.error || 'Something went wrong'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const renderMessage = (msg) => {
    if (msg.role === 'user') {
      return (
        <div className="flex justify-end mb-4 animate-slide-in">
          <div className="bg-primary/20 border border-primary/30 rounded-xl px-4 py-3 max-w-[80%]">
            <p className="text-sm">{msg.content}</p>
          </div>
        </div>
      );
    }

    const { meta } = msg;

    if (msg.content) {
      return (
        <div className="flex gap-3 mb-4 animate-slide-in">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Bot size={16} className="text-primary" />
          </div>
          <div className="bg-surface-elevated border border-border rounded-xl px-4 py-3 max-w-[85%]">
            <p className="text-sm">{msg.content}</p>
          </div>
        </div>
      );
    }

    if (meta?.type === 'analysis') {
      return (
        <div className="flex gap-3 mb-4 animate-slide-in">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
            <Bot size={16} className="text-primary" />
          </div>
          <div className="bg-surface-elevated border border-border rounded-xl px-4 py-4 flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className={`badge text-xs ${meta.probability === 'HIGH' ? 'badge-success' : meta.probability === 'MEDIUM' ? 'badge-warning' : 'badge-danger'}`}>
                {meta.probability} Probability
              </span>
              <span className={`badge text-xs ${meta.urgency === 'IMMEDIATE' ? 'badge-danger' : meta.urgency === 'THIS_WEEK' ? 'badge-warning' : 'badge-primary'}`}>
                {meta.urgency}
              </span>
            </div>
            <p className="text-sm">{meta.summary}</p>
            <div className="bg-surface-dark rounded-lg p-3">
              <p className="text-xs text-text-secondary mb-1">Recommended Action</p>
              <p className="text-sm font-medium text-primary">{meta.recommended_action}</p>
            </div>
            {meta.strengths?.length > 0 && (
              <div>
                <p className="text-xs text-text-secondary mb-1">Strengths</p>
                {meta.strengths.map((s, i) => <p key={i} className="text-xs text-success flex items-center gap-1">✓ {s}</p>)}
              </div>
            )}
            {meta.risk_factors?.length > 0 && (
              <div>
                <p className="text-xs text-text-secondary mb-1">Risks</p>
                {meta.risk_factors.map((r, i) => <p key={i} className="text-xs text-danger flex items-center gap-1">⚠ {r}</p>)}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (meta?.type === 'email') {
      return (
        <div className="flex gap-3 mb-4 animate-slide-in">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
            <Bot size={16} className="text-primary" />
          </div>
          <div className="bg-surface-elevated border border-border rounded-xl px-4 py-4 flex-1 space-y-3">
            <p className="text-xs text-text-secondary">Subject</p>
            <p className="text-sm font-medium">{meta.subject}</p>
            <hr className="border-border" />
            <p className="text-xs text-text-secondary">Body</p>
            <div className="text-sm whitespace-pre-wrap">{meta.body}</div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => copyToClipboard(`Subject: ${meta.subject}\n\n${meta.body}`)} className="btn-secondary text-xs py-1.5 flex items-center gap-1">
                <Copy size={12} /> Copy
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (meta?.type === 'score') {
      return (
        <div className="flex gap-3 mb-4 animate-slide-in">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
            <Bot size={16} className="text-primary" />
          </div>
          <div className="bg-surface-elevated border border-border rounded-xl px-4 py-4 flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-3xl font-bold text-primary">{meta.score}</span>
              <span className="text-text-secondary text-sm">/ 100</span>
              <span className={`badge text-xs ${meta.confidence === 'HIGH' ? 'badge-success' : meta.confidence === 'MEDIUM' ? 'badge-warning' : 'badge-danger'}`}>
                {meta.confidence}
              </span>
            </div>
            <p className="text-sm">{meta.reasoning}</p>
            {meta.key_factors?.map((f, i) => <p key={i} className="text-xs text-text-secondary flex items-center gap-1">• {f}</p>)}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-surface border-l border-border z-50 flex flex-col animate-slide-in shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Assistant</h3>
            <p className="text-xs text-text-secondary">Powered by NVIDIA Nemotron</p>
          </div>
        </div>
        <button onClick={closeAiDrawer} className="text-text-secondary hover:text-text-primary">
          <X size={18} />
        </button>
      </div>

      {/* Lead ID input */}
      <div className="p-4 border-b border-border">
        <input
          type="text"
          value={leadId}
          onChange={(e) => setLeadId(e.target.value)}
          className="input-field text-xs"
          placeholder="Enter Lead ID..."
        />
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-border grid grid-cols-2 gap-2">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.label}
            onClick={() => handleQuickAction(action)}
            disabled={isLoading}
            className="btn-secondary text-xs py-2 flex items-center gap-1.5 justify-center disabled:opacity-50"
          >
            <action.icon size={12} />
            {action.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="text-center text-text-secondary text-sm mt-8">
            <Bot size={40} className="mx-auto mb-3 text-primary/30" />
            <p>Select a lead and use the quick actions above to get AI insights.</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id}>{renderMessage(msg)}</div>
        ))}
        {isLoading && (
          <div className="flex gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Bot size={16} className="text-primary animate-pulse" />
            </div>
            <div className="bg-surface-elevated border border-border rounded-xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
