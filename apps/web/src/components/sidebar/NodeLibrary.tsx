import React from 'react';
import { PipelineList } from './PipelineList';
import { getNodeIcon } from '../../utils/nodeIcons';

const NODE_TYPES = [
  { 
    category: 'Edge & Sources', 
    types: ['Factory Floor Sensor', 'Edge Gateway', 'PLC Controller', 'MQTT Client', 'OPC-UA Server', 'HTTP Webhook'] 
  },
  { 
    category: 'Applications & Clients', 
    types: ['Web Application', 'Mobile App', 'Custom Microservice', 'External API'] 
  },
  { 
    category: 'Agents & Collectors', 
    types: ['Telegraf', 'Fluentd', 'Vector', 'Prometheus Agent'] 
  },
  { 
    category: 'Transport & Stream', 
    types: ['Kafka Cluster', 'RabbitMQ', 'NATS JetStream', 'Cloud Pub/Sub', 'Apache Pulsar', 'Stream Processor'] 
  },
  { 
    category: 'Processing', 
    types: ['Spark Job', 'Flink Application', 'Python Script', 'Lambda Function'] 
  },
  { 
    category: 'Time-Series & Metrics', 
    types: ['InfluxDB', 'Prometheus', 'Time-Series DB', 'Redis Cache'] 
  },
  { 
    category: 'Databases & Storage', 
    types: ['PostgreSQL', 'MySQL', 'Cassandra', 'MongoDB', 'Data Lake'] 
  },
  { 
    category: 'Analytics & Big Data', 
    types: ['ClickHouse', 'Snowflake', 'BigQuery', 'Elasticsearch'] 
  },
  { 
    category: 'Sinks & Alerts', 
    types: ['Grafana Dashboard', 'Slack Webhook', 'Email Alert', 'High-Speed Sink'] 
  },
];

export const NodeLibrary: React.FC = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string, category: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/category', category);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-72 bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] flex flex-col transition-colors duration-300">
      <div className="p-6 border-b border-[var(--color-border)]">
        <h2 className="text-2xl font-bold text-industrial-gold tracking-tight">Node Library</h2>
        <p className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-[0.2em] mt-1 font-semibold">Architectural Components</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-thin scrollbar-thumb-[var(--color-border)]">
        {NODE_TYPES.map((cat) => (
          <div key={cat.category} className="space-y-3">
            <h3 className="text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-secondary)] font-black flex items-center gap-2">
              <span className="w-1 h-1 bg-tech-accent rounded-full"></span>
              {cat.category}
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {cat.types.map((type) => (
                <div
                  key={type}
                  className="group relative bg-[var(--color-bg-primary)]/40 border border-[var(--color-border)] p-3 rounded-lg cursor-grab hover:border-tech-accent/50 hover:bg-[var(--color-bg-primary)] transition-all duration-200 flex items-center gap-3 overflow-hidden"
                  onDragStart={(event) => onDragStart(event, type, cat.category)}
                  draggable
                >
                  <div className="text-[var(--color-text-secondary)] group-hover:text-tech-accent transition-colors">
                    {getNodeIcon(type)}
                  </div>
                  <span className="text-[13px] font-medium text-[var(--color-text-primary)] group-hover:translate-x-0.5 transition-transform">
                    {type}
                  </span>
                  
                  {/* Subtle accent line on hover */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-tech-accent scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-primary)]/20">
        <PipelineList />
      </div>
    </div>
  );
};
