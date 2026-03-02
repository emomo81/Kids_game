export default {
  "name": "DailyChallenge",
  "type": "object",
  "properties": {
    "challenge_date": {
      "type": "string",
      "format": "date",
      "description": "Date of the daily challenge (YYYY-MM-DD)"
    },
    "completed": {
      "type": "boolean",
      "default": false
    },
    "score": {
      "type": "number",
      "default": 0
    },
    "daily_streak": {
      "type": "number",
      "default": 0,
      "description": "Current daily login streak"
    },
    "last_played_date": {
      "type": "string",
      "format": "date"
    }
  },
  "required": [
    "challenge_date"
  ]
}