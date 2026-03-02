export default {
  "name": "PlayerProgress",
  "type": "object",
  "properties": {
    "current_level": {
      "type": "number",
      "default": 1,
      "description": "Current level the player is on"
    },
    "total_stars": {
      "type": "number",
      "default": 0,
      "description": "Total stars earned"
    },
    "problems_solved": {
      "type": "number",
      "default": 0,
      "description": "Total problems solved correctly"
    },
    "current_streak": {
      "type": "number",
      "default": 0,
      "description": "Current consecutive correct answers"
    },
    "best_streak": {
      "type": "number",
      "default": 0,
      "description": "Best streak ever achieved"
    },
    "badges": {
      "type": "array",
      "description": "List of earned badge names",
      "items": {
        "type": "string"
      }
    },
    "levels_completed": {
      "type": "array",
      "description": "List of completed level numbers",
      "items": {
        "type": "number"
      }
    },
    "level_stars": {
      "type": "object",
      "description": "Stars earned per level, e.g. {\"1\": 3, \"2\": 2}"
    },
    "avatar": {
      "type": "string",
      "description": "Selected avatar emoji or uploaded image URL"
    },
    "theme_color": {
      "type": "string",
      "description": "Chosen color theme key, e.g. 'indigo', 'rose'"
    }
  },
  "required": [
    "current_level"
  ]
}