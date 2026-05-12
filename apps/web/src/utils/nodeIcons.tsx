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
  CloudCog,
  Shield,
  Lock,
  History,
  Copy,
  Layout,
  Network
} from 'lucide-react';

const BRAND_LOGOS: Record<string, string> = {
  'kafka': 'apachekafka',
  'influx': 'influxdb',
  'prometheus': 'prometheus',
  'postgres': 'postgresql',
  'mysql': 'mysql',
  'cassandra': 'apachecassandra',
  'redis': 'redis',
  'mongo': 'mongodb',
  'clickhouse': 'clickhouse',
  'snowflake': 'snowflake',
  'bigquery': 'googlebigquery',
  'elasticsearch': 'elasticsearch',
  'slack': 'slack',
  'grafana': 'grafana',
  'telegraf': 'influxdb',
  'fluentd': 'fluentd',
  'vector': 'vector',
  'rabbitmq': 'rabbitmq',
  'nats': 'nats',
  'pulsar': 'apachepulsar',
  'spark': 'apachespark',
  'flink': 'apacheflink',
  'lambda': 'awslambda',
  'pub/sub': 'googlecloud',
  'google': 'googlecloud',
  'aws': 'amazonaws',
  'azure': 'microsoftazure',
  'python': 'python',
  'nodejs': 'nodedotjs',
  'react': 'react',
  'scada': 'inductiveautomation',
  'ignition': 'inductiveautomation',
  'sap': 'sap',
  'lora': 'lorawan',
  'power bi': 'powerbi',
  'tableau': 'tableau',
  'looker': 'looker',
  'timescale': 'timescaledb',
  'questdb': 'questdb',
  'victoria': 'victoriametrics',
  'druid': 'apachedruid',
};

const getBrandIcon = (label: string, size: number = 18) => {
  const l = label.toLowerCase();
  const brandKey = Object.keys(BRAND_LOGOS).find(key => l.includes(key));
  
  if (brandKey) {
    const slug = BRAND_LOGOS[brandKey];
    // We use a CSS filter to make the icons match our industrial theme (slightly dimmed/grayish until hover)
    return (
      <img 
        src={`https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/${slug}.svg`} 
        alt={label}
        style={{ 
          width: size, 
          height: size, 
        }}
        className="brand-logo group-hover:scale-110 transition-transform duration-300"
      />
    );
  }
  return null;
};

export const getNodeIcon = (label: string) => {
  const l = label.toLowerCase();
  
  // Try to get a brand logo first
  const brandIcon = getBrandIcon(label);
  if (brandIcon) return brandIcon;

  // Fallback to Lucide for generic components
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
  if (l.includes('agent')) return <CloudCog size={18} />;

  // Processing & Streams
  if (l.includes('stream')) return <Waves size={18} />;
  if (l.includes('script')) return <Terminal size={18} />;
  if (l.includes('function')) return <Terminal size={18} />;

  // Storage
  if (l.includes('data lake')) return <Cloud size={18} />;
  if (l.includes('db')) return <Database size={18} />;
  if (l.includes('kdb')) return <Gauge size={18} />;

  // Industrial Systems (SCADA/MES)
  if (l.includes('scada')) return <Layout size={18} />;
  if (l.includes('hmi')) return <Monitor size={18} />;
  if (l.includes('historian')) return <History size={18} />;
  if (l.includes('mes')) return <Workflow size={18} />;
  if (l.includes('erp')) return <Share2 size={18} />;

  // Connectivity & Security
  if (l.includes('firewall')) return <Shield size={18} />;
  if (l.includes('vpn')) return <Lock size={18} />;
  if (l.includes('metro')) return <Network size={18} />;
  if (l.includes('twin')) return <Copy size={18} />;
  if (l.includes('management')) return <CloudCog size={18} />;

  // Sinks / Visuals
  if (l.includes('dashboard')) return <Monitor size={18} />;
  if (l.includes('mail')) return <Mail size={18} />;
  if (l.includes('alert')) return <Bell size={18} />;

  return <Workflow size={18} />;
};
