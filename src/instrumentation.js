// Optional OpenTelemetry tracing. Set OTEL_EXPORTER_OTLP_ENDPOINT to enable export.
// Must be loaded before Express and database modules for automatic instrumentation.
if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
  const { NodeSDK } = require('@opentelemetry/sdk-node');
  const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
  const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
  const sdk = new NodeSDK({ traceExporter: new OTLPTraceExporter({ url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT }), instrumentations: [getNodeAutoInstrumentations({ '@opentelemetry/instrumentation-fs': { enabled: false } })] });
  sdk.start();
  const shutdown = () => sdk.shutdown().catch(err => console.error('OpenTelemetry shutdown failed', err));
  process.once('SIGTERM', shutdown); process.once('SIGINT', shutdown);
}
