<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

/**
 * Controller untuk menyajikan metrik aplikasi dalam format Prometheus.
 * Endpoint ini di-scrape oleh Prometheus setiap 5 detik.
 * Versi file-based (Modulith tidak pakai Redis).
 */
class MetricsController extends Controller
{
    public function index(): \Illuminate\Http\Response
    {
        $output = '';
        $dataFile = storage_path('prometheus/metrics.json');

        try {
            if (!file_exists($dataFile)) {
                return response("# No metrics data yet\n", 200, [
                    'Content-Type' => 'text/plain; version=0.0.4; charset=utf-8',
                ]);
            }

            $data = json_decode(file_get_contents($dataFile), true) ?? [];

            // ─── HTTP Request Total Counter ──────────────────
            $output .= "# HELP http_requests_total Total number of HTTP requests\n";
            $output .= "# TYPE http_requests_total counter\n";

            foreach (($data['counters'] ?? []) as $key => $value) {
                // Format: {method}:{route}:{status}
                $parts = explode(':', $key);
                if (count($parts) >= 3) {
                    $method = $parts[0];
                    $route  = $parts[1];
                    $status = $parts[2];
                    $output .= "http_requests_total{method=\"{$method}\",route=\"{$route}\",status_code=\"{$status}\"} {$value}\n";
                }
            }

            // ─── HTTP Request Duration Histogram ─────────────
            $output .= "\n# HELP http_request_duration_seconds HTTP request duration in seconds\n";
            $output .= "# TYPE http_request_duration_seconds histogram\n";

            foreach (($data['duration_sum'] ?? []) as $route => $sum) {
                $count = $data['duration_count'][$route] ?? 0;

                // Buckets
                $buckets = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];
                foreach ($buckets as $bucket) {
                    $bucketVal = $data['buckets']["{$route}:{$bucket}"] ?? 0;
                    $output .= "http_request_duration_seconds_bucket{route=\"{$route}\",le=\"{$bucket}\"} {$bucketVal}\n";
                }
                $infVal = $data['buckets']["{$route}:+Inf"] ?? 0;
                $output .= "http_request_duration_seconds_bucket{route=\"{$route}\",le=\"+Inf\"} {$infVal}\n";
                $output .= "http_request_duration_seconds_sum{route=\"{$route}\"} {$sum}\n";
                $output .= "http_request_duration_seconds_count{route=\"{$route}\"} {$count}\n";
            }

        } catch (\Exception $e) {
            $output = "# Error collecting metrics: " . $e->getMessage() . "\n";
        }

        return response($output, 200, [
            'Content-Type' => 'text/plain; version=0.0.4; charset=utf-8',
        ]);
    }
}
