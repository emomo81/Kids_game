export default {
  "name": "LeaderboardEntry",
  "type": "object",
  "properties": {
    "player_name": {
      "type": "string"
    },
    "player_email": {
      "type": "string"
    },
    "total_stars": {
      "type": "number",
      "default": 0
    },
    "problems_solved": {
      "type": "number",
      "default": 0
    },
    "best_streak": {
      "type": "number",
      "default": 0
    },
    "levels_completed": {
      "type": "number",
      "default": 0
    },
    "daily_streak": {
      "type": "number",
      "default": 0
    }
  },
  "required": [
    "player_name"
  ]
}