import { formatDisplayDate } from '../domain/dates'
import { WORKFLOW_RULES } from '../domain/workflow'
import type { WorkflowDates } from '../domain/types'

export function WorkflowPanel({ dates }: { dates: WorkflowDates }) {
  return (
    <div className="panel workflow-strip-panel">
      <div className="panel-header">
        <h2>Workflow</h2>
      </div>
      <ul className="workflow-strip">
        {WORKFLOW_RULES.map((rule) => {
          const value = dates[rule.id]
          const pending = rule.status === 'requires_confirmation'
          return (
            <li key={rule.id}>
              <span className="workflow-label">{rule.label}</span>
              <strong>{value ? formatDisplayDate(value) : ''}</strong>
              <span className="small">
                {pending ? 'RULE REQUIRES CONFIRMATION' : value ? 'Confirmed rule' : 'Not applicable'}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
