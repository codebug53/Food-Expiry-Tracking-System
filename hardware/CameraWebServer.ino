#include "esp_camera.h"
#include <WiFi.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ===========================
// Camera config
// ===========================
#include "board_config.h"

// WiFi
const char *ssid = "OPPO A78 5G 2063";
const char *password = "nsbi5568";

// Server URLs (CHANGE IP)
#define TRIGGER_URL "http://192.168.1.5:5000/trigger"
#define UPLOAD_URL  "http://192.168.1.5:5000/upload"

// Buzzer
#define BUZZER_PIN 13

// OLED
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define SDA_PIN 14
#define SCL_PIN 15

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

void startCameraServer();
void setupLedFlash();

// ===========================
// Buzzer
// ===========================
void ringOnce() {
  digitalWrite(BUZZER_PIN, HIGH);
  delay(300);
  digitalWrite(BUZZER_PIN, LOW);
}

void ringTwice() {
  for (int i = 0; i < 2; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(300);
    digitalWrite(BUZZER_PIN, LOW);
    delay(300);
  }
}

// ===========================
// OLED
// ===========================
void showMessage(String msg) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 25);
  display.println(msg);
  display.display();
}

void showSequence() {
  showMessage("MFG Date: 12/03/2024");
  delay(2000);

  showMessage("Expiry: 12/03/2027");
  delay(2000);

  showMessage("Scan Successful");
  delay(2000);
}

// ===========================
// WEBSITE TRIGGER
// ===========================
bool checkTrigger() {
  HTTPClient http;
  http.begin(TRIGGER_URL);

  int code = http.GET();
  if (code > 0) {
    String payload = http.getString();

    StaticJsonDocument<100> doc;
    deserializeJson(doc, payload);

    bool capture = doc["capture"];
    http.end();
    return capture;
  }

  http.end();
  return false;
}

// ===========================
// CAPTURE + SEND + DISPLAY
// ===========================
void captureAndSend() {
  showMessage("Capturing...");
  
  delay(10000);  // wait 10 sec

  camera_fb_t *fb = esp_camera_fb_get();

  if (!fb) {
    showMessage("Capture Failed");
    return;
  }

  HTTPClient http;
  http.begin(UPLOAD_URL);
  http.addHeader("Content-Type", "image/jpeg");

  int response = http.POST(fb->buf, fb->len);

  esp_camera_fb_return(fb);

  if (response > 0) {
    String payload = http.getString();
    Serial.println(payload);

    StaticJsonDocument<200> doc;
    deserializeJson(doc, payload);

    String status = doc["status"];

    if (status == "success") {
      String mfg = doc["mfg"];
      String expiry = doc["expiry"];

      showMessage("Scan Success");
      delay(2000);

      showMessage("MFG: " + mfg);
      delay(2000);

      showMessage("EXP: " + expiry);
      delay(2000);

    } else {
      showMessage("Scan Failed");
      delay(2000);
    }

  } else {
    showMessage("Upload Error");
  }

  http.end();
}

// ===========================
// SETUP
// ===========================
void setup() {
  Serial.begin(115200);
  Serial.setDebugOutput(true);

  // OLED init (stable)
  Wire.begin(SDA_PIN, SCL_PIN, 100000);

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("OLED failed");
  }

  // Buzzer
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  // Camera config (UNCHANGED)
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
  config.frame_size = FRAMESIZE_QVGA;  // smaller for faster upload
  config.pixel_format = PIXFORMAT_JPEG;
  config.fb_location = CAMERA_FB_IN_PSRAM;
  config.jpeg_quality = 12;
  config.fb_count = 1;

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.println("Camera init failed");
    return;
  }

  WiFi.begin(ssid, password);
  WiFi.setSleep(false);

  Serial.print("Connecting WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected");

  startCameraServer();

  Serial.print("Camera Ready: http://");
  Serial.println(WiFi.localIP());
}

// ===========================
// LOOP
// ===========================
void loop() {

  // ORIGINAL SERIAL CONTROL (UNCHANGED)
  if (Serial.available()) {
    char cmd = Serial.read();

    if (cmd == '1') {
      ringOnce();
      showSequence();
    }

    if (cmd == '0') {
      ringTwice();
      showSequence();
    }
  }

  // WEBSITE TRIGGER CHECK
  static unsigned long lastCheck = 0;

  if (millis() - lastCheck > 3000) {
    lastCheck = millis();

    if (checkTrigger()) {
      captureAndSend();
    }
  }

  delay(10);
}