// Author: Ajar | Module: Pages | CRM Platform v1.0
import KanbanBoard from '../components/pipeline/KanbanBoard.jsx';
export default function Pipeline() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Sales Pipeline</h1>
      <KanbanBoard />
    </div>
  );
}
