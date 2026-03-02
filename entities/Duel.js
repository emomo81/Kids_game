export default {
  "name": "Duel",
  "type": "object",
  "properties": {
    "challenger_name": {
      "type": "string"
    },
    "challenger_score": {
      "type": "number",
      "default": 0
    },
    "challenger_email": {
      "type": "string"
    },
    "opponent_name": {
      "type": "string"
    },
    "opponent_score": {
      "type": "number",
      "default": 0
    },
    "opponent_email": {
      "type": "string"
    },
    "status": {
      "type": "string",
      "enum": [
        "open",
        "completed"
      ],
      "default": "open"
    },
    "level": {
      "type": "number",
      "default": 1
    },
    "winner_name": {
      "type": "string"
    },
    "problems": {
      "type": "array",
      "description": "Serialized list of problems for reproducibility",
      "items": {
        "type": "object"
      }
    }
  },
  "required": [
    "challenger_name",
    "level"
  ]
}