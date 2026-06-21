<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware untuk mengumpulkan metrik HTTP dalam format Prometheus.
 * Data disimpan di file (karena Modulith tidak pakai Redis).
 */
class PrometheusMetrics
{
    private string $metricsDir;

    public function __construct()
    {
        $this->metricsDir = storage_path('prometheus');
        if (!is_dir($this->metricsDir)) {
            mkdir($this->metricsDir, 0755, true);
        }
    }

    public function handle(Request $request, Closure $next): Response
    {
        $startTime = microtime(true);

        /** @var Response $response */
        $response = $next($request);

        $duration = microtime(true) - $startTime;
        $method   = $request->method();
        $route    = $request->route()?->uri() ?? $request->path();
        $status   = $response->getStatusCode();

        try {
            $dataFile = $this->metricsDir . '/metrics.json';

            // Gunakan file lock untuk thread safety
            $fp = fopen($dataFile, 'c+');
            if (flock($fp, LOCK_EX)) {
                $content = stream_get_contents($fp);
                $data = $content ? json_decode($content, true) : [];

                // Counter: total requests
                $counterKey = "{$method}:{$route}:{$status}";
                $data['counters'][$counterKey] = ($data['counters'][$counterKey] ?? 0) + 1;

                // Histogram buckets
                $buckets = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];
                foreach ($buckets as $bucket) {
                    if ($duration <= $bucket) {
                        $bucketKey = "{$route}:{$bucket}";
                        $data['buckets'][$bucketKey] = ($data['buckets'][$bucketKey] ?? 0) + 1;
                    }
                }
                $infKey = "{$route}:+Inf";
                $data['buckets'][$infKey] = ($data['buckets'][$infKey] ?? 0) + 1;

                // Sum & Count
                $data['duration_sum'][$route] = ($data['duration_sum'][$route] ?? 0) + $duration;
                $data['duration_count'][$route] = ($data['duration_count'][$route] ?? 0) + 1;

                ftruncate($fp, 0);
                rewind($fp);
                fwrite($fp, json_encode($data));
                flock($fp, LOCK_UN);
            }
            fclose($fp);

        } catch (\Exception $e) {
            \Log::warning('PrometheusMetrics: File error - ' . $e->getMessage());
        }

        return $response;
    }
}
