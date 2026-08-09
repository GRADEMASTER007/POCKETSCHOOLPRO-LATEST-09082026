# 16 - API Endpoints Documentation

## Server REST API Reference

### 1. AI STEM Problem Solver
- **Endpoint**: `POST /api/ai/solve`
- **Request Body**:
  ```json
  {
    "query": "Solve x^2 - 4x + 3 = 0",
    "subjectKey": "mathematics",
    "curriculumId": "caps",
    "gradeYear": "grade_12"
  }
  ```
- **Response**:
  ```json
  {
    "steps": [ ... ],
    "evaluationFormula": "x = 1 \\text{ or } x = 3",
    "finalAnswer": "The roots of the equation are x = 1 and x = 3."
  }
  ```

### 2. Vision AI OCR Scanner
- **Endpoint**: `POST /api/ai/ocr`
- **Request Body**:
  ```json
  {
    "imageBase64": "data:image/jpeg;base64,...",
    "subjectKey": "physical_sciences"
  }
  ```
- **Response**:
  ```json
  {
    "extractedText": "F = ma",
    "explanation": "Calculates force given mass m = 2kg and acceleration a = 3m/s^2",
    "solutionSteps": [ ... ]
  }
  ```

### 3. User Quota Status
- **Endpoint**: `GET /api/quota`
- **Headers**: `Authorization: Bearer <idToken>`
- **Response**:
  ```json
  {
    "tier": "gold_199",
    "monthlyTokens": 2500000,
    "tokensUsed": 125000,
    "remainingTokens": 2375000,
    "dailyAiLimit": 300,
    "dailyAiUsed": 12
  }
  ```

### 4. Yoco Payment Session
- **Endpoint**: `POST /api/checkout/yoco`
- **Request Body**:
  ```json
  {
    "planId": "gold_199",
    "amountZar": 199,
    "token": "tok_yoco_test_..."
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "transactionId": "txn_89213712",
    "tier": "gold_199"
  }
  ```
