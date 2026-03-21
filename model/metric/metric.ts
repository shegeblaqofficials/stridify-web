export interface Metric {
  id: number;
  metric_id: string;
  organization_id: string;
  project_id: string;
  type: string;
  input_token_count: number;
  output_token_count: number;
  created_at: string;
}

export interface MetricInput {
  metric_id: string;
  organization_id: string;
  project_id: string;
  type: string;
  input_token_count: number;
  output_token_count: number;
}
