import React from 'react';
import { 
  Cpu, 
  Database, 
  Activity, 
  Zap, 
  MessageSquare, 
  Layers, 
  Server, 
  HardDrive, 
  Cloud, 
  Waves, 
  Share2, 
  Terminal, 
  Webhook, 
  FileJson, 
  Table, 
  BarChart3, 
  Search, 
  Bell, 
  Mail,
  Workflow,
  Compass,
  Gauge,
  Microscope,
  Box,
  Monitor,
  MonitorSmartphone,
  Smartphone,
  Globe,
  CloudCog
} from 'lucide-react';

export const getNodeIcon = (label: string) => {
  const l = label.toLowerCase();
  
  // Edge / Sources
  if (l.includes('sensor')) return <Activity size={18} />;
  if (l.includes('plc')) return <Cpu size={18} />;
  if (l.includes('gateway')) return <Zap size={18} />;
  if (l.includes('mqtt')) return <MessageSquare size={18} />;
  if (l.includes('opc')) return <Server size={18} />;
  if (l.includes('webhook')) return <Webhook size={18} />;
  if (l.includes('http')) return <Share2 size={18} />;

  // Applications & Clients
  if (l.includes('web app')) return <MonitorSmartphone size={18} />;
  if (l.includes('mobile app')) return <Smartphone size={18} />;
  if (l.includes('microservice')) return <Server size={18} />;
  if (l.includes('api')) return <Globe size={18} />;

  // Agents & Collectors
  if (l.includes('telegraf')) return <Compass size={18} />;
  if (l.includes('fluentd')) return <Box size={18} />;
  if (l.includes('vector')) return <Zap size={18} />;
  if (l.includes('agent')) return <CloudCog size={18} />;

  // Transport / Streaming
  if (l.includes('kafka')) return <Waves size={18} />;
  if (l.includes('pulsar')) return <Waves size={18} />;
  if (l.includes('broker')) return <Share2 size={18} />;
  if (l.includes('rabbitmq')) return <Share2 size={18} />;
  if (l.includes('nats')) return <Share2 size={18} />;
  if (l.includes('pub/sub')) return <Cloud size={18} />;
  if (l.includes('stream')) return <Waves size={18} />;

  // Processing
  if (l.includes('spark')) return <Layers size={18} />;
  if (l.includes('flink')) return <Layers size={18} />;
  if (l.includes('lambda')) return <Terminal size={18} />;
  if (l.includes('function')) return <Terminal size={18} />;
  if (l.includes('script')) return <Terminal size={18} />;

  // Storage
  if (l.includes('influx')) return <Gauge size={18} />;
  if (l.includes('prometheus')) return <Gauge size={18} />;
  if (l.includes('postgres')) return <Database size={18} />;
  if (l.includes('cassandra')) return <HardDrive size={18} />;
  if (l.includes('redis')) return <Zap size={18} />;
  if (l.includes('mongo')) return <FileJson size={18} />;
  if (l.includes('clickhouse')) return <Table size={18} />;
  if (l.includes('snowflake')) return <Microscope size={18} />;
  if (l.includes('bigquery')) return <Microscope size={18} />;
  if (l.includes('data lake')) return <Cloud size={18} />;
  if (l.includes('db')) return <Database size={18} />;

  // Sinks / Visuals
  if (l.includes('grafana')) return <Monitor size={18} />;
  if (l.includes('dashboard')) return <Monitor size={18} />;
  if (l.includes('elastic')) return <Search size={18} />;
  if (l.includes('slack')) return <MessageSquare size={18} />;
  if (l.includes('mail')) return <Mail size={18} />;
  if (l.includes('alert')) return <Bell size={18} />;

  return <Workflow size={18} />;
};
