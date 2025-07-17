import React, { useEffect, useState } from 'react';
import './ActivityPanel.css'
import { activityAPI } from '../../api/activity';

export interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  username: string;
  details: any;
  timestamp: Date;
}


const ActivityPanel: React.FC = () => {
  // @ts-ignore
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    activityAPI.getActivities().then(res => {
      console.log(res.data)
    })
  }, [logs])

  console.log({ logs })

  const formatAction = (log: ActivityLog) => {
    switch (log.action) {
      case 'CREATE':
        return `created ${log.entityType.toLowerCase()} "${log.details?.title}"`;
      case 'UPDATE':
        return `updated ${log.entityType.toLowerCase()} "${log.details?.title}"`;
      case 'DELETE':
        return `deleted ${log.entityType.toLowerCase()} "${log.details?.title}"`;
      case 'ASSIGN':
        return `assigned task to ${log.details?.assignee}`;
      case 'MOVE':
        return `moved task from "${log.details?.from}" to "${log.details?.to}"`;
      default:
        return `performed ${log.action} action`;
    }
  };

  return (
    <div className="activity-panel">
      <h3 className="panel-title">Recent Activity</h3>
      <div className="activity-list">
        {logs.length === 0 ? (
          <p>No activity yet</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="activity-item">
              <div className="activity-header">
                <span className="user-name">
                  {log.username}
                </span>
                <span className="timestamp">
                  {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="activity-description">
                {formatAction(log)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityPanel;