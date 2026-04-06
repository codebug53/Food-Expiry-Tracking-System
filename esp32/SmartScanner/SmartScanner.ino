#include "esp_camera.h"
#include <WiFi.h>
#include <HTTPClient.h>

// ===========================
// CONFIGURATION
// ===========================
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Server endpoint (Change 192.168.1.XXX to your backend IP)
const char* serverName = "http://10.170.104.63:8000/api/esp32-scan";

// Hardware Pins
#define BUTTON_PIN    13  // Push button connected to GND
#define BUZZER_PIN    12  // Active buzzer

// Camera model: AI THINKER
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27

#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

void setup() {
  Serial.begin(115200);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  // Initialize Camera
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  
  // UXGA, SVGA, VGA, CIF, QVGA
  config.frame_size = FRAMESIZE_VGA;
  config.jpeg_quality = 12;
  config.fb_count = 1;

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    return;
  }
  
  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected.");
  
  // Ready Beep
  beep(100, 1);
}

void loop() {
  // Check if the button is pressed (LOW when pressed due to INPUT_PULLUP)
  if (digitalRead(BUTTON_PIN) == LOW) {
    // Basic debounce
    delay(50);
    if (digitalRead(BUTTON_PIN) == LOW) {
      Serial.println("Button pressed! Taking picture...");
      
      beep(50, 1); // Short acknowledgment beep

      // Delay to allow user to move hand away from the camera lens
      delay(1000); 
      
      // Capture Image
      camera_fb_t * fb = esp_camera_fb_get();
      if (!fb) {
        Serial.println("Camera capture failed");
        beep(50, 4); // Error beep
        return;
      }

      // Send Image to Server
      sendImageToServer(fb->buf, fb->len);

      // Return the frame buffer back to the driver for reuse
      esp_camera_fb_return(fb);

      // Wait until the button is released to avoid scanning multiple times
      while(digitalRead(BUTTON_PIN) == LOW) {
        delay(10);
      }
      Serial.println("Ready for next scan.");
    }
  }
}

void sendImageToServer(uint8_t *image_data, size_t image_length) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected");
    beep(50, 4);
    return;
  }

  String boundary = "Esp32MultipartBoundary";
  String head = "--" + boundary + "\r\n";
  head += "Content-Disposition: form-data; name=\"file\"; filename=\"scan.jpg\"\r\n";
  head += "Content-Type: image/jpeg\r\n\r\n";
  String tail = "\r\n--" + boundary + "--\r\n";
  size_t totalLen = head.length() + image_length + tail.length();

  // We use a raw WiFiClient to stream the large JPEG chunks instead of the memory-heavy HTTPClient
  WiFiClient client;
  if (!client.connect("10.170.104.63", 8000)) {
    Serial.println("Connection failed!");
    beep(50, 4);
    return;
  }

  client.println("POST /api/esp32-scan HTTP/1.1");
  client.println("Host: 10.170.104.63:8000");
  client.println("Content-Length: " + String(totalLen));
  client.println("Content-Type: multipart/form-data; boundary=" + boundary);
  client.println();
  
  client.print(head);
  client.write(image_data, image_length);
  client.print(tail);

  // Read Response
  String response = "";
  unsigned long timeout = millis();
  while (client.connected() && millis() - timeout < 10000) {
    if (client.available()) {
      char c = client.read();
      response += c;
    }
  }
  
  Serial.println("Server Response:");
  Serial.println(response);

  // Parse Verdict
  if (response.indexOf("VERDICT: SAFE") != -1) {
    beep(100, 1); // 1 short beep
  } else if (response.indexOf("VERDICT: CONSUME SOON") != -1) {
    beep(200, 2); // 2 medium beeps
  } else if (response.indexOf("VERDICT: RISKY") != -1) {
    beep(200, 2); // 2 medium beeps
  } else if (response.indexOf("VERDICT: EXPIRED") != -1) {
    beep(800, 3); // 3 long beeps
  } else {
    beep(50, 4);  // Unknown/Error
  }
}

void beep(int duration, int count) {
  for (int i = 0; i < count; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(duration);
    digitalWrite(BUZZER_PIN, LOW);
    delay(100);
  }
}
