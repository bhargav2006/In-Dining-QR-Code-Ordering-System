package com.qr_restaurant.qr_restaurant_backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class HealthCheckController {

    private final JdbcTemplate jdbcTemplate;

    @GetMapping(value = {"/", "/health", "/api/health"}, produces = {MediaType.TEXT_HTML_VALUE, MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<?> checkHealth(@RequestHeader(value = HttpHeaders.ACCEPT, required = false) String acceptHeader) {
        boolean isHtmlRequest = acceptHeader != null && acceptHeader.contains("text/html");

        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "QR Restaurant Backend API");
        health.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

        String dbStatus = "CONNECTED 🟢";
        String dbEngine = "MySQL (Aiven Cloud)";
        boolean isConnected = true;

        try {
            jdbcTemplate.execute("SELECT 1");
            health.put("database", "CONNECTED");
        } catch (Exception e) {
            dbStatus = "DISCONNECTED 🔴 (" + e.getMessage() + ")";
            health.put("database", "DISCONNECTED: " + e.getMessage());
            health.put("status", "DOWN");
            isConnected = false;
        }

        if (isHtmlRequest) {
            String html = getHtmlDashboard(dbStatus, dbEngine, (String) health.get("timestamp"), isConnected);
            return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(html);
        }

        return isConnected ? ResponseEntity.ok(health) : ResponseEntity.status(503).body(health);
    }

    private String getHtmlDashboard(String dbStatus, String dbEngine, String timestamp, boolean isConnected) {
        String badgeColor = isConnected ? "#10b981" : "#ef4444";
        String badgeText = isConnected ? "Yeah, Backend API is Working!" : "System Alert: Database Disconnected";

        return "<!DOCTYPE html>\n" +
                "<html lang=\"en\">\n" +
                "<head>\n" +
                "  <meta charset=\"UTF-8\">\n" +
                "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
                "  <title>QR In-Dining Backend • Health Gateway</title>\n" +
                "  <link href=\"https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap\" rel=\"stylesheet\">\n" +
                "  <style>\n" +
                "    :root { --bg: #0f172a; --card: rgba(30, 41, 59, 0.75); --border: rgba(255, 255, 255, 0.12); --emerald: #10b981; --sky: #38bdf8; --amber: #f59e0b; --text: #f8fafc; --muted: #94a3b8; }\n" +
                "    * { box-sizing: border-box; margin: 0; padding: 0; }\n" +
                "    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: var(--bg); color: var(--text); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem 1rem; background-image: radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(56, 189, 248, 0.15) 0px, transparent 50%); }\n" +
                "    .dashboard { max-width: 800px; width: 100%; background: var(--card); backdrop-filter: blur(20px); border: 1px solid var(--border); border-radius: 24px; padding: 2.5rem; box-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(16, 185, 129, 0.1); }\n" +
                "    .header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border); }\n" +
                "    .title-area h1 { font-size: 1.6rem; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 0.6rem; }\n" +
                "    .title-area p { font-size: 0.85rem; color: var(--muted); margin-top: 0.3rem; }\n" +
                "    .status-badge { background: " + (isConnected ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)") + "; border: 1px solid " + badgeColor + "; color: " + (isConnected ? "#34d399" : "#f87171") + "; padding: 0.6rem 1.2rem; border-radius: 9999px; font-weight: 800; font-size: 0.9rem; display: flex; align-items: center; gap: 0.6rem; boxShadow: 0 0 20px " + badgeColor + "; }\n" +
                "    .status-pulse { width: 10px; height: 10px; border-radius: 50%; background: " + badgeColor + "; box-shadow: 0 0 10px " + badgeColor + "; animation: pulse 2s infinite; }\n" +
                "    @keyframes pulse { 0% { transform: scale(0.95); opacity: 0.8; } 50% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(0.95); opacity: 0.8; } }\n" +
                "    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.2rem; margin-bottom: 2rem; }\n" +
                "    .card { background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border); padding: 1.2rem; border-radius: 16px; }\n" +
                "    .card-label { font-size: 0.75rem; color: var(--muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem; }\n" +
                "    .card-value { font-size: 1.1rem; font-weight: 800; color: #fff; }\n" +
                "    .endpoints-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem; color: var(--sky); }\n" +
                "    .endpoints-list { display: flex; flex-direction: column; gap: 0.6rem; }\n" +
                "    .endpoint-item { display: flex; align-items: center; justify-content: space-between; background: rgba(15, 23, 42, 0.4); padding: 0.75rem 1rem; border-radius: 12px; border: 1px solid var(--border); font-size: 0.85rem; }\n" +
                "    .method-get { background: rgba(56, 189, 248, 0.2); color: #38bdf8; font-weight: 800; padding: 0.2rem 0.6rem; border-radius: 6px; }\n" +
                "    .btn-test { background: linear-gradient(135deg, #10b981 0%, #047857 100%); color: #fff; border: none; padding: 0.4rem 0.9rem; border-radius: 8px; font-weight: 700; cursor: pointer; text-decoration: none; font-size: 0.8rem; }\n" +
                "  </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "  <div class=\"dashboard\">\n" +
                "    <div class=\"header\">\n" +
                "      <div class=\"title-area\">\n" +
                "        <h1>🍽️ QR In-Dining System</h1>\n" +
                "        <p>Spring Boot REST API Gateway • Live Status Monitor</p>\n" +
                "      </div>\n" +
                "      <div class=\"status-badge\">\n" +
                "        <span class=\"status-pulse\"></span>\n" +
                "        " + badgeText + "\n" +
                "      </div>\n" +
                "    </div>\n" +
                "\n" +
                "    <div class=\"grid\">\n" +
                "      <div class=\"card\">\n" +
                "        <div class=\"card-label\">Database Connection</div>\n" +
                "        <div class=\"card-value\" style=\"color: " + (isConnected ? "#34d399" : "#f87171") + ";\">" + dbStatus + "</div>\n" +
                "      </div>\n" +
                "      <div class=\"card\">\n" +
                "        <div class=\"card-label\">Database Engine</div>\n" +
                "        <div class=\"card-value\">" + dbEngine + "</div>\n" +
                "      </div>\n" +
                "      <div class=\"card\">\n" +
                "        <div class=\"card-label\">Server Timestamp</div>\n" +
                "        <div class=\"card-value\" style=\"font-size: 0.95rem;\">" + timestamp + "</div>\n" +
                "      </div>\n" +
                "    </div>\n" +
                "\n" +
                "    <div class=\"endpoints-title\">🚀 Registered API Service Endpoints</div>\n" +
                "    <div class=\"endpoints-list\">\n" +
                "      <div class=\"endpoint-item\">\n" +
                "        <div><span class=\"method-get\">GET</span> <strong style=\"color: #fff;\">/api/health</strong> - System Diagnostics</div>\n" +
                "        <a href=\"/api/health\" target=\"_blank\" class=\"btn-test\">Test Endpoint</a>\n" +
                "      </div>\n" +
                "      <div class=\"endpoint-item\">\n" +
                "        <div><span class=\"method-get\">GET</span> <strong style=\"color: #fff;\">/api/customer/categories</strong> - Menu Categories</div>\n" +
                "        <a href=\"/api/customer/categories\" target=\"_blank\" class=\"btn-test\">Test Endpoint</a>\n" +
                "      </div>\n" +
                "      <div class=\"endpoint-item\">\n" +
                "        <div><span class=\"method-get\">GET</span> <strong style=\"color: #fff;\">/api/customer/dishes</strong> - Menu Dishes</div>\n" +
                "        <a href=\"/api/customer/dishes\" target=\"_blank\" class=\"btn-test\">Test Endpoint</a>\n" +
                "      </div>\n" +
                "      <div class=\"endpoint-item\">\n" +
                "        <div><span class=\"method-get\">GET</span> <strong style=\"color: #fff;\">/api/waiter/tables</strong> - Waiter Table Status</div>\n" +
                "        <a href=\"/api/waiter/tables\" target=\"_blank\" class=\"btn-test\">Test Endpoint</a>\n" +
                "      </div>\n" +
                "    </div>\n" +
                "  </div>\n" +
                "</body>\n" +
                "</html>";
    }
}
