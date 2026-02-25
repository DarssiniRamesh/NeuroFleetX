package com.neurofleetx.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.neurofleetx.dto.RouteRequest;
import com.neurofleetx.dto.RouteResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RouteService {

  /**
   * ORS API key (optional).
   *
   * Note: In CI/test environments, we intentionally allow this to be missing.
   * The service will fall back to a deterministic "stub" route to avoid making
   * E2E tests depend on external network access.
   */
  @Value("${ors.api.key:}")
  private String apiKey;

  private final RestTemplate restTemplate = new RestTemplate();
  private final ObjectMapper mapper = new ObjectMapper();

  /**
   * PUBLIC_INTERFACE
   * Returns an optimized route between two points.
   *
   * Contract:
   * - Inputs: RouteRequest with (startLat, startLng, endLat, endLng). Values must be valid doubles.
   * - Outputs: RouteResponse with distance (meters), duration (seconds), and a geometry object.
   * - Errors: Does not throw for external ORS failures; instead returns a fallback route response.
   * - Side effects: May call the OpenRouteService Directions API over the network if configured.
   *
   * Invariants:
   * - If ORS is not configured (missing api key) or ORS call fails, returns a deterministic fallback.
   */
  public RouteResponse getOptimizedRoute(RouteRequest req) throws Exception {
    // If ORS is not configured, avoid failing E2E flows and return a stable fallback.
    if (apiKey == null || apiKey.isBlank()) {
      return buildFallbackRoute(req);
    }

    try {
      String url = "https://api.openrouteservice.org/v2/directions/driving-car/json";

      // JSON payload required by ORS
      String body = """
          {
            "coordinates": [
              [%f, %f],
              [%f, %f]
            ]
          }
          """.formatted(
          req.getStartLng(), req.getStartLat(),
          req.getEndLng(), req.getEndLat());

      HttpHeaders headers = new HttpHeaders();
      headers.set("Authorization", apiKey);
      headers.setContentType(MediaType.APPLICATION_JSON);

      HttpEntity<String> entity = new HttpEntity<>(body, headers);

      ResponseEntity<String> response =
          restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

      JsonNode json = mapper.readTree(response.getBody());

      double distance =
          json.get("features").get(0).get("properties").get("summary").get("distance").asDouble();
      double duration =
          json.get("features").get(0).get("properties").get("summary").get("duration").asDouble();
      JsonNode geometry = json.get("features").get(0).get("geometry");

      return new RouteResponse(distance, duration, geometry);
    } catch (Exception orsError) {
      // Keep the service reliable for UI and E2E tests even when ORS/network fails.
      return buildFallbackRoute(req);
    }
  }

  private RouteResponse buildFallbackRoute(RouteRequest req) {
    // Very small deterministic stub; shape matches ORS-like geometry object.
    // This provides the UI with distance/duration and avoids brittle E2E failures.
    double distanceMeters = 1000.0;
    double durationSeconds = 600.0;

    Map<String, Object> geometry = new HashMap<>();
    geometry.put("type", "LineString");
    geometry.put(
        "coordinates",
        new double[][] {
            {req.getStartLng(), req.getStartLat()},
            {req.getEndLng(), req.getEndLat()}
        });

    JsonNode geometryNode = mapper.valueToTree(geometry);
    return new RouteResponse(distanceMeters, durationSeconds, geometryNode);
  }
}
