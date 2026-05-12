import {
  Cpu,
  Database,
  Activity,
  Zap,
  MessageSquare,
  Server,
  Cloud,
  Waves,
  Share2,
  Terminal,
  Webhook,
  Bell,
  Mail,
  Workflow,
  Gauge,
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
  'influx': 'influxdb',
  'fluentd': 'fluentd',
  'vector': 'vector',
  'rabbitmq': 'rabbitmq',
  'nats': 'natsdotio',
  'pulsar': 'apachepulsar',
  'mqtt': 'mqtt',
  'lora': 'thethingsnetwork',
  'ttn': 'thethingsnetwork',
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
  'sap': 'sap',
  'power bi': 'powerbi',
  'tableau': 'tableau',
  'looker': 'looker',
  'timescale': 'timescale',
  'questdb': 'questdb',
  'victoria': 'victoriametrics',
  'druid': 'apachedruid',
  'scada': 'inductiveautomation',
  'ignition': 'inductiveautomation',
};

const SPECIAL_LOGOS: Record<string, string> = {
  'tableau': 'https://www.svgrepo.com/show/342280/tableau.svg',
  'power bi': 'https://www.svgrepo.com/show/473761/powerbi.svg',
  'slack': 'https://www.svgrepo.com/show/521850/slack.svg',
  'vector': 'https://www.svgrepo.com/show/354510/vector-timber.svg',
  'questdb': 'https://questdb.com/img/questdb-logo-themed.svg',
};

const getBrandIcon = (label: string, size: number = 18) => {
  const l = label.toLowerCase();

  // 1. Try Special Mappings (Direct URLs)
  const specialKey = Object.keys(SPECIAL_LOGOS).find(key => l.includes(key));
  if (specialKey) {
    return (
      <img
        src={SPECIAL_LOGOS[specialKey]}
        alt={label}
        style={{ width: size, height: size }}
        className="brand-logo group-hover:scale-110 transition-transform duration-300"
      />
    );
  }

  // 2. Try SimpleIcons (Slugs)
  const brandKey = Object.keys(BRAND_LOGOS).find(key => l.includes(key));
  if (brandKey) {
    const slug = BRAND_LOGOS[brandKey];
    return (
      <img
        src={`https://unpkg.com/simple-icons@latest/icons/${slug}.svg`}
        alt={label}
        style={{ 
          width: size, 
          height: size,
          filter: 'brightness(0.8) grayscale(0.2)',
        }}
        className="brand-logo group-hover:scale-110 group-hover:filter-none transition-all duration-300"

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
  if (l.includes('lora')) return <Waves size={18} />;
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
  if (l.includes('erp')) return <Box size={18} />;

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
